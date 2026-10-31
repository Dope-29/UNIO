import React, { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  icon?: React.ElementType;
  iconRight?: React.ElementType;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
  iconOnly?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  onClick,
  type = 'button',
  disabled,
  className = '',
  fullWidth,
  iconOnly,
}: ButtonProps) {
  const classes = [
    'btn',
    `btn-${variant}`,
    size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '',
    fullWidth ? 'w-full' : '',
    iconOnly ? 'btn-icon' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classes}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 16} />}
      {!iconOnly && children}
      {IconRight && <IconRight size={14} />}
    </button>
  );
}

