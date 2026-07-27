# ⚡ PayPer: Autonomous Agent-to-Agent Nanopayment Marketplace on Arc

> **Encode Club Programmable Money Hackathon — Agentic Economy Track**  
> *Frictionless micro-transactions between AI agents in native USDC. Zero subscriptions, zero API keys. Payment IS the credential.*

---

## 📍 Live Deployment Specifications

| Parameter | Network / Contract Spec |
|---|---|
| **Target Network** | **Arc Testnet** (Circle Stablecoin-Native L1) |
| **Chain ID** | `5042002` |
| **RPC URL** | `https://rpc.testnet.arc.network` |
| **Block Explorer** | [testnet.arcscan.app](https://testnet.arcscan.app) |
| **Native Gas & Settlement Token** | **USDC** (`0x3600000000000000000000000000000000000000`) |
| **PayPerRegistry Contract** | [`0xdAea9d883f8d7F87F0D62378555e6660EC51AB77`](https://testnet.arcscan.app/address/0xdAea9d883f8d7F87F0D62378555e6660EC51AB77) |
| **Deployer Wallet Address** | [`0x926b00bcAB0D17f059B884B14554efec4573F97c`](https://testnet.arcscan.app/address/0x926b00bcAB0D17f059B884B14554efec4573F97c) |

---

## 💡 Problem & Solution

### The Problem
- **Subscriptions Don't Scale for Machines**: Autonomous AI agents cannot fill out credit card forms or manage recurring monthly SaaS subscriptions.
- **API Keys are Broken Credentials**: Hardcoding static provider API keys creates severe security leaks, key management overhead, and rate-limit collisions.
- **High Micro-transaction Gas Overhead**: Traditional chains charge volatile third-party gas tokens, causing a 0.01 USDC API call to cost more in gas than the call itself.

### The Solution — PayPer
- **Payment IS the Credential**: Agents discover capability services on-chain, request API access, and pay per execution in USDC.
- **x402 Payment Required Protocol**: Built on the HTTP 402 status standard — eliminating static API keys and user login barriers.
- **Native USDC Gas on Arc L1**: Built natively on Arc Testnet (`5042002`) using USDC as native gas with sub-second finality and zero gas volatility.

---

## ⚙️ Architecture & Core Safety Rules

```
+------------------+         1. HTTP Call Request          +-------------------+
|                  | ------------------------------------> |                   |
|   Buyer Agent    | <------------------------------------ |   Seller Server   |
| (Circle W3S)     |     2. HTTP 402 Payment Required      |   (x402 Express)  |
+------------------+     (Price, Nonce, Service Metadata)  +-------------------+
         |                                                           |
         | 3. Sign Gasless EIP-3009 Payload                          | 4. Execute Upstream
         v                                                           v Call FIRST
+----------------------------------------------------------------------------------+
|                            SAFETY GUARANTEE CHECK                                 |
| • UPSTREAM FAILS  => Seller NEVER submits authorization. Buyer charged 0 USDC.  |
| • UPSTREAM PASSES => Seller submits EIP-3009 authorization to Arc. Settles USDC.  |
+----------------------------------------------------------------------------------+
                                         |
                                         v 5. Settle USDC & Record Metrics
                        +----------------------------------+
                        |  PayPerRegistry Smart Contract   |
                        |     (Arc Testnet: 5042002)       |
                        +----------------------------------+
```

### 🛡️ Critical Safety Guarantee: Task-Success Settlement
1. **Task Succeeds**: Seller executes upstream service call first. If execution succeeds, seller submits EIP-3009 authorization to Arc Testnet → Settles USDC → Delivers output to Buyer.
2. **Task Fails**: If upstream call fails, seller **NEVER** submits authorization. Signature expires unused. Buyer is **NEVER** charged. Zero risk of paying for broken APIs.

---

## 🎯 Signal-Based Discovery Logic

Buyer agents do not select sellers at random. They evaluate listings registered in `PayPerRegistry` using weighted on-chain signals:
- **Rating Score** (e.g., 99/100)
- **Success Ratio** (e.g., 99.3%)
- **Response Speed** (e.g., 120ms)
- **USDC Pricing** (e.g., 0.01 USDC)

---

## 🛡️ Circle Agent Stack & Arc App Kit Integration

- **Circle Web3 Services (W3S)**: Integrated with Circle Agent Stack (`circlefin/agent-stack-starter-kits`).
- **Autonomous Policy Guardrails**:
  - `Max/Call Budget Cap`: Rejects requests above single-call limit (e.g., Max 0.10 USDC).
  - `Session Budget Cap`: Rejects requests exceeding cumulative session spend (e.g., Max 1.00 USDC).
  - `Category Whitelist`: Restricts agent spending to allowed service categories (`scraping`, `summarization`, `image-gen`, `sentiment`).
- **Arc App Kit**: Integrated chain specs, explorer URL helpers (`testnet.arcscan.app`), and Web3 provider interfaces.

---

## 📁 Repository Structure

```
PAYPER/
├── buyer-agent/             # Autonomous Buyer Agent & Circle Spending Policy Engine
│   ├── agentEngine.js       # Task decomposition & signal-based seller evaluation
│   ├── circleAgentStack.js  # Circle W3S Developer Wallet & policy guardrails
│   └── runAgent.js          # CLI entry point for autonomous pipeline
├── config/
│   └── arcConfig.js         # Arc L1 Testnet & App Kit parameters
├── contracts/
│   └── PayPerRegistry.sol   # On-chain service directory & metric tracker contract
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # React app (Landing page, Buyer/Seller toggle, Deck)
│   │   ├── index.css        # Cyber-financial design system (admon.peerfix.dev style)
│   │   └── main.jsx         # React DOM entry point
├── scripts/
│   └── deploy.js            # Automated Hardhat deployment script
├── seller/
│   ├── circleSellerWallet.js# Seller wallet initialization & authorization verifier
│   └── x402Server.js        # Express ESM server implementing HTTP 402 middleware
├── test/
│   ├── CircleAgentStack.test.js # Unit test suite for spending guardrails (4 tests)
│   └── PayPerRegistry.test.js   # Unit test suite for smart contract (4 tests)
├── .env.example             # Safe environment variable configuration template
├── deployments.json         # Deployed contract address artifact
├── hardhat.config.js        # Hardhat ESM configuration targeting Arc Testnet (5042002)
├── PRESENTATION.md          # Complete hackathon pitch deck document
└── README.md                # Project documentation
```

---

## ⚡ Quickstart Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Test Suite
```bash
npm run test
```
*(Runs 8/8 passing unit tests covering contract functions and spending policy guardrails).*

### 3. Launch Frontend Web App
```bash
npm run dev
```
Open **`http://localhost:3001`** in your browser to view the Landing Page, Interactive Marketplace, and Slide Deck.

### 4. Launch Seller x402 Backend Server
```bash
npm run seller
```
Starts the seller x402 payment middleware server on **`http://localhost:4020`**.

### 5. Execute Autonomous Buyer Agent Pipeline
```bash
npm run agent
```
Executes the Circle Agent Stack pipeline CLI against on-chain seller listings.

---

## 📊 Presentation Pitch Deck

View our full hackathon pitch deck at **[PRESENTATION.md](PRESENTATION.md)**.
