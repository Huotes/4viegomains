'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnEsc?: boolean
  closeOnBackdropClick?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnEsc = true,
  closeOnBackdropClick = true,
  className,
}: ModalProps): React.ReactElement | null {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === 'Escape') {
        onClose()
      }
    }

    const handleBackdropClick = (e: MouseEvent) => {
      if (
        closeOnBackdropClick &&
        modalRef.current &&
        e.target === modalRef.current
      ) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('mousedown', handleBackdropClick)

    // Prevent body scroll
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleBackdropClick)
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen, closeOnEsc, closeOnBackdropClick, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-shadow-black/60 backdrop-blur-sm animate-fade-in-up"
    >
      <div
        className={cn(
          'glass relative w-full rounded-lg border border-mist-green/30',
          'bg-gradient-to-b from-shadow-dark/80 to-shadow-dark',
          'shadow-2xl max-h-[90vh] overflow-y-auto',
          sizeClasses[size],
          'animate-fade-in-up',
          className
        )}
      >
        {/* Header */}
        {title && (
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-mist-green/20 bg-shadow-dark/50 px-6 py-4 backdrop-blur-sm">
            <h2 className="text-xl font-cinzel font-bold text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-mist-green transition-colors"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        )}

        {!title && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 text-gray-400 hover:text-mist-green transition-colors z-20"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        )}

        {/* Content */}
        <div className="px-6 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-mist-green/20 bg-shadow-dark/50 px-6 py-4 backdrop-blur-sm">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

interface ConfirmModalProps extends Omit<ModalProps, 'children'> {
  message: React.ReactNode
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'primary' | 'danger'
  onConfirm: () => void
  onCancel?: () => void
}

export function ConfirmModal({
  isOpen,
  onClose,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
  title = 'Confirm Action',
  ...props
}: ConfirmModalProps): React.ReactElement | null {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const handleCancel = () => {
    onCancel?.()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={title}
      size="sm"
      {...props}
      footer={
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            className={cn(
              'px-4 py-2 rounded-lg font-semibold transition-all duration-300',
              'text-gray-300 hover:text-mist-green hover:bg-shadow-light/40'
            )}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={cn(
              'px-4 py-2 rounded-lg font-semibold transition-all duration-300',
              confirmVariant === 'danger'
                ? 'bg-danger hover:bg-red-700 text-white'
                : 'bg-gradient-to-r from-mist-green to-mist-cyan text-shadow-black hover:shadow-lg'
            )}
          >
            {confirmText}
          </button>
        </div>
      }
    >
      <p className="text-gray-300">{message}</p>
    </Modal>
  )
}
