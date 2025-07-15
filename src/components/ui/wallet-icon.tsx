import React from 'react'

interface WalletIconProps {
  walletName: string
  className?: string
}

export function WalletIcon({ walletName, className = "w-6 h-6" }: WalletIconProps) {
  const getWalletIcon = (name: string) => {
    const lowerName = name.toLowerCase()

    if (lowerName.includes('metamask')) {
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M21.5 12.5L19 8L17 11L19.5 13.5L21.5 12.5Z" fill="#E17726" />
          <path d="M2.5 12.5L5 8L7 11L4.5 13.5L2.5 12.5Z" fill="#E17726" />
          <path d="M12 20L15 16L12 13L9 16L12 20Z" fill="#F6851B" />
          <path d="M12 4L15 8L17 11L12 13L7 11L9 8L12 4Z" fill="#E17726" />
        </svg>
      )
    }

    if (lowerName.includes('coinbase')) {
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" fill="#0052FF" />
          <rect x="8" y="10" width="8" height="4" rx="2" fill="white" />
        </svg>
      )
    }

    if (lowerName.includes('trust') || lowerName.includes('walletconnect')) {
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L3 7V12C3 16.55 6.84 20.74 9 21C11.16 20.74 21 16.55 21 12V7L12 2Z" fill="#3375BB" />
        </svg>
      )
    }

    // Default wallet icon
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 18V19C21 20.1 20.1 21 19 21H5C3.89 21 3 20.1 3 19V5C3 3.9 3.89 3 5 3H19C20.1 3 21 3.9 21 5V6H12C10.89 6 10 6.9 10 8V16C10 17.1 10.89 18 12 18H21ZM12 16H22V8H12V16ZM16 13.5C16.83 13.5 17.5 12.83 17.5 12S16.83 10.5 16 10.5 14.5 11.17 14.5 12 15.17 13.5 16 13.5Z" />
      </svg>
    )
  }

  return getWalletIcon(walletName)
}
