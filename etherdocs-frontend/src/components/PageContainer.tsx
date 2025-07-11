
import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

const PageContainer = ({ children, title, subtitle, className = '' }: PageContainerProps) => {
  return (
    <div className={`py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto ${className}`}>
      {(title || subtitle) && (
        <div className="text-center mb-12">
          {title && <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{title}</h1>}
          {subtitle && <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export default PageContainer;
