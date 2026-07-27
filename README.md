<p align="center">
  <img src="logo.png" alt="PayPer Marketplace Logo" width="280" />
</p>

# PayPer ⚡
### Autonomous Agent-to-Agent Nanopayment Marketplace on Arc L1

[![Network](https://img.shields.io/badge/Network-Arc_Testnet_(5042002)-0284c7?style=for-the-badge&logo=ethereum)](https://testnet.arcscan.app)
[![Gas Token](https://img.shields.io/badge/Native_Gas-USDC_(6_Decimals)-10b981?style=for-the-badge&logo=usd-coin)](https://testnet.arcscan.app/address/0x3600000000000000000000000000000000000000)
[![Protocol](https://img.shields.io/badge/Standard-x402_HTTP_Payment_Required-a855f7?style=for-the-badge)](https://github.com/ODbeke/payper)
[![Security](https://img.shields.io/badge/Auth-EIP--3009_transferWithAuthorization-38bdf8?style=for-the-badge)](https://github.com/ODbeke/payper)
[![Track](https://img.shields.io/badge/Hackathon-Encode_Club_Agentic_Economy-f59e0b?style=for-the-badge)](https://github.com/ODbeke/payper)

> **PayPer** is an autonomous, machine-to-machine financial infrastructure built natively on **Arc L1**. It enables AI agents to discover, evaluate, and pay specialized service provider agents per API call in **USDC** using **x402 HTTP Payment Required** headers and **EIP-3009 gasless authorizations**. Zero subscriptions, zero hardcoded API keys — **Payment IS the Credential**.

---

## 📌 Executive Summary & Live Contract Directory

| Deployment Parameter | Live Contract Specification |
|---|---|
| **Target Blockchain** | **Arc Testnet** (Circle Stablecoin-Native Layer-1) |
| **Chain ID** | `5042002` (`0x4cef02`) |
| **RPC Endpoint** | `https://rpc.testnet.arc.network` |
| **Block Explorer** | [https://testnet.arcscan.app](https://testnet.arcscan.app) |
| **Native Gas & Settlement Token** | **USDC System Contract** ([`0x3600000000000000000000000000000000000000`](https://testnet.arcscan.app/address/0x3600000000000000000000000000000000000000)) |
| **PayPerRegistry Smart Contract** | [`0xdAea9d883f8d7F87F0D62378555e6660EC51AB77`](https://testnet.arcscan.app/address/0xdAea9d883f8d7F87F0D62378555e6660EC51AB77) |
| **Deployer & Authority Wallet** | [`0x926b00bcAB0D17f059B884B14554efec4573F97c`](https://testnet.arcscan.app/address/0x926b00bcAB0D17f059B884B14554efec4573F97c) |
| **Pitch Deck Document** | [PRESENTATION.md](PRESENTATION.md) |

---

## 💡 The Paradigm Shift: Why Traditional Billing Fails Machine Economy

As AI agents transition from conversational interfaces to autonomous execution engines, existing Web2 financial rails and traditional Web3 patterns create critical adoption bottlenecks:

```
❌ Traditional Web2 API Models               ❌ Standard Web3 On-Chain Payments
--------------------------------            ---------------------------------
• Monthly SaaS Subscriptions                • Volatile 3rd-party gas tokens (ETH/MATIC)
• Manual Credit Card Checkout               • Complex 2-step Token Approve() txs
• Hardcoded Provider API Keys               • Manual MetaMask popup approvals
• Vulnerable to Key Theft & Collisions      • High latency (12s - 15m finality)
```

### The PayPer Architecture Solution

```
⚡ PayPer Machine-Native Financial Commerce
-------------------------------------------
1. Zero Subscriptions: Agents pay per execution (e.g. 0.01 USDC).
2. Zero API Keys: HTTP 402 Payment Required status acts as dynamic authorization.
3. Native USDC Gas on Arc: Sub-second finality with zero third-party gas volatility.
4. EIP-3009 Gasless Off-Chain Signing: 1-step signature without prior approval transactions.
5. Task-Success Settlement Guarantee: Funds move ONLY when upstream execution succeeds.
```

---

## ⚙️ Core Architectural Innovations

### 1. The `x402` HTTP Payment Protocol Handshake
When an autonomous buyer agent invokes a seller endpoint without credentials, the server responds with a standard `HTTP 402 Payment Required` header payload containing the precise payment challenge:

```json
{
  "status": 402,
  "error": "Payment Required",
  "challenge": {
    "pricePerCall": 10000,
    "priceUsdc": "0.01",
    "payTo": "0x926b00bcAB0D17f059B884B14554efec4573F97c",
    "validBefore": 1784793600,
    "nonce": "0xa4f82d19e...",
    "network": "arc-testnet",
    "chainId": 5042002,
    "serviceName": "Web Scraper Pro"
  }
}
```

### 2. Gasless Settlement via `EIP-3009 transferWithAuthorization`
The buyer agent signs an EIP-3009 typed data payload off-chain:
$$\text{EIP-3009 Payload} = \{\text{from}, \text{to}, \text{value}, \text{validAfter}, \text{validBefore}, \text{nonce}\}$$

This eliminates the need for separate `ERC20.approve()` transactions, allowing instant, 1-step sub-second settlement on Arc L1.

### 3. The Golden Safety Rule: Task-Success Before Settlement
PayPer enforces a strict ordering rule in the seller payment middleware ([seller/x402Server.js](file:///Users/okoyes/PAYPER/seller/x402Server.js)):

$$\text{Upstream API Execution} \xrightarrow{\text{SUCCESS (HTTP 200)}} \text{Submit EIP-3009 Authorization to Arc} \rightarrow \text{Settle USDC}$$

$$\text{Upstream API Execution} \xrightarrow{\text{FAILURE (HTTP 500)}} \text{Discard Authorization} \rightarrow \text{Deduct 0 USDC}$$

> **Key Takeaway**: If a seller service throws an error or returns corrupted data, the signature is safely discarded. The buyer agent is **NEVER** charged for broken API calls.

---

## 🎯 Signal-Based Discovery Logic in `PayPerRegistry.sol`

Autonomous agents cannot rely on subjective marketing copy. The [`PayPerRegistry.sol`](file:///Users/okoyes/PAYPER/contracts/PayPerRegistry.sol) smart contract acts as an immutable on-chain registry that tracks verifiable seller execution signals:

```solidity
struct Listing {
    uint256 id;
    address seller;
    string name;
    string endpoint;       // Public HTTP URL
    uint256 pricePerCall;  // USDC, 6 decimals
    string category;       // e.g. "scraping", "summarization", "image-gen"
    string description;
    bool active;
    uint256 totalCalls;
    uint256 successCount;
    uint256 avgResponseMs; // Rolling average response speed
    uint256 ratingScore;   // Verified success percentage (1-100)
}
```

### Autonomous Seller Ranking Algorithm
The buyer agent ([buyer-agent/agentEngine.js](file:///Users/okoyes/PAYPER/buyer-agent/agentEngine.js)) calculates a deterministic composite score $S$ for candidate sellers:

$$S = \left( W_{\text{rating}} \cdot \text{RatingScore} \right) + \left( W_{\text{speed}} \cdot \frac{1000}{\text{AvgResponseMs}} \right) - \left( W_{\text{price}} \cdot \text{PriceUSDC} \right)$$

This mathematical selection process eliminates hallucinated choices and guarantees that agents optimize for reliability, latency, and cost.

---

## 🛡️ Circle Agent Stack & Spending Policy Engine

Integrated with the official **Circle Developer Stack** (`circlefin/agent-stack-starter-kits`), the buyer agent includes strict policy guardrails ([buyer-agent/circleAgentStack.js](file:///Users/okoyes/PAYPER/buyer-agent/circleAgentStack.js)):

```javascript
// Circle Agent Guardrail Policy Engine
const policy = {
  maxSingleCallBudgetUSDC: 0.10,    // Reject any call costing > 0.10 USDC
  maxSessionBudgetUSDC: 1.00,       // Hard spending cap per execution session
  permittedCategories: ['scraping', 'summarization', 'image-gen', 'sentiment']
};
```

If an endpoint attempts to overcharge or request unauthorized spending, the Circle Agent Stack immediately rejects the authorization before signing.

---

## 🎨 Cyber-Financial Design System (`admon.peerfix.dev` Style)

The frontend application ([frontend/src/App.jsx](file:///Users/okoyes/PAYPER/frontend/src/App.jsx)) is crafted with custom typography and visual aesthetics inspired by high-end web3 build registries:

- **Display Typography**: **`Bricolage Grotesque`** (tight geometric display headlines, `-0.045em` tracking).
- **Technical & Metric Typography**: **`IBM Plex Mono`** (monospaced terminal paths, transaction hashes, gas metrics, and badges).
- **Body Copy**: **`Manrope`** (clean geometric sans-serif for descriptions and UI components).
- **Interactive Views**:
  - **Single-Scroll Landing Page**: High-impact hero title, live persistent transaction ticker, and a single prominent CTA (`LAUNCH MARKETPLACE APP →`).
  - **Buyer Marketplace View**: Capability game-card grid, category filters, wallet guardrails, and **Live Execution Console Workbench**.
  - **Seller Registration View**: Direct on-chain publishing interface to register capabilities on `PayPerRegistry`.
  - **Interactive Pitch Deck**: Integrated 8-slide presentation deck accessible directly in navigation (`📊 PITCH DECK`).

---

## 📂 Codebase Directory Architecture

```
PAYPER/
├── buyer-agent/                   # Autonomous Buyer Agent Engine & Guardrails
│   ├── agentEngine.js             # Goal decomposition & signal ranking algorithm
│   ├── circleAgentStack.js        # Circle W3S Agent Wallet & spending guardrails
│   └── runAgent.js                # CLI entry point for autonomous pipeline
├── config/
│   └── arcConfig.js               # Arc L1 Testnet & Arc App Kit parameters
├── contracts/
│   └── PayPerRegistry.sol         # On-chain capability registry & metric tracker
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # Full-stack React app (Landing, Marketplace, Deck)
│   │   ├── index.css              # Cyber-financial design system CSS
│   │   └── main.jsx               # React DOM entry point
├── scripts/
│   └── deploy.js                  # Hardhat deployment script targeting Arc Testnet
├── seller/
│   ├── circleSellerWallet.js      # Seller authorization verifier & wallet helper
│   └── x402Server.js              # Express ESM server implementing HTTP 402 middleware
├── test/
│   ├── CircleAgentStack.test.js   # Unit test suite for spending guardrails (4 tests)
│   └── PayPerRegistry.test.js     # Unit test suite for PayPerRegistry contract (4 tests)
├── .env.example                   # Environment configuration template
├── deployments.json               # Live deployed contract address artifact
├── hardhat.config.js              # Hardhat configuration (Chain ID 5042002)
├── logo.png                       # PayPer Marketplace Logo
├── PRESENTATION.md                # Hackathon presentation deck document
└── README.md                      # Primary project documentation
```

---

## 🧪 Verification & Testing

PayPer includes a complete unit testing suite for smart contracts and spending policy engines:

```bash
npm run test
```

### Test Suite Output:
```
  Circle Agent Stack Spending Guardrails
    ✔ Should approve call when price is within single-call and session limits
    ✔ Should reject call when price exceeds single-call budget limit
    ✔ Should reject call when category is not permitted
    ✔ Should reject call when cumulative session spending cap is exceeded

  PayPer Marketplace Contracts
    PayPerRegistry On-Chain Directory
      ✔ Should register a new seller service listing
      ✔ Should allow seller to toggle active status
      ✔ Should update metrics and network volume on call recording
      ✔ Should filter services by category

  8 passing (390ms)
```

---

## ⚡ Quickstart Setup Guide

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/ODbeke/payper.git
cd PAYPER
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Optionally add your `PRIVATE_KEY` for Arc Testnet deployments or Circle API credentials).*

### 3. Launch Frontend Application
```bash
npm run dev
```
Open **`http://localhost:3001`** in your browser to view the live marketplace, landing page, and slide deck.

### 4. Start Seller x402 Middleware Server
```bash
npm run seller
```
Starts the seller backend server on **`http://localhost:4020`**.

### 5. Run Autonomous Buyer Agent Pipeline CLI
```bash
npm run agent
```

---

## 📄 License & Attribution

Built for the **Encode Club Programmable Money Hackathon (Arc Track)**.  
Repository: [github.com/ODbeke/payper](https://github.com/ODbeke/payper)
