import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SELLER_WALLET = process.env.SELLER_WALLET || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

if (!GEMINI_API_KEY) {
  console.warn("[PayPer Gemini Seller] WARNING: GEMINI_API_KEY environment variable is not defined!");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || 'dummy-key');

// Define listed capabilities & pricing in USDC units (6 decimals)
const SERVICES = {
  'gemini-flash': {
    id: 10,
    name: 'Gemini 2.5 Flash API',
    pricePerCall: 10000, // 0.01 USDC per call
    category: 'summarization',
    modelName: 'gemini-2.5-flash'
  },
  'gemini-pro': {
    id: 11,
    name: 'Gemini 2.5 Pro API',
    pricePerCall: 30000, // 0.03 USDC per call
    category: 'summarization',
    modelName: 'gemini-2.5-pro'
  }
};

app.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    provider: 'Google Gemini',
    sellerAddress: SELLER_WALLET,
    services: Object.keys(SERVICES),
    timestamp: new Date().toISOString()
  });
});

app.post('/api/service/:serviceKey', async (req, res) => {
  const startTime = Date.now();
  const serviceKey = req.params.serviceKey;
  const service = SERVICES[serviceKey];

  if (!service) {
    return res.status(404).json({ error: 'Service capability not found' });
  }

  const paymentHeader = req.headers['x-payment-auth'];

  // STEP 1: Challenge if no payment is attached
  if (!paymentHeader) {
    const nonce = ethers.hexlify(ethers.randomBytes(32));
    const validBefore = Math.floor(Date.now() / 1000) + 120; // 2 mins validity

    return res.status(402).json({
      error: 'Payment Required',
      code: 402,
      x402: {
        payTo: SELLER_WALLET,
        amount: service.pricePerCall,
        currency: 'USDC',
        decimals: 6,
        validBefore: validBefore,
        nonce: nonce,
        network: 'arc-testnet',
        chainId: 5042002,
        serviceId: service.id,
        serviceName: service.name
      }
    });
  }

  // STEP 2: Parse and validate the payment authorization details
  let paymentAuth;
  try {
    paymentAuth = typeof paymentHeader === 'string' ? JSON.parse(paymentHeader) : paymentHeader;
  } catch (err) {
    return res.status(400).json({ error: 'Invalid X-PAYMENT-AUTH header format' });
  }

  if (Number(paymentAuth.amount) < service.pricePerCall) {
    return res.status(402).json({ error: 'Insufficient payment amount attached in signature authorization' });
  }

  if (Date.now() / 1000 > paymentAuth.validBefore) {
    return res.status(402).json({ error: 'Payment authorization expired' });
  }

  // STEP 3: Execute the Gemini API Call using the private key
  try {
    const prompt = req.body.prompt;
    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt text parameter in request body' });
    }

    const model = genAI.getGenerativeModel({ model: service.modelName });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const executionDuration = Date.now() - startTime;

    // Simulate Arc L1 USDC transfer settlement transaction receipt
    const settlementTxHash = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0')).join('');

    // STEP 4: Return data to buyer agent + payment receipt
    return res.status(200).json({
      success: true,
      data: {
        text: responseText,
        modelUsed: service.modelName,
      },
      paymentReceipt: {
        settled: true,
        amountUSDC: service.pricePerCall / 1e6,
        txHash: settlementTxHash,
        settledAt: new Date().toISOString(),
        responseTimeMs: executionDuration,
        sellerWallet: SELLER_WALLET,
        buyerWallet: paymentAuth.from
      }
    });

  } catch (apiError) {
    console.error(`[Gemini Seller x402] Task execution failed: ${apiError.message}. Authorization discarded.`);
    return res.status(500).json({
      success: false,
      error: `Gemini API execution failed: ${apiError.message}`,
      paymentReceipt: {
        settled: false,
        reason: 'Task failed before settlement. Zero funds deducted from buyer authorization.'
      }
    });
  }
});

const PORT = process.env.PORT || 4020;
app.listen(PORT, () => {
  console.log(`[PayPer Gemini Server] Running on port ${PORT}`);
});
