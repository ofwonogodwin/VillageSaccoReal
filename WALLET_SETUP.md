# Wallet Configuration Guide

## Supported Wallets

The Village SACCO system supports three specific wallet providers:

### 1. MetaMask 🦊
- **Most Popular**: Browser extension and mobile app
- **Installation**: Visit [metamask.io](https://metamask.io)
- **Features**: Built-in support, no additional configuration needed

### 2. Coinbase Wallet 🔵
- **User Friendly**: Easy onboarding for new users
- **Installation**: Visit [wallet.coinbase.com](https://wallet.coinbase.com)
- **Features**: Integrated with Coinbase exchange

### 3. Trust Wallet 🛡️
- **Mobile First**: Popular mobile wallet
- **Connection**: Via WalletConnect protocol
- **Features**: Multi-chain support, DeFi integration

## Setup Instructions

### For Developers

1. **Get WalletConnect Project ID**:
   - Visit [cloud.walletconnect.com](https://cloud.walletconnect.com)
   - Create a new project
   - Copy your Project ID
   - Update `.env` file:
     ```
     NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your-project-id-here"
     ```

2. **Configure App Metadata**:
   - Update app name, description, and icons in `src/lib/web3.ts`
   - Ensure proper domain and icon URLs are set

### For Users

1. **Install Your Preferred Wallet**:
   - Download from official sources only
   - Set up your wallet with a secure seed phrase
   - Fund your wallet with test ETH for testing

2. **Connect to Village SACCO**:
   - Click "Connect Wallet" button
   - Choose your preferred wallet from the three options
   - Follow the connection prompts
   - Approve the connection in your wallet

3. **Switch Networks** (if needed):
   - The app supports multiple networks
   - Switch to the correct network in your wallet
   - Supported networks: Ethereum Mainnet, Sepolia Testnet, Polygon Mumbai

## Security Best Practices

- ✅ Only connect wallets you control
- ✅ Verify website URL before connecting
- ✅ Review transaction details before signing
- ✅ Keep your seed phrase secure and private
- ✅ Use test networks for development
- ❌ Never share your private keys
- ❌ Don't connect to unknown websites
- ❌ Don't click suspicious transaction prompts

## Troubleshooting

### Connection Issues
- Ensure your wallet is unlocked
- Check if you're on the correct network
- Try refreshing the page and reconnecting
- Clear browser cache if using browser extension

### Transaction Failures
- Check if you have sufficient gas fees
- Verify you're connected to the correct network
- Ensure the smart contract is deployed on your network
- Wait for network congestion to clear

### Network Issues
- Add the correct network to your wallet manually
- Verify RPC URLs are correct
- Check if the network is experiencing issues

## Contact Support

If you experience issues:
1. Check this guide first
2. Verify your wallet and network setup
3. Contact the development team with specific error messages
4. Include your wallet address (public) and transaction hashes for investigation
