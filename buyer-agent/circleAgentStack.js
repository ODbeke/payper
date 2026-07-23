import { ethers } from 'ethers';
import { ARC_TESTNET_CONFIG } from '../config/arcConfig.js';

/**
 * Circle Agent Stack Integration Module
 * Follows patterns from github.com/circlefin/agent-stack-starter-kits
 * Implements Circle Developer-Controlled Wallets & Autonomous Agent Spending Guardrails.
 */
export class CircleAgentStack {
  constructor(options = {}) {
    const getEnvVal = (key, fallback) => {
      if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key];
      }
      return fallback;
    };
    this.apiKey = options.apiKey || getEnvVal('CIRCLE_API_KEY', 'simulated-circle-api-key');
    this.entitySecret = options.entitySecret || getEnvVal('CIRCLE_ENTITY_SECRET', 'simulated-circle-entity-secret');
    
    // Developer-controlled agent wallet address on Arc
    this.agentWalletAddress = options.agentWalletAddress || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    
    // Autonomous Spending Policy Guardrails (Circle Agent Stack Rules Engine)
    this.guardrails = {
      maxBudgetPerCallUSDC: options.maxBudgetPerCallUSDC || 0.10, // Max 0.10 USDC per single call
      totalSessionBudgetUSDC: options.totalSessionBudgetUSDC || 1.00, // Max 1.00 USDC per session
      allowedCategories: options.allowedCategories || ['scraping', 'summarization', 'image-gen', 'sentiment']
    };

    this.currentSessionSpentUSDC = 0;
  }

  /**
   * Resets session budget tracking for a new agent execution run.
   */
  resetSessionBudget() {
    this.currentSessionSpentUSDC = 0;
  }

  /**
   * Circle Agent Stack Policy Engine Guardrail Check:
   * Validates if a proposed transaction complies with agent spending rules before signing.
   */
  validateSpendingPolicy(sellerPriceUSDC, category) {
    if (!this.guardrails.allowedCategories.includes(category)) {
      return {
        approved: false,
        reason: `Category "${category}" is not permitted by Circle Agent Stack policy.`
      };
    }

    if (sellerPriceUSDC > this.guardrails.maxBudgetPerCallUSDC) {
      return {
        approved: false,
        reason: `Price ${sellerPriceUSDC} USDC exceeds single-call limit of ${this.guardrails.maxBudgetPerCallUSDC} USDC.`
      };
    }

    const projectedTotal = this.currentSessionSpentUSDC + sellerPriceUSDC;
    if (projectedTotal > this.guardrails.totalSessionBudgetUSDC) {
      return {
        approved: false,
        reason: `Cumulative spending (${projectedTotal.toFixed(2)} USDC) exceeds total session cap of ${this.guardrails.totalSessionBudgetUSDC} USDC.`
      };
    }

    return { approved: true };
  }

  recordApprovedSpending(amountUSDC) {
    this.currentSessionSpentUSDC += amountUSDC;
  }

  /**
   * Formats EIP-3009 transferWithAuthorization payload compatible with Circle Gateway & Arc L1.
   */
  createCircleGatewayAuthorizationPayload(sellerWallet, amountUSDC, nonce, validBefore) {
    const amountInUnits = Math.round(amountUSDC * 1e6); // 6 decimal USDC
    return {
      domain: {
        name: 'USD Coin',
        version: '2',
        chainId: ARC_TESTNET_CONFIG.chainId,
        verifyingContract: ARC_TESTNET_CONFIG.contracts.officialCircleUsdc
      },
      types: {
        TransferWithAuthorization: [
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'validAfter', type: 'uint256' },
          { name: 'validBefore', type: 'uint256' },
          { name: 'nonce', type: 'bytes32' }
        ]
      },
      message: {
        from: this.agentWalletAddress,
        to: sellerWallet,
        value: amountInUnits.toString(),
        validAfter: '0',
        validBefore: validBefore.toString(),
        nonce: nonce
      }
    };
  }

  /**
   * Simulates Circle W3S Developer-Controlled Wallet status query.
   */
  async getCircleWalletStatus() {
    return {
      walletId: 'cw_agent_arc_8827',
      address: this.agentWalletAddress,
      network: 'Arc Testnet (Chain ID 5042002)',
      usdcBalance: 1000.0,
      spendingGuardrails: this.guardrails,
      currentSessionSpent: Number(this.currentSessionSpentUSDC.toFixed(2))
    };
  }
}

export default CircleAgentStack;
