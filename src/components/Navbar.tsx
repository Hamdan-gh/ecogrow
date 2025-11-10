import { Leaf, Award, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Profile } from '@/lib/types';

interface NavbarProps {
  user: Profile;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  isAdmin?: boolean;
}

export function Navbar({ user, currentPage, onNavigate, onLogout, isAdmin }: NavbarProps) {
  return (
    <nav className="bg-card shadow-card border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Leaf className="text-primary" size={32} />
            <span className="text-2xl font-bold text-foreground">EcoGrow</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant={currentPage === 'dashboard' ? 'default' : 'ghost'}
              onClick={() => onNavigate('dashboard')}
            >
              Dashboard
            </Button>
            <Button
              variant={currentPage === 'scan' ? 'default' : 'ghost'}
              onClick={() => onNavigate('scan')}
            >
              Scan Tree
            </Button>
            <Button
              variant={currentPage === 'marketplace' ? 'default' : 'ghost'}
              onClick={() => onNavigate('marketplace')}
            >
              Marketplace
            </Button>
            <Button
              variant={currentPage === 'orders' ? 'default' : 'ghost'}
              onClick={() => onNavigate('orders')}
            >
              My Orders
            </Button>
            {isAdmin && (
              <Button
                variant={currentPage === 'admin' ? 'default' : 'ghost'}
                onClick={() => onNavigate('admin')}
              >
                Admin
              </Button>
            )}
            <div className="bg-accent px-4 py-2 rounded-full flex items-center gap-2">
              <Award className="text-accent-foreground" size={18} />
              <span className="font-bold text-accent-foreground">{user?.eco_coins || 0}</span>
            </div>
            <Button variant="destructive" size="sm" onClick={onLogout}>
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
