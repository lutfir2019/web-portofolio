'use client'

import * as React from 'react'
import { toast, type ToastActionElement } from '@/components/ui/use-toast'
import type { ToastProps } from '@/components/ui/toast'

export type ToastIntent = 'success' | 'error' | 'info' | 'warning' | 'default'

const DEFAULT_TOAST_DURATION = 4000

const variantMap: Record<Exclude<ToastIntent, 'default'>, ToastProps['variant']> = {
  success: 'success',
  error: 'destructive',
  warning: 'warning',
  info: 'info',
}

export interface ToastOptions {
  duration?: number
  action?: ToastActionElement
  onOpenChange?: (open: boolean) => void
}

export function showToast(
  description: React.ReactNode,
  intent: ToastIntent = 'default',
  title?: string,
  options: ToastOptions = {},
) {
  return toast({
    title,
    description,
    variant: intent === 'default' ? 'default' : variantMap[intent],
    duration: options.duration ?? DEFAULT_TOAST_DURATION,
    action: options.action,
    open: true,
    onOpenChange: options.onOpenChange,
  })
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
