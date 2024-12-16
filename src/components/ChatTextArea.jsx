import React, { useState, useRef, useEffect } from "react";
import { ArrowUpCircleIcon, ArrowUpSquare, Copyright } from "lucide-react";
import { Icon } from "@iconify/react/dist/iconify.js";

const ChatTextArea = ({ onSendMessage }) => {
  const [inputMessage, setInputMessage] = useState("");
  const textareaRef = useRef(null);

  // Automatically adjust textarea height dynamically
  useEffect(() => {
    const adjustTextareaHeight = () => {
      if (textareaRef.current) {
        // Reset height to auto to calculate the correct scrollHeight
        textareaRef.current.style.height = "auto";

        // Set height based on scrollHeight, with a max height
        const scrollHeight = textareaRef.current.scrollHeight;
        textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
      }
    };

    adjustTextareaHeight();
  }, [inputMessage]);

  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return;

    // Create a new message object
    const newMessage = {
      id: Date.now(), // unique id
      text: inputMessage,
      sender: "user", // could be 'user' or 'bot'
    };

    // Call the onSendMessage prop with the new message
    onSendMessage(newMessage);

    // Clear the input field and reset textarea height
    setInputMessage("");
  };

  const handleKeyPress = (event) => {
    // Allow sending message with Shift+Enter, prevent default newline
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col px-2 bottom-0 w-full justify-center">
      <div className="flex bg-stone-200 duration-300 m-2 dark:bg-neutral-600 w-full sm:w-4/5 lg:w-2/5 p-0.5 rounded-lg mx-auto">
        <div className="flex duration-300 w-full">
          <textarea
            ref={textareaRef}
            name="text"
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
            }}
            onKeyPress={handleKeyPress}
            placeholder="Message..."
            rows={1}
            className="
                p-4 
                placeholder:select-none
                placeholder:text-gray-500 
                placeholder:dark:text-gray-300 
                bg-stone-200 
                dark:bg-neutral-600
                resize-none 
                duration-300
                w-full 
                border-none 
                rounded-lg 
                focus:outline-none 
                focus:border-indigo-500 
                focus:ring-indigo-500 
                focus:ring-none 
                sm:text-sm
                h-auto
                min-h-[40px]
                max-h-[120px]
                overflow-y-auto
              "
          />
        </div>
        <div className="p-1 flex items-center">
          <button
            onClick={handleSendMessage}
            className="
                text-stone-200 
                bg-stone-800 
                dark:text-neutral-600 
                dark:bg-stone-200 
                m-0 
                p-0
                duration-100 
                hover:bg-stone-500 
                dark:hover:bg-stone-50 
                rounded-full 
                focus:ring-none 
                focus-visible:ring-none 
                focus-visible:ring-blue-500
                flex items-center justify-center
              "
          >
            <Icon icon="mdi:send-circle" width="40" height="40" />
          </button>
        </div>
      </div>
      <div className="font-karla mb-1 grid justify-center text-xs">
        <p className="inline-flex items-center gap-1">
          <Copyright size={10} /> This is a Clone of ChatGPT UI made from scratch in React
        </p>
      </div>
    </div>
  );
};

export default ChatTextArea;
