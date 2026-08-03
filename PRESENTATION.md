# PayPer: Agent-to-Agent Nanopayment Marketplace on Arc
## Encode Club Programmable Money Hackathon — Agentic Economy Track

---

## 📌 Slide 1: Title & Tagline
**Headline**: PayPer
**Subtitle**: Autonomous Agent-to-Agent Nanopayment Marketplace on Arc L1
**Tagline**: Frictionless micro-transactions between AI agents in native USDC. Zero subscriptions, zero API keys. Payment IS the credential.
**Key Info**:
- Track: Agentic Economy Track
- Network: Arc Testnet (Chain ID `5042002`, Native Gas USDC `0x3600000000000000000000000000000000000000`)
- Registry Contract: `0xdAea9d883f8d7F87F0D62378555e6660EC51AB77`
- GitHub Repo: `github.com/ODbeke/payper`

---

## ❓ Slide 2: The Problem
**Headline**: The Payment Bottleneck in the Agent Economy
- **Subscriptions Don't Scale for Machines**: Autonomous AI agents cannot sign up for monthly SaaS subscriptions, verify emails, or manage credit card billing cycles.
- **API Keys are Broken Auth Mechanisms**: Hardcoding provider API keys into autonomous agent code creates severe security leaks, rate-limit collisions, and manual key management overhead.
- **Micro-transaction Friction**: Existing L1/L2 networks charge volatile third-party gas fees, making 0.01 USDC API calls cost more in gas than the service itself.

---

## ⚡ Slide 3: The Solution — PayPer
**Headline**: PayPer: Pay-Per-API-Call in Native USDC on Arc
- **Payment IS the Credential**: Agents discover capability services on-chain, request API access, and pay per execution in USDC.
- **x402 Payment Required Standard**: Built on HTTP 402 Payment Required flow — no static API keys or credentials needed.
- **Native USDC Gas on Arc L1**: Built natively on Arc Testnet (`Chain ID 5042002`, RPC `https://rpc.testnet.arc.network`) using USDC as native gas with sub-second finality.

---

## ⚙️ Slide 4: Payment Architecture & Safety Net
**Headline**: x402 + EIP-3009 + Circle Gateway
1. **Request & Challenge**: Buyer Agent calls Seller endpoint → Seller returns `HTTP 402 Payment Required` with price & nonce.
2. **Gasless Off-Chain Auth**: Buyer signs EIP-3009 `transferWithAuthorization` off-chain using Circle W3S Developer Wallet.
3. **CRITICAL SAFETY RULE — Task Success Before Settlement**:
   - **Task Succeeds**: Seller submits EIP-3009 authorization → Settles USDC on Arc → Returns API result to Buyer.
   - **Task Fails**: Seller **NEVER** submits authorization. Signature expires unused. Buyer is **NEVER** charged. Zero risk of paying for broken APIs.

---

## 🎯 Slide 5: On-Chain Registry & Discovery Signals
**Headline**: Signal-Based Autonomous Agent Discovery
- **`PayPerRegistry` Smart Contract**: Live on Arc Testnet at `0xdAea9d883f8d7F87F0D62378555e6660EC51AB77`.
- **Decentralized Buyer-Driven Metrics Logging**: 
  - The buyer agent measures response speed and success.
  - Buyer signs and logs the metrics to the contract (`recordCallMetrics`) directly, keeping metrics honest and preventing seller spoofing.
  - Sellers onboard with **zero configuration**—no private keys or database IDs needed on the API wrapper!
- **Autonomous Selection Signals**: Buyer agents rank candidate sellers using weighted on-chain market signals:
  - **Rating Score** (e.g. 99/100)
  - **Success Ratio** (e.g. 99.3%)
  - **Response Speed** (e.g. 120ms)
  - **USDC Pricing (e.g. 0.01 USDC)**

---

## 🛡️ Slide 6: Circle Agent Stack & Arc App Kit Integration
**Headline**: Enterprise Spending Guardrails & Developer Wallets
- **Circle Web3 Services (W3S)**: Integrated with Circle Agent Stack (`circlefin/agent-stack-starter-kits`).
- **Autonomous Spending Guardrails**: Policy engine enforces:
  - Single-call budget caps (e.g. Max 0.05 USDC / call)
  - Cumulative session budget caps (e.g. Max 0.15 USDC / session)
  - Allowed category whitelists (`scraping`, `summarization`, `image-gen`)
- **Arc App Kit**: Integrated chain parameters, Explorer links (`testnet.arcscan.app`), and Web3 provider wrappers.

---

## 💻 Slide 7: Live Product & UI/UX Optimizations
**Headline**: Production-Grade Full-Stack Marketplace
- **Aesthetic Landing Page**: Sleek single-scroll hero, persistent live transaction ticker, single prominent CTA (`LAUNCH APP`).
- **State Persistence**: Current page state is backed by LocalStorage, allowing seamless page reloading without resetting dashboard sessions.
- **Header Navbar Dropdown**: Clean balance checks (scaled using 18 decimals native to Arc L1 USDC) and disconnect controls.
- **Interactive Capability Modals**: Cards open detailed overlay panels containing copyable endpoint fields and terminal instruction guides (cURL & local agent execution).
- **Public RPC Isolation & Defensively Caught Reads**: Read states decouple from MetaMask flaws and fetch metrics concurrently, recovering from individual contract errors gracefully.

---

## 🚀 Slide 8: Summary & Links
**Headline**: The Future of Machine-to-Machine Financial Commerce
- **Deployed MVP**: Live on Arc Testnet (`5042002`)
- **USDC System Contract**: `0x3600000000000000000000000000000000000000`
- **Registry Address**: `0xdAea9d883f8d7F87F0D62378555e6660EC51AB77`
- **GitHub Repository**: [github.com/ODbeke/payper](https://github.com/ODbeke/payper)
- **Hosted Gemini API Repository**: [github.com/ODbeke/payper-gemini-service](https://github.com/ODbeke/payper-gemini-service)
- **Hosted Web Application**: [payper-three.vercel.app](https://payper-three.vercel.app/)

*PayPer: Enabling true financial autonomy for the AI Agentic Economy.*
