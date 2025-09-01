import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, Search, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const BottomNav = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Plus, label: 'Create', path: '/create' },
    { icon: Search, label: 'Explore', path: '/explore' },
    { icon: Bell, label: 'Alerts', path: '/notifications' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-sm border-t border-border/50 pb-safe">
      <div className="flex items-center justify-around h-16 px-4">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex flex-col items-center justify-center space-y-1 px-2 py-2 rounded-xl smooth-transition min-w-[56px]',
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon 
                size={20} 
                className={cn(
                  'smooth-transition',
                  isActive && 'drop-shadow-glow'
                )} 
              />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;