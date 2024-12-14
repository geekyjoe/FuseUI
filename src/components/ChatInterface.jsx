import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import ChatTextArea from "./ChatTextArea";
import BotMessageLoader from "./ui/Loader";
import BotMessageComponent from "./BotMessageComponent";
import Logo from "./ui/SLogo";
import {
  BulbFilled,
  BulbOutlined,
  CodeFilled,
  CodeOutlined,
} from "@ant-design/icons";
import { IoImageOutline, IoImage } from "react-icons/io5";
import { LuTextQuote } from "react-icons/lu";
import { TbTextCaption } from "react-icons/tb";

// Custom hook for window height (unchanged)
const useWindowHeight = () => {
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return windowHeight;
};

// Custom hook for text typing effect
const useTypewriterEffect = (text, speed = 5, scrollToBottom) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;

    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
        if (scrollToBottom) {
          scrollToBottom();
        }
      } else {
        clearInterval(typingInterval);
        setIsComplete(true);
      }
    }, speed);

    return () => clearInterval(typingInterval);
  }, [text, speed, scrollToBottom]);

  return { displayedText, isComplete };
};

const useBotMessages = () => {
  const [botMessages, setBotMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    const loadBotMessages = async () => {
      try {
        // Dynamically import messages from JSON file
        const messagesModule = await import("../assets/messages.json");

        // Handle different possible JSON structures with more robust parsing
        let importedMessages = [];

        // Check different possible message formats
        if (Array.isArray(messagesModule.default)) {
          importedMessages = messagesModule.default;
        } else if (
          messagesModule.default?.messages &&
          Array.isArray(messagesModule.default.messages)
        ) {
          importedMessages = messagesModule.default.messages;
        } else if (
          typeof messagesModule.default === "object" &&
          Object.keys(messagesModule.default).length > 0
        ) {
          // If it's an object, try to extract message-like properties
          importedMessages = Object.values(messagesModule.default).filter(
            (item) => item && typeof item === "object" && "text" in item
          );
        }

        // Validate and process messages
        const processedMessages = importedMessages
          .map((msg, index) => ({
            id: msg.id ?? index + 1,
            text: msg.text ?? "",
            keywords: msg.keywords ?? [],
          }))
          .filter((msg) => msg.text.trim() !== "");

        // Set messages and trigger scroll
        setBotMessages(processedMessages);
        setIsLoading(false);

        // Scroll to bottom after messages are loaded
        scrollToBottom();
      } catch (err) {
        console.error("Error loading bot messages:", err);
        setError(
          err instanceof Error ? err : new Error("Unknown error occurred")
        );
        setIsLoading(false);
      }
    };

    loadBotMessages();
  }, [scrollToBottom()]);

  // Function to add a new message and scroll to bottom
  const addMessage = useCallback(
    (newMessage) => {
      setBotMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, newMessage];

        // Use setTimeout to ensure DOM update before scrolling
        setTimeout(scrollToBottom, 100);

        return updatedMessages;
      });
    },
    [scrollToBottom]
  );

  // Function to clear all messages
  const clearMessages = useCallback(() => {
    setBotMessages([]);
  }, []);

  return {
    botMessages,
    isLoading,
    error,
    messagesEndRef,
    addMessage,
    clearMessages,
    scrollToBottom,
  };
};

const BotMessageWithFooter = React.memo(
  ({ message, isTyping = false, scrollToBottom }) => {
    // If it's a typing indicator, show the loader
    if (isTyping) {
      return <BotMessageLoader />;
    }

    const { displayedText, isComplete } = useTypewriterEffect(
      message.text,
      5,
      scrollToBottom
    );
    const [showFooter, setShowFooter] = useState(false);

    useEffect(() => {
      if (isComplete) {
        const timer = setTimeout(() => {
          setShowFooter(true);
          scrollToBottom();
        }, 750); // Small delay after text is fully typed

        return () => clearTimeout(timer);
      }
    }, [isComplete, scrollToBottom]);

    return <BotMessageComponent displayedText={displayedText} />;
  }
);

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [showChatHeader, setShowChatHeader] = useState(true);
  const windowHeight = useWindowHeight();
  const { botMessages, isLoading, error } = useBotMessages();
  const messagesEndRef = useRef(null);
  const [hoveredButtons, setHoveredButtons] = useState({});

  const buttons = [
    {
      id: "code",
      label: "Write a Code",
      icon: { outlined: CodeOutlined, filled: CodeFilled },
      iconClassName: 'text-zinc-500 dark:text-zinc-300',
    },
    {
      id: "plan",
      label: "Make a Plan",
      icon: { outlined: BulbOutlined, filled: BulbFilled },
      iconClassName: 'text-amber-500',
    },
    {
      id: "image",
      label: "Generate Image",
      icon: { outlined: IoImageOutline, filled: IoImage },
      iconClassName: 'text-green-500',
    },
    {
      id: "pen",
      label: "Write an Letter",
      icon: { outlined: TbTextCaption, filled: LuTextQuote },
      iconClassName: 'text-teal-500',
    },
  ];

  const handleMouseEnter = (id) => {
    setHoveredButtons((prev) => ({ ...prev, [id]: true }));
  };

  const handleMouseLeave = (id) => {
    setHoveredButtons((prev) => ({ ...prev, [id]: false }));
  };

  // Improved bot response finding logic
  const findBotResponse = useCallback(
    (userMessage) => {
      if (!botMessages || botMessages.length === 0) return null;

      // Find a response based on keywords
      const lowercaseUserMessage = userMessage.text.toLowerCase();

      return (
        botMessages.find((botMsg) =>
          botMsg.keywords.some((keyword) =>
            lowercaseUserMessage.includes(keyword.toLowerCase())
          )
        ) || botMessages[0]
      ); // Default to first message if no match
    },
    [botMessages]
  );

  // Scroll to bottom whenever messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = useCallback(
    (newMessage) => {
      if (isLoading) {
        console.warn("Messages are still loading. Please wait.");
        return;
      }

      // Remove chatHeader when first message is sent
      if (showChatHeader) {
        setShowChatHeader(false);
      }

      const userMessageWithSender = {
        ...newMessage,
        sender: "user",
      };

      setMessages((prevMessages) => [...prevMessages, userMessageWithSender]);

      // Show typing indicator
      const typingIndicator = {
        id: Date.now() + 1,
        text: "typing...",
        sender: "bot",
        isTyping: true,
      };

      setMessages((prevMessages) => [...prevMessages, typingIndicator]);

      const botResponse = findBotResponse(newMessage);

      if (botResponse) {
        setTimeout(() => {
          // Replace typing indicator with the actual message
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            updatedMessages.pop(); // Remove typing indicator
            updatedMessages.push({
              id: Date.now() + 2,
              text: botResponse.text,
              sender: "bot",
            });
            scrollToBottom();
            return updatedMessages;
          });
        }, 5000); // Simulate delay for typing effect
      }
    },
    [findBotResponse, isLoading, scrollToBottom, showChatHeader]
  );

  // Memoize message rendering for performance
  const renderedMessages = useMemo(
    () =>
      messages.map((message) => {
        if (message.sender === "user") {
          // Render user message
          return (
            <div key={message.id} className="flex justify-end">
              <div className="bg-stone-600 text-white p-3 rounded-lg max-w-[80%] break-words lg:text-base/7 sm:text-sm/7 shadow-sm">
                {message.text}
              </div>
            </div>
          );
        } else {
          // Render bot message with typing effect
          return (
            <BotMessageWithFooter
              key={message.id}
              message={message}
              isTyping={message.isTyping}
              scrollToBottom={scrollToBottom}
            />
          );
        }
      }),
    [messages, scrollToBottom]
  );

  // Render loading or error states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading messages...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        Error loading chat: {error.message}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: `${windowHeight}px` }}
    >
      {/* Messages container with scrolling */}
      <div className="flex-grow overflow-y-auto mr-0.5 px-0 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {showChatHeader && (
          <div id="chatHeader" className="max-w-2xl w-fit mx-auto my-8">
            <div className="row-start-1 my-6 place-items-center">
              <Logo height={50} width={50} className="" />
              <h2 className="text-xl font-karla dark:text-white text-black mt-5">
                Hello there, How may I Help You?
              </h2>
            </div>
            <div className="flex flex-col md:flex-row place-items-center gap-1 text-neutral-600 dark:text-neutral-300">
              {buttons.map((button) => {
                const IconOutlined = button.icon.outlined;
                const IconFilled = button.icon.filled;

                return (
                  <button
                    key={button.id}
                    className="h-fit w-[170px] md:w-fit text-nowrap text-left p-2 rounded-full border-solid border hover:text-neutral-900 dark:hover:text-neutral-50 dark:border-2 dark:border-neutral-600 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    onMouseEnter={() => handleMouseEnter(button.id)}
                    onMouseLeave={() => handleMouseLeave(button.id)}
                  >
                    {hoveredButtons[button.id] ? (
                      <IconFilled className={`inline-flex p-0.5 h-5 w-5 ${button.iconClassName}`} />
                    ) : (
                      <IconOutlined className={`inline-flex p-0.5 h-5 w-5 ${button.iconClassName}`} />
                    )}
                    <span className="text-sm p-1 inline-flex">
                      {button.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <div className="max-w-xl w-full p-2 md:w-4/5 mx-auto">
          <div className="flex flex-col gap-2">
            {/* Messages area */}
            {renderedMessages}
            {/* Dummy div to scroll to bottom */}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Separated ChatTextArea component */}
      <ChatTextArea onSendMessage={handleSendMessage} />
    </div>
  );
};

export default React.memo(ChatInterface);
