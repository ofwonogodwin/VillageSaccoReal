import React from 'react'
import { AlertTriangle, Clock, CheckCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NotificationBannerProps {
  type: 'info' | 'warning' | 'success' | 'pending'
  title: string
  message: string
  className?: string
}

export function NotificationBanner({ type, title, message, className }: NotificationBannerProps) {
  const icons = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle,
    pending: Clock
  }

  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    pending: 'bg-orange-50 border-orange-200 text-orange-800'
  }

  const Icon = icons[type]

  return (
    <div className={cn(
      'border rounded-lg p-4 transition-all duration-200',
      styles[type],
      className
    )}>
      <div className="flex items-start">
        <Icon className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-medium text-sm mb-1">{title}</h3>
          <p className="text-sm opacity-90">{message}</p>
        </div>
      </div>
    </div>
  )
}
