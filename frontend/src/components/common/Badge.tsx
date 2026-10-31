import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
}

export default function Badge({ status, className = '' }: BadgeProps) {
  const key = status.toLowerCase().replace(/\s+/g, '-');
  return (
    <span className={`badge badge-${key} ${className}`}>
      {status}
    </span>
  );
}

