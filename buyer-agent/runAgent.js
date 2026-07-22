import AutonomousBuyerAgent from './agentEngine.js';

const SEED_CATALOG = {
  scraping: [
    {
      id: 1,
      name: 'Web Scraper Pro',
      pricePerCall: 10000,
      avgResponseMs: 120,
      successRatio: 99.3,
      ratingScore: 99
    }
  ],
  summarization: [
    {
      id: 2,
      name: 'AI Summarizer & Sentiment Engine',
      pricePerCall: 20000,
      avgResponseMs: 180,
      successRatio: 98.6,
      ratingScore: 98
    }
  ],
  'image-gen': [
    {
      id: 3,
      name: 'Neural Image Generator',
      pricePerCall: 50000,
      avgResponseMs: 340,
      successRatio: 100.0,
      ratingScore: 100
    }
  ]
};

async function main() {
  console.log('=== PayPer Autonomous Buyer Agent Pipeline CLI ===');
  const agent = new AutonomousBuyerAgent();
  const goal = 'Extract tech news from HackerNews, summarize key takeaways, and generate a visual banner image';

  const result = await agent.runPipeline(goal, SEED_CATALOG);
  console.log('\n=== Execution Completed Successfully! ===');
  console.dir(result.summary, { depth: null });
}

main().catch(console.error);
