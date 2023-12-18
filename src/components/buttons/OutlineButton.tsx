import { ButtonHTMLAttributes, ReactNode } from 'react';
import { BUTTON_SIZE } from '.';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

function OutlineButton({ children, onClick, disabled, size = 'md' }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`button flex-center bg-gray-1 text-primary ${BUTTON_SIZE[size]} border-solid-gray disabled:bg-gray-4 disabled:text-white`}
    >
      {children}
    </button>
  );
}

export default OutlineButton;
