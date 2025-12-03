import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, Award, Shield, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileMenuProps {
  profile: {
    name: string;
    email: string;
  };
  isAdmin: boolean;
  canRequestCertificate: boolean;
  onSignOut: () => void;
  onEditProfile: () => void;
  onRequestCertificate: () => void;
}

export function ProfileMenu({
  profile,
  isAdmin,
  canRequestCertificate,
  onSignOut,
  onEditProfile,
  onRequestCertificate,
}: ProfileMenuProps) {
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full p-1 hover:bg-accent transition-colors">
          <Avatar className="h-10 w-10 cursor-pointer">
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {getInitials(profile.name || 'U')}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-medium">{profile.name}</span>
            <span className="text-xs text-muted-foreground">{profile.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onEditProfile}>
          <User className="w-4 h-4 mr-2" />
          View Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEditProfile}>
          <Settings className="w-4 h-4 mr-2" />
          Edit Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onRequestCertificate}
          disabled={!canRequestCertificate}
          className={!canRequestCertificate ? 'opacity-50' : ''}
        >
          <Award className="w-4 h-4 mr-2" />
          Get Certificate
          {!canRequestCertificate && (
            <span className="ml-auto text-xs text-muted-foreground">Complete course</span>
          )}
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/admin')}>
              <Shield className="w-4 h-4 mr-2" />
              Admin Dashboard
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut} className="text-destructive">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
