import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const networkName = hre.network.name;
  console.log(`=== PayPer Smart Contract Deployment on ${networkName} ===`);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer Wallet:", deployer.address);

  // Official Circle USDC on Arc Testnet (USDC is native gas token)
  const usdcAddress = "0x0000000000000000000000000000000000004020";
  console.log("-> Using Official Circle USDC on Arc Testnet:", usdcAddress);

  // Deploy PayPerRegistry directory contract
  console.log("\nDeploying PayPerRegistry marketplace directory...");
  const PayPerRegistry = await hre.ethers.getContractFactory("PayPerRegistry");
  const registry = await PayPerRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("-> PayPerRegistry deployed at:", registryAddress);

  // Register initial seed sellers in registry
  console.log("\nRegistering initial seller capability listings...");
  const seedServices = [
    {
      name: "Web Scraper Pro",
      endpoint: "http://localhost:4020/api/service/web-scraper",
      price: 10000, // 0.01 USDC
      category: "scraping",
      description: "Fast headless page extraction and HTML table to JSON parser."
    },
    {
      name: "AI Summarizer & Sentiment Engine",
      endpoint: "http://localhost:4020/api/service/summarizer",
      price: 20000, // 0.02 USDC
      category: "summarization",
      description: "LLM key takeaways, sentiment scoring & structured breakdown."
    },
    {
      name: "Neural Image Generator",
      endpoint: "http://localhost:4020/api/service/image-gen",
      price: 50000, // 0.05 USDC
      category: "image-gen",
      description: "High-resolution AI banner and promotional artwork generation."
    }
  ];

  for (const s of seedServices) {
    const tx = await registry.registerService(s.name, s.endpoint, s.price, s.category, s.description);
    await tx.wait();
    console.log(`-> Registered "${s.name}" (${s.category}) @ ${s.price / 1e6} USDC`);
  }

  const deploymentInfo = {
    network: networkName,
    chainId: Number((await hre.ethers.provider.getNetwork()).chainId),
    usdcTokenAddress: usdcAddress,
    payPerRegistry: registryAddress,
    deployedAt: new Date().toISOString()
  };

  const artifactPath = path.resolve("./deployments.json");
  fs.writeFileSync(artifactPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\nSaved deployment artifact to:", artifactPath);
  console.log("=== Deployment Complete! ===");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
