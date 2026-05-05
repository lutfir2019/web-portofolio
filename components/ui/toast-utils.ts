'use client'

import * as React from 'react'
import { toast as sonnerToast } from 'sonner'

export type ToastIntent = 'success' | 'error' | 'info' | 'warning' | 'default'

const DEFAULT_TOAST_DURATION = 4000

export interface ToastOptions {
  duration?: number
  action?: { label: string; onClick: () => void }
  onOpenChange?: (open: boolean) => void
}

export function showToast(
  description: React.ReactNode,
  intent: ToastIntent = 'default',
  title?: string,
  options: ToastOptions = {},
) {
  const toastOptions: any = {
    duration: options.duration ?? DEFAULT_TOAST_DURATION,
  }

  const message = title || description;
  if (title) {
    toastOptions.description = description;
  }

  if (options.action) {
    toastOptions.action = options.action;
  }

  switch (intent) {
    case 'success':
      return sonnerToast.success(message as any, toastOptions)
    case 'error':
      return sonnerToast.error(message as any, toastOptions)
    case 'warning':
      return sonnerToast.warning(message as any, toastOptions)
    case 'info':
      return sonnerToast.info(message as any, toastOptions)
    case 'default':
    default:
      return sonnerToast(message as any, toastOptions)
  }
}

export function toastSuccess(
  description: React.ReactNode,
  title: string = 'Success',
  options: ToastOptions = {},
) {
  return showToast(description, 'success', title, options)
}

export function toastError(
  description: React.ReactNode,
  title: string = 'Error',
  options: ToastOptions = {},
) {
  return showToast(description, 'error', title, options)
}

export function toastInfo(
  description: React.ReactNode,
  title: string = 'Info',
  options: ToastOptions = {},
) {
  return showToast(description, 'info', title, options)
}

export function toastWarning(
  description: React.ReactNode,
  title: string = 'Warning',
  options: ToastOptions = {},
) {
  return showToast(description, 'warning', title, options)
}
