import { UserCircle, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { cn } from '../lib/utils';

function ProfileDropdown({ user, collapsed, isMobile, closeMobile, roleColor }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleProfile = () => {
    navigate(`/${user.role}/profile`);
    if (isMobile) closeMobile();
  };

  const handleLogout = () => {
    logout();
    if (isMobile) closeMobile();
  };

  if (collapsed && !isMobile) {
    // Collapsed state - show just avatar as dropdown trigger
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto p-2 hover:bg-sidebar-acent justify-center"
          >
            <Avatar className="h-7 w-7">
              {user.profilePhoto?.url ? (
                <AvatarImage src={user.profilePhoto.url} alt={user.fullName} />
              ) : null}
              <AvatarFallback className={cn(roleColor.bg, 'text-white text-xs font-bold shrink-0')}>
                {user.fullName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="right" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.fullName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleProfile}>
            <UserCircle className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start p-2 h-auto hover:bg-sidebar-accent"
        >
          <div className="flex items-center gap-3 w-full">
            <Avatar className="h-8 w-8 shrink-0">
              {user.profilePhoto?.url ? (
                <AvatarImage src={user.profilePhoto.url} alt={user.fullName} />
              ) : null}
              <AvatarFallback className={cn(roleColor.bg, 'text-white text-xs font-bold')}>
                {user.fullName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{user.fullName}</p>
              <p className="text-xs text-muted-foreground capitalize">{roleColor.label}</p>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfile}>
          <UserCircle className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ProfileDropdown;
