
'use client';

import * as React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { SidebarTrigger } from '../ui/sidebar';

type PageHeaderProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
  showBackButton?: boolean;
};

export function PageHeader({ title, description, children, showBackButton = false }: PageHeaderProps) {
    const router = useRouter();
  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-background border-b sticky top-0 z-10 h-16">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        {showBackButton && (
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="hidden md:inline-flex">
                <ChevronLeft className="h-6 w-6" />
            </Button>
        )}
        <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            {description && <p className="text-sm text-muted-foreground hidden md:block">{description}</p>}
        </div>
      </div>
      {children && <div className="flex-shrink-0">{children}</div>}
    </div>
  );
}
