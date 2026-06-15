import React from 'react';

export default function GradientText({ children, className = '', as: Component = 'span' }) {
  return (
    <Component className={`gradient-text ${className}`}>
      {children}
    </Component>
  );
}
