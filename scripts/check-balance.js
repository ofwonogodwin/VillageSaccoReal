const hre = require("hardhat");

async function main() {
  try {
    // Get the signer (deployer account)
    const [deployer] = await hre.ethers.getSigners();

    console.log("🔍 Checking deployment readiness...");
    console.log("📍 Network:", hre.network.name);
    console.log("🏦 Deployer address:", deployer.address);

    // Get balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    const balanceInEth = hre.ethers.formatEther(balance);

    console.log("💰 Account balance:", balanceInEth, "ETH");

    // Check if balance is sufficient (need at least 0.001 ETH for deployment)
    const minBalance = hre.ethers.parseEther("0.001");

    if (balance >= minBalance) {
      console.log("✅ Sufficient balance for deployment!");
      console.log("🚀 Ready to deploy contract");
    } else {
      console.log("❌ Insufficient balance for deployment");
      console.log("🎯 Required: At least 0.001 ETH");
      console.log("💡 Get Base Sepolia ETH from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet");
    }

    // Get network info
    const network = await hre.ethers.provider.getNetwork();
    console.log("🌐 Network details:");
    console.log("   Chain ID:", network.chainId.toString());
    console.log("   Name:", network.name);

  } catch (error) {
    console.error("❌ Error checking deployment readiness:", error.message);

    if (error.message.includes("private key")) {
      console.log("💡 Please add your private key to the .env file");
    }
    if (error.message.includes("network")) {
      console.log("💡 Please check your network configuration");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
