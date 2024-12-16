import React from "react";
import { SquarePen } from "lucide-react";
import { CgSidebarRight } from "react-icons/cg";
import Tooltip from "../components/ui/Tooltip";
import ActionsDropdown from "./ui/ActionsDropdown";
import useAddSession from "./ui/useAddSession";

const Sidebar = ({ isSidebarOpen, toggleSidebar, isMobile }) => {
  const { sessions, addSession } = useAddSession();
  return (
    <>
      {/* Overlay for mobile screens */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`
          ${
            isMobile
              ? `fixed w-2/3 left-0 top-0 bottom-0 z-50 transform transition-transform duration-300 
               ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`
              : `${isSidebarOpen ? "w-52" : "w-0"} 
              ease-in-out transition-width duration-300`
          }
          md:bg-zinc-200 md:dark:bg-neutral-900 bg-white dark:bg-neutral-800 
          h-full md:shadow-inner md:shadow-neutral-600/50 shadow-2xl
        `}
      >
        <div className="py-2 px-1.5">
          {/* Sidebar Toggle Button */}
          <div className="p-0 flex justify-between items-center">
            <Tooltip content="Close Sidebar" placement="right">
              <button
                onClick={toggleSidebar}
                className="text-neutral-600 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-gray-200 dark:hover:bg-neutral-700 md:dark:hover:bg-neutral-800 dark:focus:ring-dark-600 p-0.5 hover:bg-zinc-300 focus:outline-none rounded-md"
              >
                <CgSidebarRight size={28} />
              </button>
            </Tooltip>
            <Tooltip content="New Chat" placement="bottom">
              <button
                onClick={addSession}
                className="text-neutral-600 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-gray-200 dark:hover:bg-neutral-700 md:dark:hover:bg-neutral-800 dark:focus:ring-dark-600 hover:duration-200 p-0.5 hover:bg-zinc-300 focus:outline-none rounded-md"
              >
                <SquarePen size={24} />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="mx-1 font-karla">
          <ul className="flex gap-1 flex-col overflow-y-auto max-h-[calc(100vh-60px)] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-400 hover:scrollbar-thumb-zinc-600 dark:scrollbar-track-transparent dark:scrollbar-thumb-neutral-600 dark:hover:scrollbar-thumb-neutral-400">
            {isSidebarOpen &&
              sessions.map((session) => (
                <>
                  <li
                    key={session.id}
                    className="rounded-lg flex justify-between px-1 hover:bg-gray-100 dark:hover:text-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-700 md:dark:hover:bg-neutral-800 flex items-center"
                  >
                    <div className="p-0.5 truncate">
                      <span>{session.name}</span>
                    </div>
                    <Tooltip content={"More Options"} placement="right">
                      <div aria-label="more" className="inline-flex">
                        <ActionsDropdown />
                      </div>
                    </Tooltip>
                  </li>
                </>
              ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
