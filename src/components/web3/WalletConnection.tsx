"use client"

import { useState } from 'react'
import { useAccount, useConnect, useDisconnect, useBalance, useChainId } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WalletIcon } from '@/components/ui/wallet-icon'
import {
  Wallet,
  LogOut,
  Copy,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { formatEther, getContractAddress } from '@/lib/web3'

export function WalletConnection() {
  const { address, isConnected, isConnecting } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({ address })
  const chainId = useChainId()
  const [copiedAddress, setCopiedAddress] = useState(false)

  const contractAddress = getContractAddress(chainId)

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (!isConnected) {
    return (
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-blue-600" />
            <span>Connect Wallet</span>
          </CardTitle>
          <CardDescription>
            Connect your wallet to interact with the Village SACCO blockchain features
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!contractAddress && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Smart contract not deployed on this network
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {connectors.map((connector) => {
              // Determine wallet type and styling
              const getWalletInfo = (name: string) => {
                if (name.toLowerCase().includes('metamask')) {
                  return {
                    name: 'MetaMask',
                    className: 'hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700',
                    icon: '🦊'
                  }
                }
                if (name.toLowerCase().includes('coinbase')) {
                  return {
                    name: 'Coinbase Wallet',
                    className: 'hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700',
                    icon: '🔵'
                  }
                }
                if (name.toLowerCase().includes('walletconnect')) {
                  return {
                    name: 'Trust Wallet',
                    className: 'hover:bg-cyan-50 hover:border-cyan-300 hover:text-cyan-700',
                    icon: '🛡️'
                  }
                }
                return {
                  name: connector.name,
                  className: 'hover:bg-gray-50 hover:border-gray-300',
                  icon: '👛'
                }
              }

              const walletInfo = getWalletInfo(connector.name)

              return (
                <Button
                  key={connector.uid}
                  variant="outline"
                  className={`w-full justify-start transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group ${walletInfo.className}`}
                  onClick={() => connect({ connector })}
                  disabled={isPending || isConnecting}
                >
                  {(isPending || isConnecting) ? (
                    <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                  ) : (
                    <WalletIcon 
                      walletName={connector.name} 
                      className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" 
                    />
                  )}
                  <span className="font-medium">Connect with {walletInfo.name}</span>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-green-200 hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-green-600" />
            <span>Wallet Connected</span>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800 animate-pulse">
            Connected
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Address */}
          <div>
            <label className="text-sm font-medium text-gray-700">Address</label>
            <div className="flex items-center space-x-2 mt-1">
              <code className="flex-1 px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg text-sm hover:from-gray-100 hover:to-gray-150 transition-all duration-200">
                {formatAddress(address!)}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={copyAddress}
                className="flex items-center space-x-1 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
              >
                {copiedAddress ? (
                  <Check className="h-3 w-3 text-green-600 animate-bounce" />
                ) : (
                  <Copy className="h-3 w-3 hover:scale-110 transition-transform duration-200" />
                )}
              </Button>
            </div>
          </div>

          {/* Balance */}
          <div>
            <label className="text-sm font-medium text-gray-700">Balance</label>
            <div className="mt-1 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg hover:from-blue-100 hover:to-purple-100 transition-all duration-300">
              <span className="text-lg font-semibold text-blue-700">
                {balance ? parseFloat(formatEther(balance.value)).toFixed(4) : '0.0000'} {balance?.symbol || 'ETH'}
              </span>
            </div>
          </div>

          {/* Network Status */}
          <div>
            <label className="text-sm font-medium text-gray-700">Network</label>
            <div className="mt-1 flex items-center space-x-2">
              <Badge variant={contractAddress ? "default" : "destructive"} className="hover:scale-105 transition-transform duration-200">
                Chain ID: {chainId}
              </Badge>
              {contractAddress ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors duration-200">
                  Contract Available
                </Badge>
              ) : (
                <Badge variant="destructive" className="hover:bg-red-600 transition-colors duration-200">
                  No Contract
                </Badge>
              )}
            </div>
          </div>

          {/* Contract Address */}
          {contractAddress && (
            <div>
              <label className="text-sm font-medium text-gray-700">Contract</label>
              <div className="mt-1">
                <code className="text-xs bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-2 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all duration-200">
                  {formatAddress(contractAddress)}
                </code>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => disconnect()}
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Disconnect Wallet
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
