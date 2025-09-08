'use client';

import { Calendar, Home, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
  },
  {
    name: 'Trips',
    href: '/trips',
    icon: Calendar,
  },
  {
    name: 'Workspaces',
    href: '/workspaces',
    icon: Users,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

interface NavItemsProps {
  variant?: 'sidebar' | 'mobile';
  onNavigate?: () => void;
}

export function NavItems({ variant = 'sidebar', onNavigate }: NavItemsProps) {
  const pathname = usePathname();

  return (
    <nav className={cn(
      'space-y-1',
      variant === 'mobile' ? 'px-3 py-2' : 'px-2'
    )}>
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Button
            key={item.name}
            variant={isActive ? 'default' : 'ghost'}
            className={cn(
              'w-full justify-start gap-3',
              variant === 'mobile' ? 'h-12' : 'h-9',
              isActive 
                ? 'bg-primary text-primary-foreground shadow'
                : 'hover:bg-accent hover:text-accent-foreground'
            )}
            asChild
          >
            <Link href={item.href} onClick={onNavigate}>
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}