#!/bin/bash

# Post-deployment script to update contract addresses
# Usage: ./update-contract-address.sh <contract_address>

if [ $# -eq 0 ]; then
    echo "Usage: $0 <contract_address>"
    echo "Example: $0 0x1234567890123456789012345678901234567890"
    exit 1
fi

CONTRACT_ADDRESS=$1

echo "Updating contract address to: $CONTRACT_ADDRESS"

# Update .env file
if [ -f .env ]; then
    # Update NEXT_PUBLIC_SACCO_CONTRACT_ADDRESS
    if grep -q "NEXT_PUBLIC_SACCO_CONTRACT_ADDRESS=" .env; then
        sed -i "s/NEXT_PUBLIC_SACCO_CONTRACT_ADDRESS=.*/NEXT_PUBLIC_SACCO_CONTRACT_ADDRESS=\"$CONTRACT_ADDRESS\"/" .env
    else
        echo "NEXT_PUBLIC_SACCO_CONTRACT_ADDRESS=\"$CONTRACT_ADDRESS\"" >> .env
    fi
    
    # Update NEXT_PUBLIC_SAVINGS_CONTRACT_ADDRESS (same contract for now)
    if grep -q "NEXT_PUBLIC_SAVINGS_CONTRACT_ADDRESS=" .env; then
        sed -i "s/NEXT_PUBLIC_SAVINGS_CONTRACT_ADDRESS=.*/NEXT_PUBLIC_SAVINGS_CONTRACT_ADDRESS=\"$CONTRACT_ADDRESS\"/" .env
    else
        echo "NEXT_PUBLIC_SAVINGS_CONTRACT_ADDRESS=\"$CONTRACT_ADDRESS\"" >> .env
    fi
    
    # Update NEXT_PUBLIC_LOAN_CONTRACT_ADDRESS (same contract for now)
    if grep -q "NEXT_PUBLIC_LOAN_CONTRACT_ADDRESS=" .env; then
        sed -i "s/NEXT_PUBLIC_LOAN_CONTRACT_ADDRESS=.*/NEXT_PUBLIC_LOAN_CONTRACT_ADDRESS=\"$CONTRACT_ADDRESS\"/" .env
    else
        echo "NEXT_PUBLIC_LOAN_CONTRACT_ADDRESS=\"$CONTRACT_ADDRESS\"" >> .env
    fi
    
    echo "✅ Updated .env file"
else
    echo "❌ .env file not found"
fi

# Update web3.ts file
if [ -f src/lib/web3.ts ]; then
    sed -i "s/const CONTRACT_ADDRESS = .*/const CONTRACT_ADDRESS = \"$CONTRACT_ADDRESS\";/" src/lib/web3.ts
    echo "✅ Updated src/lib/web3.ts"
else
    echo "❌ src/lib/web3.ts file not found"
fi

echo ""
echo "🎉 Contract address updated successfully!"
echo "📝 Contract Address: $CONTRACT_ADDRESS"
echo ""
echo "Next steps:"
echo "1. Restart your development server: npm run dev"
echo "2. Test wallet connections with the deployed contract"
echo "3. Verify all SACCO features work correctly"
