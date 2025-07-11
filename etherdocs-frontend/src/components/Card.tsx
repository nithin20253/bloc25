
import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className }: CardProps) => {
  return (
    <div className={cn("bg-white rounded-lg shadow-md overflow-hidden border border-gray-100", className)}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className }: CardProps) => {
  return <div className={cn("border-b border-gray-100 p-6", className)}>{children}</div>;
};

const CardTitle = ({ children, className }: CardProps) => {
  return <h3 className={cn("text-lg font-medium leading-6 text-gray-900", className)}>{children}</h3>;
};

const CardDescription = ({ children, className }: CardProps) => {
  return <p className={cn("mt-1 text-sm text-gray-500", className)}>{children}</p>;
};

const CardContent = ({ children, className }: CardProps) => {
  return <div className={cn("p-6 pt-4", className)}>{children}</div>;
};

const CardFooter = ({ children, className }: CardProps) => {
  return <div className={cn("bg-gray-50 px-6 py-4 border-t border-gray-100", className)}>{children}</div>;
};

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
