'use client';

import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export interface AlertProps {
  type: 'error' | 'success' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDuration?: number;
}

export function Alert({
  type,
  title,
  message,
  onClose,
  autoClose = false,
  autoCloseDuration = 5000,
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, autoCloseDuration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDuration, isVisible, onClose]);

  if (!isVisible) return null;

  const styles = {
    error: {
      bg: 'bg-destructive/10',
      border: 'border-destructive/30',
      icon: 'text-destructive',
      title: 'text-destructive',
      text: 'text-destructive',
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-950/20',
      border: 'border-green-200 dark:border-green-800',
      icon: 'text-green-600 dark:text-green-400',
      title: 'text-green-900 dark:text-green-100',
      text: 'text-green-800 dark:text-green-200',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
      title: 'text-blue-900 dark:text-blue-100',
      text: 'text-blue-800 dark:text-blue-200',
    },
  };

  const style = styles[type];
  const Icon = type === 'error' ? AlertCircle : type === 'success' ? CheckCircle : Info;

  return (
    <div className={`${style.bg} border ${style.border} rounded-lg p-4 flex gap-3`}>
      <Icon className={`${style.icon} flex-shrink-0 mt-0.5`} size={20} />
      <div className="flex-1">
        {title && <p className={`${style.title} font-semibold text-sm mb-1`}>{title}</p>}
        <p className={`${style.text} text-sm`}>{message}</p>
      </div>
      {onClose && (
        <button
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          className="text-foreground/40 hover:text-foreground flex-shrink-0"
          aria-label="Close alert"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

export function ErrorAlert({ message, onClose }: { message: string; onClose?: () => void }) {
  return <Alert type="error" message={message} onClose={onClose} />;
}

export function SuccessAlert({ message, onClose, autoClose = true }: { message: string; onClose?: () => void; autoClose?: boolean }) {
  return <Alert type="success" message={message} onClose={onClose} autoClose={autoClose} />;
}

export function InfoAlert({ message, onClose }: { message: string; onClose?: () => void }) {
  return <Alert type="info" message={message} onClose={onClose} />;
}
