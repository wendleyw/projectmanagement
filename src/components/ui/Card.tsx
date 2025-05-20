import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8',
  };

  const classes = `
    bg-white rounded-lg shadow-sm border border-gray-200
    ${paddingClasses[padding]}
    ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''}
    ${className}
  `;

  return <div className={classes}>{children}</div>;
};

export default Card;