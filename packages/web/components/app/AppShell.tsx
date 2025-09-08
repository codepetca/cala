'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from './ThemeToggle';
import { NavItems } from './NavItems';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export function AppShell({ children, title = 'Trip Planner' }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col overflow-y-auto border-r bg-card px-4 py-6">
          {/* Logo/Brand */}
          <div className="flex items-center px-2 mb-6">
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          </div>

          {/* Navigation */}
          <div className="flex flex-1 flex-col">
            <NavItems />
            
            <div className="mt-auto pt-4">
              <Separator className="mb-4" />
              <div className="flex justify-between items-center px-2">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline" 
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-50 h-8 w-8"
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Open sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="border-b p-6">
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-1 flex-col py-4">
            <NavItems variant="mobile" onNavigate={() => setSidebarOpen(false)} />
            
            <div className="mt-auto px-3 py-4">
              <Separator className="mb-4" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Top Navigation Bar */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-30 flex h-16 items-center border-b bg-background/80 backdrop-blur px-4 lg:px-6">
          {/* Mobile menu button space */}
          <div className="lg:hidden w-8"></div>
          
          {/* Page title or breadcrumb */}
          <div className="flex-1">
            <h2 className="text-lg font-medium text-foreground lg:block hidden">
              Dashboard
            </h2>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Desktop theme toggle */}
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}