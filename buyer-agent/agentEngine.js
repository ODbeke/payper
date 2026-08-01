import { ethers } from 'ethers';
import { CircleAgentStack } from './circleAgentStack.js';
import { ARC_TESTNET_CONFIG } from '../config/arcConfig.js';

const getPrivateKey = () => {
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.BUYER_PRIVATE_KEY) return process.env.BUYER_PRIVATE_KEY;
    if (process.env.PRIVATE_KEY) return process.env.PRIVATE_KEY;
  }
  return '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
};
const BUYER_PRIVATE_KEY = getPrivateKey();

export class AutonomousBuyerAgent {
  constructor(options = {}) {
    this.sellerServerUrl = options.sellerServerUrl || 'http://localhost:4020';
    this.wallet = new ethers.Wallet(BUYER_PRIVATE_KEY);
    this.circleAgentStack = new CircleAgentStack(options);
    this.logs = [];
    this.transactions = [];
  }

  log(step, message, details = null) {
    const entry = {
      timestamp: new Date().toISOString(),
      step,
      message,
      details
    };
    this.logs.push(entry);
    console.log(`[Agent Engine] [${step}] ${message}`);
    return entry;
  }

  planGoal(userGoal) {
    this.log('PLANNING', `Decomposing user goal: "${userGoal}"`);

    const subtasks = [
      {
        id: 'subtask-1',
        type: 'web-scraper',
        category: 'scraping',
        name: 'Web Scraping',
        description: 'Extract raw text & headlines from target URL',
        input: { url: 'https://news.ycombinator.com' }
      },
      {
        id: 'subtask-2',
        type: 'summarizer',
        category: 'summarization',
        name: 'AI Summarization',
        description: 'Process scraped text into structured key insights',
        input: {}
      },
      {
        id: 'subtask-3',
        type: 'image-gen',
        category: 'image-gen',
        name: 'Visual Banner Generation',
        description: 'Generate promotional artwork based on summary',
        input: {}
      }
    ];

    this.log('PLANNING_SUCCESS', `Created execution plan with ${subtasks.length} paid subtasks`, subtasks);
    return subtasks;
  }

  evaluateListings(category, candidates) {
    this.log('DISCOVERY', `Querying PayPerRegistry on Arc Testnet for category: "${category}"`);

    if (!candidates || candidates.length === 0) {
      throw new Error(`No active sellers available for category ${category}`);
    }

    const ranked = candidates.map(seller => {
      const priceScore = (100000 - seller.pricePerCall) / 1000;
      const speedScore = Math.max(0, 1000 - seller.avgResponseMs) / 10;
      const compositeScore = (seller.ratingScore * 0.4) + (seller.successRatio * 0.4) + (priceScore * 0.1) + (speedScore * 0.1);

      return {
        ...seller,
        compositeScore: Number(compositeScore.toFixed(2))
      };
    }).sort((a, b) => b.compositeScore - a.compositeScore);

    const winner = ranked[0];
    const winnerPriceUSDC = winner.pricePerCall / 1e6;

    // Circle Agent Stack Policy Check
    const policy = this.circleAgentStack.validateSpendingPolicy(winnerPriceUSDC, category);
    if (!policy.approved) {
      this.log('POLICY_REJECTED', `Circle Agent Stack spending rule violation: ${policy.reason}`);
      throw new Error(`Circle Agent Stack Policy Violation: ${policy.reason}`);
    }

    this.log(
      'POLICY_APPROVED',
      `Circle Agent Stack spending guardrail passed: ${winnerPriceUSDC} USDC is within single-call & session caps.`
    );

    this.log(
      'SELECTION_DECISION',
      `Selected best seller "${winner.name}" (Score: ${winner.compositeScore}, Price: ${winnerPriceUSDC} USDC, Speed: ${winner.avgResponseMs}ms)`,
      { candidates: ranked, selected: winner }
    );

    return winner;
  }

  async signPaymentAuthorization(x402Challenge) {
    const { payTo, amount, validBefore, nonce, chainId } = x402Challenge;

    const payload = this.circleAgentStack.createCircleGatewayAuthorizationPayload(
      payTo,
      amount / 1e6,
      nonce,
      validBefore
    );

    const signature = await this.wallet.signTypedData(payload.domain, payload.types, payload.message);

    return {
      from: this.wallet.address,
      to: payTo,
      amount: amount,
      validBefore: validBefore,
      nonce: nonce,
      signature: signature
    };
  }

  async executePaidCall(selectedSeller, payload = {}) {
    const startTime = Date.now();
    const endpoint = selectedSeller.endpoint;
    this.log('CALL_INITIATED', `Sending request to listed capability "${selectedSeller.name}" at: ${endpoint}`);

    let response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      this.log('CALL_FAILED', `Network error contacting endpoint: ${err.message}`);
      // Record call failure metrics on-chain
      await this.recordOnChainMetrics(selectedSeller.id, false, 0);
      throw err;
    }

    if (response.status === 402) {
      const challengeData = await response.json();
      const x402 = challengeData.x402;
      this.log('X402_CHALLENGE', `Received HTTP 402 Payment Required challenge from seller`, x402);

      const paymentAuth = await this.signPaymentAuthorization(x402);
      this.log('SIGNATURE_CREATED', `Signed EIP-3009 gasless authorization via Circle Agent Stack (${x402.amount / 1e6} USDC)`, {
        buyer: paymentAuth.from,
        seller: paymentAuth.to,
        nonce: paymentAuth.nonce
      });

      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-PAYMENT-AUTH': JSON.stringify(paymentAuth)
          },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        this.log('CALL_FAILED', `Network error submitting payment auth: ${err.message}`);
        await this.recordOnChainMetrics(selectedSeller.id, false, 0);
        throw err;
      }
    }

    const result = await response.json();
    if (!response.ok || !result.success) {
      this.log('CALL_FAILED', `Call to "${selectedSeller.name}" failed: ${result.error || 'Unknown error'}`);
      await this.recordOnChainMetrics(selectedSeller.id, false, 0);
      throw new Error(result.error || 'Call failed');
    }

    const executionDuration = Date.now() - startTime;
    const priceUSDC = result.paymentReceipt.amountUSDC;
    this.circleAgentStack.recordApprovedSpending(priceUSDC);

    this.log('CALL_SUCCESS', `Successfully executed "${selectedSeller.name}" call & settled payment on Arc Testnet`, {
      ...result.paymentReceipt,
      arcExplorerLink: `${ARC_TESTNET_CONFIG.blockExplorerUrl}/tx/${result.paymentReceipt.txHash}`
    });

    this.transactions.push({
      ...result.paymentReceipt,
      explorerUrl: `${ARC_TESTNET_CONFIG.blockExplorerUrl}/tx/${result.paymentReceipt.txHash}`
    });

    // Record Call Metrics On-Chain directly from the Buyer Client!
    await this.recordOnChainMetrics(selectedSeller.id, true, executionDuration);

    return result.data;
  }

  async recordOnChainMetrics(serviceId, success, responseTimeMs) {
    try {
      const provider = new ethers.JsonRpcProvider(ARC_TESTNET_CONFIG.rpcUrl);
      const signer = new ethers.Wallet(BUYER_PRIVATE_KEY, provider);
      
      const REGISTRY_ABI = [
        "function recordCallMetrics(uint256 id, bool success, uint256 responseTimeMs) external"
      ];
      const registryContract = new ethers.Contract(
        ARC_TESTNET_CONFIG.contracts.payPerRegistry,
        REGISTRY_ABI,
        signer
      );

      // Submit metrics record transaction to smart contract on Arc L1
      const tx = await registryContract.recordCallMetrics(serviceId, success, responseTimeMs);
      this.log('METRICS_SUBMITTED', `Submitting execution metrics on-chain... Tx: ${tx.hash}`);
      await tx.wait();
      this.log('METRICS_RECORDED', `On-chain metrics finalized. Rating and speed updated for Service ID ${serviceId}.`);
    } catch (err) {
      this.log('METRICS_ERROR', `Failed to log metrics on-chain: ${err.message}`);
    }
  }

  async runPipeline(goalDescription, sellerCatalog) {
    this.logs = [];
    this.transactions = [];
    this.circleAgentStack.resetSessionBudget();

    this.log('START_PIPELINE', `Starting autonomous agent pipeline under Circle Agent Stack rules for goal: "${goalDescription}"`);

    const plan = this.planGoal(goalDescription);
    let intermediateContext = {};

    for (let i = 0; i < plan.length; i++) {
      const subtask = plan[i];
      const candidates = sellerCatalog[subtask.category] || [];
      const selectedSeller = this.evaluateListings(subtask.category, candidates);

      let payload = { ...subtask.input };
      if (subtask.type === 'summarizer' && intermediateContext.scrapedText) {
        payload.text = intermediateContext.scrapedText;
      } else if (subtask.type === 'image-gen' && intermediateContext.summary) {
        payload.prompt = `Visual artwork illustrating key summary: ${intermediateContext.summary}`;
      }

      const taskOutput = await this.executePaidCall(selectedSeller, payload);

      if (subtask.type === 'web-scraper') {
        intermediateContext.scrapedText = taskOutput.content;
      } else if (subtask.type === 'summarizer') {
        intermediateContext.summary = taskOutput.summary;
      } else if (subtask.type === 'image-gen') {
        intermediateContext.imageUrl = taskOutput.imageUrl;
      }
    }

    const summaryStats = {
      totalSubtasks: plan.length,
      totalUSDCSpent: Number(this.transactions.reduce((acc, tx) => acc + tx.amountUSDC, 0).toFixed(2)),
      totalTransactions: this.transactions.length,
      finalOutput: intermediateContext,
      circleWallet: await this.circleAgentStack.getCircleWalletStatus()
    };

    this.log('PIPELINE_COMPLETE', `Autonomous pipeline finished successfully!`, summaryStats);
    return {
      logs: this.logs,
      transactions: this.transactions,
      summary: summaryStats
    };
  }
}

export default AutonomousBuyerAgent;
