import { expect } from 'chai';
import { CircleAgentStack } from '../buyer-agent/circleAgentStack.js';

describe('Circle Agent Stack Spending Guardrails', function () {
  let agentStack;

  beforeEach(function () {
    agentStack = new CircleAgentStack({
      maxBudgetPerCallUSDC: 0.05, // 0.05 USDC per call cap
      totalSessionBudgetUSDC: 0.10, // 0.10 USDC session cap
      allowedCategories: ['scraping', 'summarization', 'image-gen']
    });
  });

  it('Should approve call when price is within single-call and session limits', function () {
    const policy = agentStack.validateSpendingPolicy(0.02, 'scraping');
    expect(policy.approved).to.be.true;
  });

  it('Should reject call when price exceeds single-call budget limit', function () {
    const policy = agentStack.validateSpendingPolicy(0.08, 'scraping');
    expect(policy.approved).to.be.false;
    expect(policy.reason).to.include('exceeds single-call limit');
  });

  it('Should reject call when category is not permitted', function () {
    const policy = agentStack.validateSpendingPolicy(0.01, 'forbidden-category');
    expect(policy.approved).to.be.false;
    expect(policy.reason).to.include('not permitted by Circle Agent Stack policy');
  });

  it('Should reject call when cumulative session spending cap is exceeded', function () {
    agentStack.recordApprovedSpending(0.08); // Spent 0.08 USDC so far
    const policy = agentStack.validateSpendingPolicy(0.04, 'summarization'); // 0.08 + 0.04 = 0.12 > 0.10 cap
    expect(policy.approved).to.be.false;
    expect(policy.reason).to.include('exceeds total session cap');
  });
});
