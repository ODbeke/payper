import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import crypto from 'crypto';

const app = express();
app.use(cors());
app.use(express.json());

const SELLER_WALLET = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

const SERVICE_CATALOG = {
  'web-scraper': {
    id: 1,
    name: 'Web Scraper Pro',
    pricePerCall: 10000, // 0.01 USDC
    category: 'scraping',
    handler: async (body) => {
      const targetUrl = body.url || 'https://news.ycombinator.com';
      return {
        url: targetUrl,
        title: 'Hacker News - Top Headlines & Tech Trends',
        content: `Extracted content from ${targetUrl}: Arc layer-1 testnet launches USDC-native gas token. AI agents adopt EIP-3009 nanopayments for autonomous per-API-call micro-settlements.`,
        scrapedAt: new Date().toISOString(),
        bytesExtracted: 4280
      };
    }
  },
  'summarizer': {
    id: 2,
    name: 'AI Summarizer & Sentiment Engine',
    pricePerCall: 20000, // 0.02 USDC
    category: 'summarization',
    handler: async (body) => {
      const text = body.text || 'Arc is Circle stablecoin-native L1 blockchain using USDC as native gas.';
      return {
        summary: `Key takeaways: Arc is an L1 blockchain built natively around USDC with sub-second finality, eliminating third-party gas tokens for frictionless agent payments.`,
        sentiment: 'POSITIVE (Score: 0.94)',
        keyPoints: [
          'Native USDC gas on Arc L1',
          'Sub-second finality for micro-transactions',
          'EIP-3009 transferWithAuthorization support'
        ],
        tokensProcessed: text.length
      };
    }
  },
  'image-gen': {
    id: 3,
    name: 'Neural Image Generator',
    pricePerCall: 50000, // 0.05 USDC
    category: 'image-gen',
    handler: async (body) => {
      const prompt = body.prompt || 'Futuristic autonomous AI agent marketplace trading USDC on Arc network';
      return {
        prompt: prompt,
        imageUrl: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80`,
        resolution: '1024x1024',
        model: 'Arc-Diffusion-v2.1',
        generationTimeMs: 340
      };
    }
  }
};

app.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    sellerAddress: SELLER_WALLET,
    servicesCount: Object.keys(SERVICE_CATALOG).length,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/service/:serviceKey', async (req, res) => {
  const startTime = Date.now();
  const serviceKey = req.params.serviceKey;
  const serviceConfig = SERVICE_CATALOG[serviceKey];

  if (!serviceConfig) {
    return res.status(404).json({ error: 'Service listing not found' });
  }

  const paymentHeader = req.headers['x-payment-auth'];

  if (!paymentHeader) {
    const nonce = ethers.hexlify(ethers.randomBytes(32));
    const validBefore = Math.floor(Date.now() / 1000) + 120;

    return res.status(402).json({
      error: 'Payment Required',
      code: 402,
      x402: {
        payTo: SELLER_WALLET,
        amount: serviceConfig.pricePerCall,
        currency: 'USDC',
        decimals: 6,
        validBefore: validBefore,
        nonce: nonce,
        network: 'arc-testnet',
        chainId: 5040,
        serviceId: serviceConfig.id,
        serviceName: serviceConfig.name
      }
    });
  }

  let paymentAuth;
  try {
    paymentAuth = typeof paymentHeader === 'string' ? JSON.parse(paymentHeader) : paymentHeader;
  } catch (err) {
    return res.status(400).json({ error: 'Invalid X-PAYMENT-AUTH header format' });
  }

  if (paymentAuth.amount < serviceConfig.pricePerCall) {
    return res.status(402).json({ error: 'Insufficient payment amount attached in signature authorization' });
  }

  if (Date.now() / 1000 > paymentAuth.validBefore) {
    return res.status(402).json({ error: 'Payment authorization expired' });
  }

  try {
    if (req.body && req.body.simulateFailure === true) {
      throw new Error('Simulated upstream API failure');
    }

    const taskResult = await serviceConfig.handler(req.body || {});
    const executionDuration = Date.now() - startTime;

    const settlementTxHash = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0')).join('');

    return res.status(200).json({
      success: true,
      data: taskResult,
      paymentReceipt: {
        settled: true,
        amountUSDC: serviceConfig.pricePerCall / 1e6,
        txHash: settlementTxHash,
        settledAt: new Date().toISOString(),
        responseTimeMs: executionDuration,
        sellerWallet: SELLER_WALLET,
        buyerWallet: paymentAuth.from
      }
    });
  } catch (taskError) {
    console.error(`[x402 Safety Net] Task execution failed: ${taskError.message}. Authorization discarded.`);
    return res.status(500).json({
      success: false,
      error: `Upstream service execution failed: ${taskError.message}`,
      paymentReceipt: {
        settled: false,
        reason: 'Task failed before settlement. Zero funds deducted from buyer authorization.'
      }
    });
  }
});

const PORT = process.env.PORT || 4020;
app.listen(PORT, () => {
  console.log(`[PayPer Seller Server] Running on http://localhost:${PORT}`);
});

export default app;
