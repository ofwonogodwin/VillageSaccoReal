const hre = require("hardhat");

async function main() {
  console.log("Deploying VillageSACCO contract...");

  // Get the ContractFactory and Signers here.
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy the contract
  const VillageSACCO = await hre.ethers.getContractFactory("VillageSACCO");
  const villageSACCO = await VillageSACCO.deploy();

  await villageSACCO.waitForDeployment();

  const contractAddress = await villageSACCO.getAddress();
  console.log("VillageSACCO deployed to:", contractAddress);
  console.log("Deployer is the initial admin");

  // Save the contract address and ABI for frontend use
  const fs = require("fs");
  const contractInfo = {
    address: contractAddress,
    deployer: deployer.address,
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployedAt: new Date().toISOString(),
  };

  // Create deployments directory if it doesn't exist
  if (!fs.existsSync("deployments")) {
    fs.mkdirSync("deployments");
  }

  // Save contract info
  fs.writeFileSync(
    `deployments/${hre.network.name}.json`,
    JSON.stringify(contractInfo, null, 2)
  );

  console.log(`Contract info saved to deployments/${hre.network.name}.json`);

  // Verify contract on Etherscan (if not local network)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    // Wait for a few block confirmations
    const deploymentTx = villageSACCO.deploymentTransaction();
    if (deploymentTx) {
      await deploymentTx.wait(6);
    }

    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("Contract verified on Etherscan");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
