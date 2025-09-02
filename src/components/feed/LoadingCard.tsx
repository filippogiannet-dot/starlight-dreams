import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface LoadingCardProps {
  className?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({ className }) => {
  return (
    <Card className={cn("p-6 space-y-4 animate-breathe", className)}>
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-muted rounded-full loading-pulse" />
          <div className="h-6 w-20 bg-muted rounded-full loading-pulse" />
        </div>
        <div className="h-4 w-16 bg-muted rounded loading-pulse" />
      </div>

      {/* Image skeleton */}
      <div className="aspect-video bg-muted rounded-xl loading-pulse" />

      {/* Content skeleton */}
      <div className="space-y-2">
        <div className="h-6 bg-muted rounded loading-pulse w-3/4" />
        <div className="space-y-1">
          <div className="h-4 bg-muted rounded loading-pulse w-full" />
          <div className="h-4 bg-muted rounded loading-pulse w-2/3" />
        </div>
      </div>

      {/* Actions skeleton */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <div className="flex space-x-2">
          <div className="h-8 w-16 bg-muted rounded loading-pulse" />
          <div className="h-8 w-16 bg-muted rounded loading-pulse" />
        </div>
        <div className="h-10 w-24 bg-primary/20 rounded loading-pulse" />
      </div>
    </Card>
  );
};