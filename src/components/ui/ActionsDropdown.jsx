import React, { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {Trash2, Edit3, Share, Archive, Ellipsis } from "lucide-react";

const ActionsDropdown = ({ onRename, onDelete }) => {
  const [open, setOpen] = useState(false);
  const removeSession = (id) => {
    setSessions(sessions.filter((session) => session.id !== id));
  };
  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button className="dark:text-zinc-400 dark:hover:text-gray-200 hover:bg-zinc-200 dark:hover:bg-neutral-700 px-0.5 rounded">
          <Ellipsis size={18} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[125px] bg-white text-neutral-500 dark:text-neutral-400 dark:bg-neutral-800 rounded-xl shadow-lg border border-gray-200 dark:border-neutral-700 p-1.5"
          sideOffset={5}
          align="start"
        >
          <DropdownMenu.Item
            onSelect={() => {
              onRename();
              setOpen(false);
            }}
            className="px-2.5 py-2 flex items-center cursor-pointer dark:hover:text-white dark:hover:bg-neutral-700 hover:text-neutral-800 hover:bg-neutral-100 outline-none focus:bg-gray-100 rounded rounded-t-lg"
          >
            <Share className="mr-2 w-4 h-5" />
            Share
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={() => {
              onRename();
              setOpen(false);
            }}
            className="px-2.5 py-2 flex items-center cursor-pointer dark:hover:text-white dark:hover:bg-neutral-700 hover:text-neutral-800 hover:bg-neutral-100 outline-none focus:bg-gray-100 rounded"
          >
            <Archive className="mr-2 w-4 h-5" />
            Archive
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={() => {
              onRename();
              setOpen(false);
            }}
            className="px-2.5 py-2 mb-2 flex items-center cursor-pointer dark:hover:text-white dark:hover:bg-neutral-700 hover:text-neutral-800 hover:bg-neutral-100 outline-none focus:bg-gray-100 rounded"
          >
            <Edit3 className="mr-2 w-4 h-5" />
            Rename
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-gray-200 dark:bg-neutral-700 my-1" />

          <DropdownMenu.Item
            onSelect={() => {
              onDelete(removeSession);
              setOpen(false);
            }}
            className="px-2.5 py-2 mt-2 flex items-center cursor-pointer dark:hover:text-red-50 dark:text-rose-600 dark:hover:bg-red-700 text-red-400 hover:text-red-600 hover:bg-red-50 outline-none focus:bg-red-50 rounded rounded-b-lg"
          >
            <Trash2 className="mr-2 w-4 h-4 " />
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default ActionsDropdown;
