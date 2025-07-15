# Smart Contract Deployment Guide

## Prerequisites

1. **Base Sepolia Testnet ETH**: You need Base Sepolia testnet ETH to deploy the contract
   - Get Base Sepolia ETH from the official Base faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
   - Or bridge ETH from Ethereum Sepolia to Base Sepolia using the Base bridge

2. **Private Key**: You need the private key of a wallet with Base Sepolia ETH

## Step-by-Step Deployment

### Step 1: Set up Environment Variables

1. Open your `.env` file
2. Add your private key to the `PRIVATE_KEY` field:
   ```
   PRIVATE_KEY="your_wallet_private_key_here"
   ```

   **⚠️ IMPORTANT SECURITY NOTES:**
   - Never commit your private key to version control
   - Use a dedicated deployment wallet, not your main wallet
   - Keep your private key secure and private

### Step 2: Get Base Sepolia ETH

1. Visit the Base faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
2. Connect your wallet and request testnet ETH
3. Alternatively, if you have Ethereum Sepolia ETH, bridge it to Base Sepolia using: https://bridge.base.org/

### Step 3: Deploy the Contract

Run the deployment command:

```bash
npx hardhat run scripts/deploy.js --network baseSepolia
```

### Step 4: Update Contract Address

After successful deployment:

1. The script will output the deployed contract address
2. Copy this address and update your `.env` file:
   ```
   NEXT_PUBLIC_SACCO_CONTRACT_ADDRESS="deployed_contract_address_here"
   ```

3. Also update the contract address in `/src/lib/web3.ts`

### Step 5: Verify Contract (Optional)

To verify your contract on Basescan:

1. Get a Basescan API key from: https://basescan.org/apis
2. Add it to your `.env`:
   ```
   BASESCAN_API_KEY="your_api_key_here"
   ```
3. Update hardhat.config.js to include Basescan verification
4. Run verification command

## Troubleshooting

### Common Issues:

1. **Insufficient funds**: Make sure you have enough Base Sepolia ETH
2. **Network issues**: Check your internet connection and RPC URL
3. **Private key format**: Ensure your private key is in the correct format (64 characters, no 0x prefix in .env)

### Error Solutions:

- **"insufficient funds for intrinsic transaction cost"**: Get more Base Sepolia ETH
- **"nonce too high"**: Reset your wallet's transaction history in MetaMask
- **"execution reverted"**: Check the contract code for any deployment issues

## Post-Deployment

1. Update all contract addresses in your environment files
2. Test the deployed contract with your frontend
3. Verify all wallet connections work with the deployed contract
4. Test all SACCO features (savings, loans, governance)

## Security Checklist

- [ ] Private key is not committed to version control
- [ ] Contract is deployed to the correct network (Base Sepolia)
- [ ] Contract address is correctly updated in all config files
- [ ] All environment variables are properly set
- [ ] Wallet connections work with the deployed contract

## Next Steps

After deployment, you can:
1. Test all features with real wallet connections
2. Deploy to mainnet when ready (use Base mainnet)
3. Set up monitoring and alerts for your contract
4. Implement additional security measures if needed

## Support

If you encounter any issues during deployment, check:
1. Base network status: https://status.base.org/
2. Hardhat documentation: https://hardhat.org/docs
3. Base developer docs: https://docs.base.org/
