import { ethers } from 'ethers';
import AutonomousBuyerAgent from './agentEngine.js';
import { ARC_TESTNET_CONFIG } from '../config/arcConfig.js';

const REGISTRY_ABI = [
  "function getServices() external view returns (tuple(uint256 id, address seller, string name, string endpoint, uint256 pricePerCall, string category, string description, bool active, uint256 totalCalls, uint256 successCount, uint256 avgResponseMs, uint256 ratingScore)[])"
];

async function fetchOnChainCatalog() {
  try {
    const provider = new ethers.JsonRpcProvider(ARC_TESTNET_CONFIG.rpcUrl);
    const registryContract = new ethers.Contract(ARC_TESTNET_CONFIG.contracts.payPerRegistry, REGISTRY_ABI, provider);
    const rawServices = await registryContract.getServices();

    const catalog = {};
    for (const item of rawServices) {
      if (Number(item.id) <= 3) continue; // Filter out pre-seeded mock listings
      const category = item.category.toLowerCase();
      if (!catalog[category]) catalog[category] = [];

      const totalCalls = Number(item.totalCalls);
      const successCount = Number(item.successCount);
      const successRatio = totalCalls > 0 ? Number(((successCount * 100) / totalCalls).toFixed(1)) : 100.0;

      catalog[category].push({
        id: Number(item.id),
        seller: item.seller,
        name: item.name,
        endpoint: item.endpoint,
        pricePerCall: Number(item.pricePerCall),
        category: item.category,
        description: item.description,
        active: item.active,
        totalCalls: totalCalls,
        successRatio: successRatio,
        avgResponseMs: Number(item.avgResponseMs),
        ratingScore: Number(item.ratingScore)
      });
    }

    return catalog;
  } catch (err) {
    console.warn("[runAgent] Could not fetch live on-chain listings, falling back to empty catalog:", err.message);
    return {};
  }
}

async function main() {
  console.log('=== PayPer Autonomous Buyer Agent Pipeline CLI ===');
  console.log(`Connecting to Arc Testnet PayPerRegistry Contract: ${ARC_TESTNET_CONFIG.contracts.payPerRegistry}`);
  
  const catalog = await fetchOnChainCatalog();
  const agent = new AutonomousBuyerAgent();
  const goal = 'Extract tech news from HackerNews, summarize key takeaways, and generate a visual banner image';

  const result = await agent.runPipeline(goal, catalog);
  console.log('\n=== Execution Completed Successfully! ===');
  console.dir(result.summary, { depth: null });
}

main().catch(console.error);
