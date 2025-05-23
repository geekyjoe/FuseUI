import React, { useState } from "react";
import { Icon } from "@iconify/react";
import Tooltip from "../components/ui/Tooltip";
import FeedbackDialog from "./FeedbackDialog";
import { toast } from "sonner";

const BotMessageComponent = ({ displayedText }) => {
  const [showFooter, setShowFooter] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyText = () => {
    // Copy text to clipboard
    navigator.clipboard
      .writeText(displayedText)
      .then(() => {
        // Show toast notification on successful copy
        toast.success("Message copied to clipboard");
        // Show check icon
        setIsCopied(true);

        // Revert back to copy icon after 2 seconds
        setTimeout(() => {
          setIsCopied(false);
        }, 3500);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        toast.error("Failed to copy message");
      });
  };

  return (
    <div className="flex justify-start">
      <div
        className="bot-bubble text-black dark:text-white p-1 break-words"
        onMouseEnter={() => setShowFooter(true)}
        onMouseLeave={() => setShowFooter(true)}
      >
        {/* Bot header with gradient star icon */}
        <div className="bot-header mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            height="25"
            fill="currentColor"
            className="bi bi-stars"
            viewBox="0 0 16 16"
          >
            <defs>
              <linearGradient
                id="gradient-fill"
                x1="20%"
                y1="50%"
                x2="100%"
                y2="75%"
              >
                <stop
                  offset="0%"
                  style={{ stopColor: "#bda0de", stopOpacity: 1 }}
                />
                <stop
                  offset="50%"
                  style={{ stopColor: "#867fea", stopOpacity: 1 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: "#5272f2", stopOpacity: 1 }}
                />
              </linearGradient>
            </defs>
            <path
              fill="url(#gradient-fill)"
              d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828zM3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387A1.73 1.73 0 0 0 4.593 5.69l-.387 1.162a.217.217 0 0 1-.412 0L3.407 5.69A1.73 1.73 0 0 0 2.31 4.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.73 1.73 0 0 0 3.407 2.31zM10.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732L9.1 2.137a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z"
            />
          </svg>
        </div>

        {/* Bot message content */}
        <div className="bot-message p-1 lg:text-base/7 sm:text-sm/7">
          {displayedText}
        </div>

        {/* Footer with interaction options */}
        {showFooter && (
          <div className="bot-footer pt-2 flex items-center animate-scaleIT">
            <Tooltip content={isCopied ? "Copied" : "Copy"} placement="bottom">
              <div
                className="msg-opt hover:bg-zinc-200 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-zinc-700 p-1 mr-1 rounded-sm cursor-pointer"
                onClick={handleCopyText}
              >
                {isCopied ? (
                  <Icon className="animate-pulse motion-reduce" icon="line-md:check-all" width="20" height="20" />
                ) : (
                  <Icon icon="fluent:copy-24-regular" width="20" height="20" />
                )}
              </div>
            </Tooltip>
            <Tooltip content="Good Response" placement="bottom">
              <div className="like-btn hover:bg-zinc-200 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-zinc-700 mr-1 rounded-sm cursor-pointer">
                <FeedbackDialog isLike={true} />
              </div>
            </Tooltip>
            <Tooltip content="Bad Response" placement="bottom">
              <div className="dislike-btn hover:bg-zinc-200 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-zinc-700 rounded-sm cursor-pointer">
                <FeedbackDialog isLike={false} />
              </div>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
};

export default BotMessageComponent;
