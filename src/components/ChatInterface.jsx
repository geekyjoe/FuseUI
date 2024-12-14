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
import { BulbOutlined, CodeOutlined, FileImageOutlined, FileTextFilled } from "@ant-design/icons";
import { ImImage } from "react-icons/im";

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

    return (
     <BotMessageComponent
      displayedText={displayedText}
      />
    );
  }
);

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const windowHeight = useWindowHeight();
  const { botMessages, isLoading, error } = useBotMessages();
  const messagesEndRef = useRef(null);

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
    [findBotResponse, isLoading, scrollToBottom]
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
      <div className="flex-grow overflow-y-auto mr-0.5 px-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        <div className="max-w-lg w-5/6 py-2 lg:w-4/5 mx-auto">
          <div className="flex flex-col gap-2">
            <div className=" ">
              <div id="chatHeader" className="row-start-1 flex my-10 justify-center">
                <h2 className="text-lg dark:text-white text-black">Here lies Logo</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-1 place-items-center my-10 gap-4">
                <button className="md:flex md:flex-col h-fit w-40 md:w-fit p-2.5 md:p-2 rounded-full md:rounded-xl border-solid border dark:border-2 dark:border-neutral-600 hover:bg-zinc-100 dark:hover:bg-zinc-700">
                  <CodeOutlined size={20} className="text-zinc-500 dark:text-zinc-300 p-0.5 md:mb-1" />
                  <span className="text-sm md:text-left text-center md:m-0 ml-1">Write a Code</span>
                </button>
                <button className="md:flex md:flex-col h-fit w-40 md:w-fit p-2.5 md:p-2 rounded-full md:rounded-xl border-solid border dark:border-2 dark:border-neutral-600 hover:bg-zinc-100 dark:hover:bg-zinc-700">
                  <BulbOutlined size={20} className="text-amber-500 p-0.5 md:mb-1" />
                  <span className="text-sm md:text-left text-center md:m-0 ml-1">Make a Plan</span>
                </button>
                <button className="md:flex md:flex-col h-fit w-40 md:w-fit p-2.5 md:p-2 rounded-full md:rounded-xl border-solid border dark:border-2 dark:border-neutral-600 hover:bg-zinc-100 dark:hover:bg-zinc-700">
                  <FileImageOutlined size={20} className="text-teal-500 p-0.5 md:mb-1" />
                  <span className="text-sm md:text-left text-center md:m-0 ml-1">Generate Image</span>
                </button>
                <button className="md:flex md:flex-col h-fit w-40 md:w-fit p-2.5 md:p-2 rounded-full md:rounded-xl border-solid border dark:border-2 dark:border-neutral-600 hover:bg-zinc-100 dark:hover:bg-zinc-700">
                  <FileTextFilled  size={20} className="text-teal-500 p-0.5 md:mb-1" />
                  <span className="text-sm md:text-left text-center md:m-0 ml-1">Write an Letter</span>
                </button>
              </div>
            </div>
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
