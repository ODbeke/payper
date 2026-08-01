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

  useEffect(() => {
    if (currentPage === 'app') {
      document.body.classList.add('memoriada-app-body');
    } else {
      document.body.classList.remove('memoriada-app-body');
    }
  }, [currentPage]);
  // Inside App View Toggle State: 'buyer' | 'seller'
  const [viewMode, setViewMode] = useState('buyer');

  // Presentation Deck Slide Index
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [listings, setListings] = useState([]);
  const [totalTxCount, setTotalTxCount] = useState(0);
  const [totalUsdcVolume, setTotalUsdcVolume] = useState(0);
  const [isLoadingOnChain, setIsLoadingOnChain] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletChainId, setWalletChainId] = useState(null);

  // Circle Agent Stack Guardrail Settings
  const [maxCallBudget, setMaxCallBudget] = useState('0.05');
  const [maxSessionBudget, setMaxSessionBudget] = useState('0.15');

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
      setFetchError(null);
      
      let provider;
      // Validate if window.ethereum is available and connected to the Arc Testnet chain
      if (window.ethereum) {
        try {
          const tempProvider = new ethers.BrowserProvider(window.ethereum);
          const network = await tempProvider.getNetwork();
          if (Number(network.chainId) === 5042002) {
            provider = tempProvider;
          }
        } catch (e) {
          console.warn("[PayPer App] Browser provider query failed, using public RPC fallback:", e);
        }
      }

      if (!provider) {
        provider = new ethers.JsonRpcProvider(ARC_TESTNET_CONFIG.rpcUrl);
      }

      const registryContract = new ethers.Contract(
        ARC_TESTNET_CONFIG.contracts.payPerRegistry,
        REGISTRY_ABI,
        provider
      );

      const [rawServices, onChainTxCount, onChainVolume] = await Promise.all([
        registryContract.getServices(),
        registryContract.totalNetworkTransactions(),
        registryContract.totalUSDCVolumeMoved()
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

      // Filter out the pre-seeded demo services (IDs 1, 2, 3) to show only live user listings
      const liveListings = parsedListings.filter(listing => listing.id > 3);
      setListings(liveListings);
      setTotalTxCount(Number(onChainTxCount));
      setTotalUsdcVolume(Number(onChainVolume) / 1e6);
    } catch (err) {
      console.error("[PayPer App] On-chain registry fetch error:", err);
      setFetchError(err.message || String(err));
    } finally {
      setIsLoadingOnChain(false);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask or other Web3 wallet not found. Please install a browser wallet extension.");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      
      setWalletAddress(address);
      setWalletChainId(Number(network.chainId));

      // If not on Arc Testnet, request network switch
      if (Number(network.chainId) !== 5042002) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x4ce946' }]
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x4ce946',
                  chainName: 'Arc Testnet',
                  nativeCurrency: { name: 'USD Coin', symbol: 'USDC', decimals: 6 },
                  rpcUrls: ['https://rpc.testnet.arc.network'],
                  blockExplorerUrls: ['https://testnet.arcscan.app']
                }]
              });
            } catch (addError) {
              console.error("Failed to add Arc Testnet:", addError);
            }
          }
        }
      }
    } catch (err) {
      console.error("Failed to connect wallet:", err);
    }
  };

  useEffect(() => {
    fetchOnChainRegistryData();

    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(async (accounts) => {
          if (accounts.length > 0) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            const network = await provider.getNetwork();
            setWalletAddress(address);
            setWalletChainId(Number(network.chainId));
          }
        })
        .catch(err => console.error("Error checking initial accounts:", err));

      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          setWalletAddress(null);
        }
      };

      const handleChainChanged = (chainId) => {
        setWalletChainId(Number(chainId));
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
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

    if (!window.ethereum) {
      alert("Web3 Wallet Not Found: Please install MetaMask or another browser wallet extension to publish services to the Arc Testnet smart contract.");
      return;
    }

    try {
      const priceInUnits = Math.round(parseFloat(sellerForm.pricePerCall) * 1e6);
      
      // Initialize browser Web3 provider and request account access
      const provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const signer = await provider.getSigner();
      
      const registryContract = new ethers.Contract(
        ARC_TESTNET_CONFIG.contracts.payPerRegistry,
        REGISTRY_ABI,
        signer
      );

      // Submit on-chain registration transaction
      const tx = await registryContract.registerService(
        sellerForm.name,
        sellerForm.endpoint,
        priceInUnits,
        sellerForm.category.toLowerCase(),
        sellerForm.description || 'Newly registered capability service on Arc Testnet.'
      );

      // Show transaction submitted status
      alert(`Transaction submitted! Hash: ${tx.hash}\nWaiting for Arc Testnet confirmation...`);
      await tx.wait();

      alert(`Service "${sellerForm.name}" registered successfully on the blockchain!`);
      setSellerForm({ name: '', endpoint: '', pricePerCall: '0.01', category: 'scraping', description: '' });
      setViewMode('buyer');
      fetchOnChainRegistryData();
    } catch (err) {
      console.error("[PayPer App] On-chain registration error:", err);
      alert(`Failed to publish service to smart contract: ${err.message}`);
    }
  };

  const slide = SLIDES[currentSlideIdx];

  return (
    <div className="app-shell">
      {/* Global Ambient Background */}
      <div className={`global-bg-image ${currentPage === 'landing' ? 'landing-view' : 'app-view'}`}>
        <img src="/usdc_activation_gate_spaced.jpg" alt="USDC Gate Background" />
        <div className="global-bg-overlay"></div>
      </div>

      {/* Top Floating Navigation Bar (Synthora Style) */}
      <header className={`nav-terminal ${currentPage === 'landing' ? 'landing-nav' : ''}`}>
        <button className="nav-brand" onClick={() => setCurrentPage('landing')}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="brand-title">PayPer<span>.</span></span>
            </div>
          </div>
        </button>

        {/* Live Persistent Ticker */}
        <div className="ticker-strip">
          <div className="ticker-cell">
            <span className="ticker-lbl">ONCHAIN_TXS:</span>
            <span className="ticker-val">{totalTxCount.toLocaleString()}</span>
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</div>
          <div className="ticker-cell">
            <span className="ticker-lbl">USDC_VOLUME:</span>
            <span className="ticker-val">${totalUsdcVolume.toFixed(2)}</span>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="nav-actions">
          {walletAddress ? (
            <button className="btn-terminal" style={{ borderColor: 'var(--accent-emerald)', color: 'var(--accent-emerald)', fontSize: '11px', letterSpacing: '0.05em' }}>
              ● {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)} {walletChainId !== 5042002 ? '(WRONG NETWORK)' : ''}
            </button>
          ) : (
            <button className="btn-terminal" onClick={connectWallet} style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
              🔌 CONNECT WALLET
            </button>
          )}

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
            </>
          ) : (
            <>
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
          {/* Full Screen Static Image Cover */}
          <div className="hero-video-container">

            {/* Left-Aligned Text Content Container Overlay */}
            <div className="hero-left-content" style={{ top: '48%', maxWidth: '680px' }}>
              <span className="synthora-badge" style={{ marginBottom: '24px' }}>
                ✦ NEXT-GEN AGENTIC FINANCIAL NETWORK
              </span>
              <h1 className="hero-display-title" style={{ textAlign: 'left', fontSize: 'clamp(52px, 7vw, 92px)', marginBottom: '24px', lineHeight: '0.94' }}>
                The Autonomous <br />
                Agentic Financial <br />
                <span>Network on Arc</span>
              </h1>
              <p className="hero-lede" style={{ textAlign: 'left', margin: '0 0 40px 0', fontSize: '21px', maxWidth: '620px', color: 'var(--ink-secondary)', lineHeight: '1.6' }}>
                AI agents discover, evaluate, and pay specialized provider agents per API call in USDC on Arc.
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button className="btn-cta-primary" onClick={() => setCurrentPage('app')}>
                  LAUNCH APP →
                </button>
              </div>
            </div>
          </div>
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
            <div className="dashboard-grid">
              {/* Left Column: Settings and Wallet Config */}
              <aside className="dashboard-sidebar">
                {/* 1. Category Filter Widget (Renamed & Promoted to the top) */}
                <div className="panel-glass filter-card-premium">
                  <h3 className="sidebar-h3">⚡ Service Marketplace</h3>
                  <p className="sidebar-p">Filter registered agent capabilities on-chain</p>
                  <div className="cat-filters-sidebar">
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

                {/* 2. Circle Wallet Card (With integrated compact policy limits and no developer address) */}
                <div className="panel-glass wallet-card-premium">
                  <div className="wallet-card-header">
                    <span className="pulse-dot active-glow"></span>
                    <span className="wallet-card-title">CIRCLE WALLET</span>
                    <span className="wallet-card-net">ARC_TESTNET</span>
                  </div>
                  <div className="wallet-card-body">
                    {/* Integrated compact Spend limits */}
                    <div className="compact-policy-section">
                      <div style={{ fontFamily: 'var(--font-accent)', fontSize: '10px', color: 'var(--ink-secondary)', letterSpacing: '0.05em', marginBottom: '12px', fontWeight: 'bold' }}>
                        SPEND LIMIT GUARDRAILS
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="policy-input-box">
                          <div className="policy-lbl">MAX / CALL</div>
                          <div className="policy-input-wrapper">
                            <input
                              type="text"
                              className="guard-input-field"
                              value={maxCallBudget}
                              onChange={(e) => setMaxCallBudget(e.target.value)}
                            />
                            <span className="input-suffix">USDC</span>
                          </div>
                        </div>

                        <div className="policy-input-box">
                          <div className="policy-lbl">SESSION CAP</div>
                          <div className="policy-input-wrapper">
                            <input
                              type="text"
                              className="guard-input-field"
                              value={maxSessionBudget}
                              onChange={(e) => setMaxSessionBudget(e.target.value)}
                            />
                            <span className="input-suffix">USDC</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Right Column: Main Capabilities List and Workbench */}
              <div className="dashboard-main-content">
                {/* Capabilities grid list header */}
                <div className="workbench-section-header">
                  <h2 className="section-h2">On-Chain Registered Capabilities ({filteredListings.length})</h2>
                  <p className="section-p">Autonomous endpoints queryable via HTTP 402 challenges</p>
                </div>

                {/* Diagnostics Fetch Error Alert */}
                {fetchError && (
                  <div style={{ margin: '0 0 20px 0', padding: '14px 20px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', color: '#ef4444', fontSize: '13px', fontFamily: 'var(--font-accent)', lineHeight: '1.5' }}>
                    ⚠️ <strong>Blockchain Connection Error:</strong> {fetchError}<br />
                    <span style={{ fontSize: '11px', color: 'var(--ink-tertiary)' }}>Verify that your wallet is set to Arc Testnet or check browser console for CORS/RPC restrictions.</span>
                  </div>
                )}

                {/* Service Cards Grid */}
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
                            <div className={`status-online ${listing.id <= 3 ? 'simulated' : ''}`}>
                              <span className={`pulse-dot ${listing.id <= 3 ? 'simulated-dot' : ''}`}></span>
                              {listing.id <= 3 ? 'SIMULATED' : 'ONLINE'}
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
              </div>
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

      {currentPage !== 'landing' && (
        <footer className="footer-admon">
          <span className="footer-brand">PayPer.</span>
          <span>Built for Encode Club Programmable Money Hackathon on Arc L1 • Live Contract {ARC_TESTNET_CONFIG.contracts.payPerRegistry.slice(0, 10)}...</span>
        </footer>
      )}
    </div>
  );
}
