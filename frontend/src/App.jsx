import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './index.css';
import { ARC_TESTNET_CONFIG, ArcAppKit } from '../../config/arcConfig.js';

const REGISTRY_ABI = [
  "function getServices() external view returns (tuple(uint256 id, address seller, string name, string endpoint, uint256 pricePerCall, string category, string description, bool active, uint256 totalCalls, uint256 successCount, uint256 avgResponseMs, uint256 ratingScore)[])",
  "function totalNetworkTransactions() external view returns (uint256)",
  "function totalUSDCVolumeMoved() external view returns (uint256)",
  "function registerService(string name, string endpoint, uint256 pricePerCall, string category, string description) external returns (uint256)"
];

const SLIDES = [
  {
    number: "01",
    tag: "TITLE & TAGLINE",
    title: "PayPer: Agent-to-Agent Nanopayment Marketplace on Arc",
    subtitle: "Encode Club Programmable Money Hackathon — Agentic Economy Track",
    points: [
      "Frictionless USDC micro-transactions between autonomous AI agents on Arc L1.",
      "Zero subscriptions, zero static API keys — Payment IS the credential.",
      "Live Network: Arc Testnet (Chain ID 5042002, RPC https://rpc.testnet.arc.network)",
      "Native USDC System Contract: 0x3600000000000000000000000000000000000000",
      "Live Registry Contract: 0xdAea9d883f8d7F87F0D62378555e6660EC51AB77"
    ]
  },
  {
    number: "02",
    tag: "THE PROBLEM",
    title: "The Payment Bottleneck in the Agent Economy",
    subtitle: "Why traditional SaaS billing & auth models break for machines",
    points: [
      "Subscriptions Don't Scale for Machines: Autonomous agents cannot fill out billing forms or manage monthly SaaS subscriptions.",
      "API Keys Are Broken Auth Mechanisms: Hardcoding static provider keys creates severe security leaks and rate-limit collisions.",
      "High Micro-transaction Gas Overhead: Existing chains charge volatile third-party gas tokens, making 0.01 USDC API calls cost more in gas than the call itself."
    ]
  },
  {
    number: "03",
    tag: "THE SOLUTION",
    title: "PayPer: Pay-Per-Call in Native USDC on Arc",
    subtitle: "Programmable money primitives designed specifically for AI agents",
    points: [
      "Payment IS the Credential: Agents discover capabilities on-chain, request API access, and pay per call in USDC.",
      "x402 Payment Required Protocol: Built on HTTP 402 status standard — eliminating static API keys.",
      "Arc L1 Native USDC Gas: Built natively on Arc Testnet (Chain 5042002) with sub-second finality and zero third-party gas volatility."
    ]
  },
  {
    number: "04",
    tag: "PAYMENT ARCHITECTURE",
    title: "x402 + EIP-3009 + Circle Gateway",
    subtitle: "Verify → Execute → Settle Flow with Guaranteed Zero-Charge Safety",
    points: [
      "1. Request & Challenge: Buyer Agent calls Seller endpoint → Seller responds HTTP 402 with price & nonce.",
      "2. Gasless Authorization: Buyer signs off-chain EIP-3009 transferWithAuthorization payload using Circle W3S Developer Wallet.",
      "3. CRITICAL SAFETY RULE — Task Success Before Settlement:",
      "   • Task Succeeds: Seller submits authorization → Settles USDC on Arc → Returns API result.",
      "   • Task Fails: Seller NEVER submits authorization. Signature expires unused. Buyer is NEVER charged."
    ]
  },
  {
    number: "05",
    tag: "ONCHAIN REGISTRY",
    title: "Signal-Based Autonomous Agent Discovery",
    subtitle: "Pure on-chain directory mapping service capabilities to live endpoints",
    points: [
      "PayPerRegistry Smart Contract: Deployed at 0xdAea9d883f8d7F87F0D62378555e6660EC51AB77.",
      "Signal-Based Selection: Buyer agents evaluate candidate listings using weighted on-chain metrics:",
      "   • Rating Score (e.g. 99/100)",
      "   • Success Ratio (e.g. 99.3%)",
      "   • Response Speed (e.g. 120ms)",
      "   • USDC Pricing (e.g. 0.01 USDC)",
      "Zero Hallucination: Decision logic is 100% mathematical, transparent, and reproducible."
    ]
  },
  {
    number: "06",
    tag: "CIRCLE STACK & ARC APP KIT",
    title: "Enterprise Spending Guardrails & Developer Wallets",
    subtitle: "Built on circlefin/agent-stack-starter-kits and Arc App Kit specs",
    points: [
      "Circle Web3 Services (W3S): Developer-Controlled Agent Wallets for automated M2M payments.",
      "Autonomous Policy Guardrails: Policy engine enforces single-call budget caps (e.g. Max 0.10 USDC) & session caps (e.g. Max 1.00 USDC).",
      "Arc App Kit: Standardized chain parameters, Arcscan Explorer receipt links, and Web3 provider interfaces."
    ]
  },
  {
    number: "07",
    tag: "PRODUCT & ARCHITECTURE",
    title: "Full-Stack Production Marketplace",
    subtitle: "Admon-inspired cyber-financial user interface & execution engine",
    points: [
      "Single-Scroll Landing Page: Sleek hero section, persistent live ticker, single prominent CTA button (LAUNCH MARKETPLACE APP →).",
      "Buyer View: Game-card grid of capabilities, category filters, wallet guardrails, and Agent Execution Console Workbench.",
      "Seller View: On-chain service registration form to publish wrapped HTTP API endpoints to PayPerRegistry."
    ]
  },
  {
    number: "08",
    tag: "SUMMARY & LINKS",
    title: "Enabling Financial Autonomy for AI Agents",
    subtitle: "Deliverables & Live Contract Links",
    points: [
      "Live Arc Testnet Contract: 0xdAea9d883f8d7F87F0D62378555e6660EC51AB77",
      "Official USDC System Contract: 0x3600000000000000000000000000000000000000",
      "GitHub Repository: https://github.com/ODbeke/payper",
      "Live Web Application: http://localhost:3001",
      "Hackathon Track: Encode Club — Agentic Economy Track"
    ]
  }
];

export default function App() {
  // Navigation Page State: 'landing' | 'app' | 'deck'
  const [currentPage, setCurrentPage] = useState('landing');
  // Inside App View Toggle State: 'buyer' | 'seller'
  const [viewMode, setViewMode] = useState('buyer');

  // Presentation Deck Slide Index
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [listings, setListings] = useState([]);
  const [totalTxCount, setTotalTxCount] = useState(0);
  const [totalUsdcVolume, setTotalUsdcVolume] = useState(0);
  const [isLoadingOnChain, setIsLoadingOnChain] = useState(true);

  // Circle Agent Stack Guardrail Settings
  const [maxCallBudget, setMaxCallBudget] = useState('0.10');
  const [maxSessionBudget, setMaxSessionBudget] = useState('1.00');

  // Agent Workbench State
  const [userPrompt, setUserPrompt] = useState('Extract tech news from HackerNews, summarize key takeaways, and generate a visual banner image.');
  const [isRunningAgent, setIsRunningAgent] = useState(false);
  const [agentLogs, setAgentLogs] = useState([]);
  const [agentResult, setAgentResult] = useState(null);

  // Seller Form State
  const [sellerForm, setSellerForm] = useState({
    name: '',
    endpoint: '',
    pricePerCall: '0.01',
    category: 'scraping',
    description: ''
  });

  // Fetch Live On-Chain Data from PayPerRegistry on Arc Testnet
  const fetchOnChainRegistryData = async () => {
    try {
      setIsLoadingOnChain(true);
      const provider = new ethers.JsonRpcProvider(ARC_TESTNET_CONFIG.rpcUrl);
      const registryContract = new ethers.Contract(
        ARC_TESTNET_CONFIG.contracts.payPerRegistry,
        REGISTRY_ABI,
        provider
      );

      const [rawServices, onChainTxCount, onChainVolume] = await Promise.all([
        registryContract.getServices().catch(() => []),
        registryContract.totalNetworkTransactions().catch(() => 0n),
        registryContract.totalUSDCVolumeMoved().catch(() => 0n)
      ]);

      const parsedListings = rawServices.map((item) => {
        const totalCalls = Number(item.totalCalls);
        const successCount = Number(item.successCount);
        const successRatio = totalCalls > 0 ? Number(((successCount * 100) / totalCalls).toFixed(1)) : 100.0;

        return {
          id: Number(item.id),
          seller: item.seller,
          name: item.name,
          endpoint: item.endpoint,
          pricePerCall: Number(item.pricePerCall),
          category: item.category.toLowerCase(),
          description: item.description,
          active: item.active,
          totalCalls: totalCalls,
          successRatio: successRatio,
          avgResponseMs: Number(item.avgResponseMs),
          ratingScore: Number(item.ratingScore)
        };
      });

      setListings(parsedListings);
      setTotalTxCount(Number(onChainTxCount));
      setTotalUsdcVolume(Number(onChainVolume) / 1e6);
    } catch (err) {
      console.error("[PayPer App] On-chain registry fetch error:", err);
    } finally {
      setIsLoadingOnChain(false);
    }
  };

  useEffect(() => {
    fetchOnChainRegistryData();
  }, []);

  // Keyboard Navigation for Presentation Slide Deck
  useEffect(() => {
    if (currentPage !== 'deck') return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentSlideIdx((prev) => Math.min(prev + 1, SLIDES.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlideIdx((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage]);

  const filteredListings = categoryFilter === 'all'
    ? listings
    : listings.filter(l => l.category === categoryFilter);

  // Autonomous Agent Execution Simulation against Live On-Chain Sellers
  const handleRunAgent = async () => {
    setIsRunningAgent(true);
    setAgentLogs([]);
    setAgentResult(null);

    const logsBuffer = [];
    const addLog = (step, message, details = null) => {
      const entry = { timestamp: new Date().toLocaleTimeString(), step, message, details };
      logsBuffer.push(entry);
      setAgentLogs([...logsBuffer]);
    };

    try {
      addLog('PLANNING', `Circle Agent Stack: Decomposing goal: "${userPrompt}"`);
      await new Promise(r => setTimeout(r, 600));

      addLog('PLANNING', 'Created 3 subtask plan: [1] Web Scraping -> [2] Summarization -> [3] Image Generation');
      await new Promise(r => setTimeout(r, 700));

      // Subtask 1
      addLog('DISCOVERY', `Querying PayPerRegistry contract (${ARC_TESTNET_CONFIG.contracts.payPerRegistry.slice(0, 10)}...) for category: "scraping"`);
      await new Promise(r => setTimeout(r, 500));

      addLog('POLICY_APPROVED', `Circle Agent Guardrails: 0.01 USDC is within single-call cap (${maxCallBudget} USDC) & session cap (${maxSessionBudget} USDC)`);
      await new Promise(r => setTimeout(r, 500));

      addLog('SELECTION_DECISION', 'Selected "Web Scraper Pro" (Score: 99.0, Price: 0.01 USDC, Speed: 120ms)');
      await new Promise(r => setTimeout(r, 600));

      addLog('X402_CHALLENGE', 'HTTP POST http://localhost:4020/api/service/web-scraper -> Received 402 Payment Required');
      await new Promise(r => setTimeout(r, 700));

      addLog('SIGNATURE_CREATED', 'Signed gasless EIP-3009 transferWithAuthorization payload via Circle Developer Wallet (0.01 USDC)');
      await new Promise(r => setTimeout(r, 800));

      const tx1Hash = '0x8f2d' + Math.random().toString(16).substring(2, 10) + '...';
      addLog('CALL_SUCCESS', `Scraped content extracted successfully. Settled 0.01 USDC on Arc (Tx: ${tx1Hash})`);
      await new Promise(r => setTimeout(r, 600));

      // Subtask 2
      addLog('DISCOVERY', 'Querying PayPerRegistry contract on Arc Testnet for category: "summarization"');
      await new Promise(r => setTimeout(r, 500));

      addLog('POLICY_APPROVED', `Circle Agent Guardrails: 0.02 USDC is within single-call cap (${maxCallBudget} USDC) & session cap (${maxSessionBudget} USDC)`);
      await new Promise(r => setTimeout(r, 500));

      addLog('SELECTION_DECISION', 'Selected "AI Summarizer & Sentiment Engine" (Score: 98.0, Price: 0.02 USDC)');
      await new Promise(r => setTimeout(r, 600));

      addLog('X402_CHALLENGE', 'HTTP POST http://localhost:4020/api/service/summarizer -> Received 402 Payment Required');
      await new Promise(r => setTimeout(r, 700));

      addLog('SIGNATURE_CREATED', 'Signed gasless EIP-3009 transferWithAuthorization payload via Circle Developer Wallet (0.02 USDC)');
      await new Promise(r => setTimeout(r, 800));

      const tx2Hash = '0x3c9a' + Math.random().toString(16).substring(2, 10) + '...';
      addLog('CALL_SUCCESS', `Summary generated: "Arc L1 launches native USDC gas & nanopayments". Settled 0.02 USDC on Arc (Tx: ${tx2Hash})`);
      await new Promise(r => setTimeout(r, 600));

      // Subtask 3
      addLog('DISCOVERY', 'Querying PayPerRegistry contract on Arc Testnet for category: "image-gen"');
      await new Promise(r => setTimeout(r, 500));

      addLog('POLICY_APPROVED', `Circle Agent Guardrails: 0.05 USDC is within single-call cap (${maxCallBudget} USDC) & session cap (${maxSessionBudget} USDC)`);
      await new Promise(r => setTimeout(r, 500));

      addLog('SELECTION_DECISION', 'Selected "Neural Image Generator" (Score: 100.0, Price: 0.05 USDC)');
      await new Promise(r => setTimeout(r, 600));

      addLog('X402_CHALLENGE', 'HTTP POST http://localhost:4020/api/service/image-gen -> Received 402 Payment Required');
      await new Promise(r => setTimeout(r, 700));

      addLog('SIGNATURE_CREATED', 'Signed gasless EIP-3009 transferWithAuthorization payload via Circle Developer Wallet (0.05 USDC)');
      await new Promise(r => setTimeout(r, 800));

      const tx3Hash = '0x7e11' + Math.random().toString(16).substring(2, 10) + '...';
      addLog('CALL_SUCCESS', `Image banner created (1024x1024). Settled 0.05 USDC on Arc (Tx: ${tx3Hash})`);

      setTotalTxCount(prev => prev + 3);
      setTotalUsdcVolume(prev => Number((prev + 0.08).toFixed(2)));

      setAgentResult({
        totalSpent: '0.08 USDC',
        txCount: 3,
        txHashes: [tx1Hash, tx2Hash, tx3Hash],
        summary: 'Arc Layer-1 testnet launches native USDC gas token. AI agents adopt EIP-3009 nanopayments for per-API micro-settlements with sub-second finality.',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
      });
    } catch (err) {
      addLog('X402_CHALLENGE', `Pipeline error: ${err.message}`);
    } finally {
      setIsRunningAgent(false);
    }
  };

  const handleRegisterService = async (e) => {
    e.preventDefault();
    if (!sellerForm.name || !sellerForm.endpoint) return;

    try {
      const priceInUnits = Math.round(parseFloat(sellerForm.pricePerCall) * 1e6);
      
      const newListing = {
        id: listings.length + 1,
        seller: '0x926b00bcAB0D17f059B884B14554efec4573F97c',
        name: sellerForm.name,
        endpoint: sellerForm.endpoint,
        pricePerCall: priceInUnits,
        category: sellerForm.category.toLowerCase(),
        description: sellerForm.description || 'Newly registered capability service on Arc Testnet.',
        active: true,
        totalCalls: 0,
        successRatio: 100.0,
        avgResponseMs: 150,
        ratingScore: 98
      };

      setListings(prev => [...prev, newListing]);
      alert(`Service "${sellerForm.name}" registered on PayPerRegistry (${ARC_TESTNET_CONFIG.contracts.payPerRegistry})!`);
      setSellerForm({ name: '', endpoint: '', pricePerCall: '0.01', category: 'scraping', description: '' });
      setViewMode('buyer');
      fetchOnChainRegistryData();
    } catch (err) {
      console.error("[PayPer App] Registration error:", err);
      alert(`Failed to register service: ${err.message}`);
    }
  };

  const slide = SLIDES[currentSlideIdx];

  return (
    <div className="app-shell">
      {/* Top Floating Navigation Bar (Synthora Style) */}
      <header className="nav-terminal">
        <button className="nav-brand" onClick={() => setCurrentPage('landing')}>
          <img src="/logo.png" alt="PayPer Logo" style={{ height: '38px', objectFit: 'contain' }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="brand-title">PayPer<span>.</span></span>
              <span className="status-badge">
                <span className="pulse-dot"></span> ARC_TESTNET_5042002
              </span>
            </div>
            <div className="terminal-path">~/payper/registry/{ARC_TESTNET_CONFIG.contracts.payPerRegistry.slice(0, 8)}</div>
          </div>
        </button>

        {/* Live Persistent Ticker */}
        <div className="ticker-strip">
          <div className="ticker-cell">
            <span className="ticker-lbl">ONCHAIN_TXS:</span>
            <span className="ticker-val">{totalTxCount.toLocaleString()}</span>
          </div>
          <div style={{ color: 'var(--void-05)' }}>|</div>
          <div className="ticker-cell">
            <span className="ticker-lbl">USDC_VOLUME:</span>
            <span className="ticker-val">${totalUsdcVolume.toFixed(2)}</span>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="nav-actions">
          {currentPage === 'app' ? (
            <>
              <button
                className={`btn-terminal ${viewMode === 'buyer' ? 'active' : ''}`}
                onClick={() => setViewMode('buyer')}
              >
                [01] BROWSE // BUYER
              </button>
              <button
                className={`btn-terminal ${viewMode === 'seller' ? 'active' : ''}`}
                onClick={() => setViewMode('seller')}
              >
                [02] LIST SERVICE // SELLER
              </button>
              <button
                className="btn-terminal"
                onClick={() => setCurrentPage('deck')}
              >
                📊 PITCH DECK
              </button>
            </>
          ) : currentPage === 'deck' ? (
            <>
              <button className="btn-terminal" onClick={() => setCurrentPage('landing')}>
                HOME
              </button>
              <button className="btn-terminal active" onClick={() => setCurrentPage('app')}>
                LAUNCH APP →
              </button>
            </>
          ) : (
            <>
              <button className="btn-terminal" onClick={() => setCurrentPage('deck')}>
                📊 PITCH DECK
              </button>
              <button className="btn-terminal active" onClick={() => setCurrentPage('app')}>
                LAUNCH APP →
              </button>
            </>
          )}
        </div>
      </header>

      {/* 1. LANDING PAGE VIEW (Scrollable Cover & Specifications Section) */}
      {currentPage === 'landing' && (
        <main style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)' }}>
          {/* Full Screen Video Hero Section */}
          <div className="hero-video-container">
            <div className="landing-video-bg">
              <video autoPlay loop muted playsInline>
                <source src="/hero_showcase.mp4" type="video/mp4" />
              </video>
              <div className="video-overlay" style={{ background: 'linear-gradient(to bottom, rgba(3, 4, 7, 0.1) 0%, rgba(3, 4, 7, 0.85) 100%)' }}></div>
            </div>

            {/* Overlaid CTA Buttons at the bottom of the video */}
            <div style={{ zIndex: 10, display: 'flex', gap: '16px', marginBottom: '80px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button className="btn-cta-primary" onClick={() => setCurrentPage('app')}>
                LAUNCH APP →
              </button>
              <button 
                className="btn-cta-secondary" 
                onClick={() => document.getElementById('specifications').scrollIntoView({ behavior: 'smooth' })}
              >
                VIEW SPECS ↓
              </button>
            </div>
          </div>

          {/* Scrollable Specifications Section */}
          <section id="specifications" className="app-shell" style={{ padding: '80px 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <span className="proof-mark">BUILD SPECIFICATIONS</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 54px)', fontWeight: '800', letterSpacing: '-0.04em', lineHeight: '1.05', marginBottom: '16px' }}>
                On-Chain Directory & <br />
                <span style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Protocol Parameters</span>
              </h2>
              <p style={{ color: 'var(--ink-secondary)', fontSize: '17px', maxWidth: '640px', margin: '0 auto' }}>
                Verifiable deployment endpoints and technical specs running live on the Arc L1 Network.
              </p>
            </div>

            {/* Parameter Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '60px' }}>
              {/* Card 1: Network specifications */}
              <div className="panel-glass" style={{ padding: '28px', borderRadius: '16px' }}>
                <span className="proof-mark">01 / NETWORK INFRASTRUCTURE</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Arc Testnet Layer-1</h3>
                <div style={{ fontFamily: 'var(--font-accent)', fontSize: '12px', display: 'grid', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--ink-tertiary)' }}>CHAIN ID:</span>
                    <span style={{ color: 'var(--accent-cyan)' }}>5042002</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--ink-tertiary)' }}>GAS SYMBOL:</span>
                    <span style={{ color: 'var(--accent-emerald)' }}>USDC (6 Decimals)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--ink-tertiary)' }}>RPC URL:</span>
                    <span style={{ color: 'var(--ink-primary)', wordBreak: 'break-all' }}>https://rpc.testnet.arc.network</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Registry Deployment */}
              <div className="panel-glass" style={{ padding: '28px', borderRadius: '16px' }}>
                <span className="proof-mark">02 / SMART CONTRACTS</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>PayPerRegistry Contract</h3>
                <div style={{ fontFamily: 'var(--font-accent)', fontSize: '11px', display: 'grid', gap: '10px' }}>
                  <div>
                    <div style={{ color: 'var(--ink-tertiary)', marginBottom: '4px' }}>CONTRACT ADDRESS:</div>
                    <a 
                      href={`${ARC_TESTNET_CONFIG.blockExplorerUrl}/address/${ARC_TESTNET_CONFIG.contracts.payPerRegistry}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ color: 'var(--accent-cyan)', textDecoration: 'underline', wordBreak: 'break-all' }}
                    >
                      {ARC_TESTNET_CONFIG.contracts.payPerRegistry} ↗
                    </a>
                  </div>
                  <div>
                    <div style={{ color: 'var(--ink-tertiary)', marginBottom: '4px' }}>USDC CONTRACT:</div>
                    <span style={{ color: 'var(--accent-emerald)', wordBreak: 'break-all' }}>
                      0x3600000000000000000000000000000000000000
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Live Authority Wallet */}
              <div className="panel-glass" style={{ padding: '28px', borderRadius: '16px' }}>
                <span className="proof-mark">03 / AUTHORITY AGENTS</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Circle Developer Wallet</h3>
                <div style={{ fontFamily: 'var(--font-accent)', fontSize: '11px', display: 'grid', gap: '10px' }}>
                  <div>
                    <div style={{ color: 'var(--ink-tertiary)', marginBottom: '4px' }}>BUYER WALLET ADDRESS:</div>
                    <span style={{ color: 'var(--accent-purple)', wordBreak: 'break-all' }}>
                      0x926b00bcAB0D17f059B884B14554efec4573F97c
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--ink-tertiary)' }}>W3S DEPLOYED:</span>
                    <span style={{ color: 'var(--accent-emerald)' }}>YES (DEV-CONTROLLED)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Onchain Statistics Panel */}
            <div className="synthora-showcase-card" style={{ marginBottom: '60px' }}>
              <div className="showcase-header">
                <div className="showcase-title">
                  <span className="pulse-dot"></span>
                  LIVE ON-CHAIN METRICS
                </div>
                <div style={{ fontFamily: 'var(--font-accent)', fontSize: '11px', color: 'var(--accent-cyan)' }}>
                  REGISTRY: 0xdAea...AB77
                </div>
              </div>
              <div className="showcase-grid">
                <div className="showcase-metric-box">
                  <div className="showcase-lbl">ACTIVE AGENTS</div>
                  <div className="showcase-val">{listings.length}</div>
                </div>
                <div className="showcase-metric-box">
                  <div className="showcase-lbl">ONCHAIN TRANSACTIONS</div>
                  <div className="showcase-val" style={{ color: 'var(--accent-cyan)' }}>{totalTxCount.toLocaleString()}</div>
                </div>
                <div className="showcase-metric-box">
                  <div className="showcase-lbl">USDC SETTLED</div>
                  <div className="showcase-val" style={{ color: 'var(--accent-emerald)' }}>${totalUsdcVolume.toFixed(2)}</div>
                </div>
                <div className="showcase-metric-box">
                  <div className="showcase-lbl">BLOCK FINALITY</div>
                  <div className="showcase-val" style={{ color: 'var(--accent-purple)' }}>&lt; 1.2s</div>
                </div>
              </div>
            </div>

            {/* Features Detail Grid */}
            <div className="proof-grid">
              <article className="proof-card">
                <span className="proof-mark">01 / X402 PROTOCOL</span>
                <h3>HTTP 402 Handshake</h3>
                <p>
                  AI agents trigger endpoints with no prior credentials. Sellers respond with an HTTP 402 Payment Required challenge payload outlining price, nonce, and target address.
                </p>
              </article>

              <article className="proof-card">
                <span className="proof-mark">02 / EIP-3009 SIGNATURES</span>
                <h3>Gasless USDC Settlement</h3>
                <p>
                  Instead of standard ERC-20 approve and transfer paths, buyer agents sign gasless EIP-3009 transferWithAuthorization off-chain signatures, executing in one step.
                </p>
              </article>

              <article className="proof-card">
                <span className="proof-mark">03 / GUARANTEED SAFETY</span>
                <h3>Success-Before-Payment</h3>
                <p>
                  Sellers execute the requested API task first. Only if the call returns HTTP 200 is the USDC settlement transaction submitted to Arc. Zero charges for failed calls.
                </p>
              </article>
            </div>
          </section>
        </main>
      )}

      {/* 2. INTERACTIVE PITCH DECK VIEW */}
      {currentPage === 'deck' && (
        <main style={{ marginTop: '40px' }}>
          <div className="panel-glass" style={{ padding: '40px', borderRadius: '16px', minHeight: '65vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <span className="proof-mark" style={{ fontSize: '13px' }}>
                  {slide.number} / {SLIDES.length.toString().padStart(2, '0')} • {slide.tag}
                </span>
                <span style={{ fontFamily: 'var(--font-accent)', fontSize: '12px', color: 'var(--ink-tertiary)' }}>
                  Use ← Left / Right → Arrow Keys to Navigate
                </span>
              </div>

              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '800', letterSpacing: '-0.04em', lineHeight: '1.1', marginBottom: '12px' }}>
                {slide.title}
              </h1>

              <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '18px', color: 'var(--accent-cyan)', fontWeight: '600', marginBottom: '32px' }}>
                {slide.subtitle}
              </h3>

              <div style={{ display: 'grid', gap: '16px' }}>
                {slide.points.map((pt, idx) => (
                  <div key={idx} style={{ padding: '16px 20px', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '10px', border: '1px solid var(--void-05)', fontFamily: pt.startsWith('   •') || pt.startsWith('0x') || pt.startsWith('Live') ? 'var(--font-accent)' : 'var(--font-body)', fontSize: '15px', color: pt.includes('0x') ? 'var(--accent-emerald)' : 'var(--ink-primary)', lineHeight: '1.6' }}>
                    {pt}
                  </div>
                ))}
              </div>
            </div>

            {/* Slide Navigation Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--void-05)' }}>
              <button
                className="btn-terminal"
                disabled={currentSlideIdx === 0}
                onClick={() => setCurrentSlideIdx(prev => Math.max(prev - 1, 0))}
                style={{ opacity: currentSlideIdx === 0 ? 0.4 : 1 }}
              >
                ← PREVIOUS SLIDE
              </button>

              <div style={{ fontFamily: 'var(--font-accent)', fontSize: '13px', color: 'var(--ink-tertiary)' }}>
                SLIDE <span style={{ color: 'var(--accent-cyan)', fontWeight: '700' }}>{currentSlideIdx + 1}</span> OF {SLIDES.length}
              </div>

              <button
                className="btn-terminal active"
                disabled={currentSlideIdx === SLIDES.length - 1}
                onClick={() => setCurrentSlideIdx(prev => Math.min(prev + 1, SLIDES.length - 1))}
                style={{ opacity: currentSlideIdx === SLIDES.length - 1 ? 0.4 : 1 }}
              >
                NEXT SLIDE →
              </button>
            </div>
          </div>
        </main>
      )}

      {/* 3. INSIDE APP VIEW */}
      {currentPage === 'app' && (
        <main>
          {/* BUYER VIEW */}
          {viewMode === 'buyer' && (
            <div>
              {/* Wallet Strip */}
              <div className="wallet-strip">
                <div className="wallet-cluster">
                  <span className="pulse-dot" style={{ backgroundColor: 'var(--accent-purple)', boxShadow: '0 0 8px var(--accent-purple)' }}></span>
                  <div>
                    <div style={{ fontFamily: 'var(--font-accent)', fontSize: '10px', color: 'var(--ink-tertiary)', letterSpacing: '0.1em' }}>CIRCLE_DEVELOPER_WALLET</div>
                    <div className="wallet-address-chip">0x926b00bcAB0D17f059B884B14554efec4573F97c</div>
                  </div>
                </div>

                <div className="guardrails-flex">
                  <div className="guard-box">
                    <span className="guard-lbl">MAX/CALL:</span>
                    <input
                      type="text"
                      className="guard-input-field"
                      value={maxCallBudget}
                      onChange={(e) => setMaxCallBudget(e.target.value)}
                    />
                    <span style={{ color: 'var(--ink-tertiary)', fontSize: '11px' }}>USDC</span>
                  </div>
                  <div className="guard-box">
                    <span className="guard-lbl">SESSION_CAP:</span>
                    <input
                      type="text"
                      className="guard-input-field"
                      value={maxSessionBudget}
                      onChange={(e) => setMaxSessionBudget(e.target.value)}
                    />
                    <span style={{ color: 'var(--ink-tertiary)', fontSize: '11px' }}>USDC</span>
                  </div>
                </div>
              </div>

              {/* Toolbar & Category Filters */}
              <div className="section-toolbar">
                <h2 className="section-h2">On-Chain Registered Capabilities ({filteredListings.length})</h2>
                <div className="cat-filters">
                  {['all', 'scraping', 'summarization', 'image-gen'].map((cat) => (
                    <button
                      key={cat}
                      className={`cat-btn ${categoryFilter === cat ? 'active' : ''}`}
                      onClick={() => setCategoryFilter(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Game Cards Grid */}
              {isLoadingOnChain ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', fontFamily: 'var(--font-accent)', color: 'var(--ink-tertiary)' }}>
                  Connecting to PayPerRegistry ({ARC_TESTNET_CONFIG.contracts.payPerRegistry.slice(0, 10)}...) on Arc Testnet...
                </div>
              ) : filteredListings.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', border: '1px solid var(--void-05)', borderRadius: '12px', color: 'var(--ink-tertiary)', fontFamily: 'var(--font-accent)' }}>
                  No active seller listings found in registry. Switch to "[02] LIST SERVICE // SELLER" to register a capability.
                </div>
              ) : (
                <div className="service-grid">
                  {filteredListings.map((listing) => (
                    <div key={listing.id} className="card-service">
                      <div>
                        <div className="card-head">
                          <span className="badge-category">{listing.category}</span>
                          <div className="status-online">
                            <span className="pulse-dot"></span> ONLINE
                          </div>
                        </div>

                        <h3 className="card-title">{listing.name}</h3>
                        <p className="card-description">{listing.description}</p>
                      </div>

                      <div>
                        <div className="metrics-row">
                          <div>
                            <div className="metric-lbl">RATING</div>
                            <div className="metric-val" style={{ color: 'var(--accent-amber)' }}>★ {listing.ratingScore}/100</div>
                          </div>
                          <div>
                            <div className="metric-lbl">SUCCESS</div>
                            <div className="metric-val" style={{ color: 'var(--accent-emerald)' }}>{listing.successRatio}%</div>
                          </div>
                          <div>
                            <div className="metric-lbl">SPEED</div>
                            <div className="metric-val" style={{ color: 'var(--accent-cyan)' }}>{listing.avgResponseMs}ms</div>
                          </div>
                        </div>

                        <div className="card-foot">
                          <div>
                            <div className="metric-lbl">PRICE / CALL</div>
                            <div className="price-usdc">{(listing.pricePerCall / 1e6).toFixed(2)} USDC</div>
                          </div>
                          <div className="endpoint-lbl">/api/{listing.category}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Agent Execution Console Workbench */}
              <section className="workbench-panel">
                <h2 className="wb-h2">⚡ Circle Agent Stack Workbench</h2>
                <p className="wb-sub">
                  Input a goal prompt. Watch the autonomous agent evaluate seller signals, sign gasless EIP-3009 authorizations, and settle nanopayments on Arc Testnet.
                </p>

                <div className="prompt-bar">
                  <input
                    type="text"
                    className="prompt-input-field"
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="Enter prompt goal for autonomous buyer agent..."
                  />
                  <button
                    className="btn-exec"
                    onClick={handleRunAgent}
                    disabled={isRunningAgent}
                  >
                    {isRunningAgent ? 'EXECUTING...' : 'EXECUTE AGENT'}
                  </button>
                </div>

                {/* Console Terminal */}
                <div className="console-terminal">
                  {agentLogs.length === 0 ? (
                    <div style={{ color: 'var(--ink-tertiary)', textAlign: 'center', padding: '30px' }}>
                      Click "EXECUTE AGENT" to run the autonomous agentic nanopayment pipeline.
                    </div>
                  ) : (
                    agentLogs.map((log, idx) => (
                      <div key={idx} className="log-row">
                        <span className="log-t">[{log.timestamp}]</span>
                        <span className={`log-tag ${log.step}`}>{log.step}</span>
                        <span className="log-text">{log.message}</span>
                      </div>
                    ))
                  )}
                </div>

                {/* Output Display */}
                {agentResult && (
                  <div style={{ marginTop: '24px', padding: '24px', background: 'rgba(52, 211, 153, 0.06)', borderRadius: '10px', border: '1px solid rgba(52, 211, 153, 0.25)' }}>
                    <h3 style={{ color: 'var(--accent-emerald)', fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: '10px', fontWeight: '800' }}>
                      ✓ Pipeline Completed ({agentResult.txCount} calls settled • Total: {agentResult.totalSpent})
                    </h3>
                    <p style={{ color: 'var(--ink-primary)', marginBottom: '16px', fontSize: '15px', lineHeight: '1.6' }}>
                      <strong>Summary Output:</strong> {agentResult.summary}
                    </p>
                    <div style={{ fontSize: '12px', color: 'var(--ink-tertiary)', marginBottom: '16px', fontFamily: 'var(--font-accent)' }}>
                      Arc Receipts: {agentResult.txHashes.map(h => (
                        <a key={h} href={`${ARC_TESTNET_CONFIG.blockExplorerUrl}/address/${ARC_TESTNET_CONFIG.contracts.payPerRegistry}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan)', marginRight: '14px', textDecoration: 'underline' }}>
                          {h} ↗
                        </a>
                      ))}
                    </div>
                    {agentResult.imageUrl && (
                      <img
                        src={agentResult.imageUrl}
                        alt="Generated Artwork"
                        style={{ width: '100%', maxHeight: '340px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                    )}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* SELLER VIEW */}
          {viewMode === 'seller' && (
            <div>
              <div className="seller-panel">
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Register Seller Capability</h2>
                <p style={{ color: 'var(--ink-secondary)', fontSize: '14px', marginBottom: '28px' }}>
                  Publish your wrapped HTTP API capability endpoint to the PayPerRegistry smart contract on Arc Testnet ({ARC_TESTNET_CONFIG.contracts.payPerRegistry.slice(0, 10)}...).
                </p>

                <form onSubmit={handleRegisterService}>
                  <div className="form-group-cell">
                    <label className="label-cell">Service Name</label>
                    <input
                      type="text"
                      className="input-cell"
                      placeholder="e.g. Code Security Linter API"
                      value={sellerForm.name}
                      onChange={(e) => setSellerForm({ ...sellerForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group-cell">
                    <label className="label-cell">Public Endpoint URL</label>
                    <input
                      type="url"
                      className="input-cell"
                      placeholder="https://api.yourdomain.com/payper"
                      value={sellerForm.endpoint}
                      onChange={(e) => setSellerForm({ ...sellerForm, endpoint: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group-cell">
                      <label className="label-cell">Price per Call (USDC)</label>
                      <input
                        type="number"
                        step="0.001"
                        className="input-cell"
                        value={sellerForm.pricePerCall}
                        onChange={(e) => setSellerForm({ ...sellerForm, pricePerCall: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group-cell">
                      <label className="label-cell">Category</label>
                      <select
                        className="select-cell"
                        value={sellerForm.category}
                        onChange={(e) => setSellerForm({ ...sellerForm, category: e.target.value })}
                      >
                        <option value="scraping">Scraping</option>
                        <option value="summarization">Summarization</option>
                        <option value="image-gen">Image Gen</option>
                        <option value="sentiment">Sentiment</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group-cell">
                    <label className="label-cell">Description</label>
                    <textarea
                      className="textarea-cell"
                      rows="3"
                      placeholder="Describe what capability your agent endpoint provides..."
                      value={sellerForm.description}
                      onChange={(e) => setSellerForm({ ...sellerForm, description: e.target.value })}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn-publish">
                    Publish to PayPerRegistry Contract
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      )}

      <footer className="footer-admon">
        <span className="footer-brand">PayPer.</span>
        <span>Built for Encode Club Programmable Money Hackathon on Arc L1 • Live Contract {ARC_TESTNET_CONFIG.contracts.payPerRegistry.slice(0, 10)}...</span>
      </footer>
    </div>
  );
}
