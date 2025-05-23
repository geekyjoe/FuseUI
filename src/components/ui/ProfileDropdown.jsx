import { useNavigate } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  User,
  Settings,
  LogOut,
  CreditCard,
  LucideCircleUser,
} from "lucide-react";
import { useAuth } from "../../api/AuthContext";

const ProfileDropdown = ({
  onProfileClick,
  onSettingsClick,
  onBillingClick,
  onLogoutClick,
}) => {
  const { user, logout } = useAuth(); // Add this hook
  const Navigate = useNavigate();

  const handleProfileClick = () => {
    Navigate("/profile");
  };

  const handleLogout = async () => {
    try {
      await logout();
      if (onLogoutClick) {
        onLogoutClick();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="flex rounded-full focus:outline-hidden focus:ring-0 focus:ring-offset-0">
        <span className="p-1 sm:p-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-600 focus:outline-hidden focus:ring-1 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-gray-300">
          <LucideCircleUser size={24} />
        </span>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[150px] sm:min-w-[200px] bg-white text-neutral-500 dark:bg-neutral-700 dark:text-zinc-300 rounded-xl shadow-xl dark:shadow-2xl border 
          border-gray-200 dark:border-neutral-500 p-1.5 space-y-1 text-sm"
          sideOffset={5}
        >
          <DropdownMenu.Label className="px-2 py-2 text-xs text-gray-500 dark:text-zinc-200 font-normal">
            {user?.firstName} {user?.lastName}
            <div className="text-xs truncate text-gray-500 dark:text-zinc-200">
              {user?.email}
            </div>
            {/* <div className="text-xs truncate text-gray-500 dark:text-zinc-200">{user?.role}</div> */}
          </DropdownMenu.Label>

          <DropdownMenu.Separator className="h-px dark:bg-neutral-500 bg-gray-200 my-1" />

          <DropdownMenu.Item
            onSelect={handleProfileClick}
            className="relative flex select-none items-center px-2 py-2 
            rounded hover:text-neutral-800 hover:bg-gray-100 dark:hover:bg-zinc-600 dark:hover:text-gray-50 outline-hidden"
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenu.Item>

          <DropdownMenu.Item
            onSelect={() => onSettingsClick && onSettingsClick()}
            className="relative flex select-none items-center px-2 py-2 
            rounded hover:text-neutral-800 hover:bg-gray-100 dark:hover:bg-zinc-600 dark:hover:text-gray-50 outline-hidden"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenu.Item>

          <DropdownMenu.Item
            onSelect={() => onBillingClick && onBillingClick()}
            className="relative flex select-none items-center px-2 py-2 
            rounded hover:text-neutral-800 hover:bg-gray-100 dark:hover:bg-zinc-600 dark:hover:text-gray-50 outline-hidden"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Billing
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-gray-200 dark:bg-neutral-500 my-2" />

          <DropdownMenu.Item
            onSelect={handleLogout}
            className="relative flex select-none items-center px-2 py-2 
            rounded rounded-b-lg hover:bg-red-100 dark:hover:bg-red-500 outline-hidden text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-100"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default ProfileDropdown;
