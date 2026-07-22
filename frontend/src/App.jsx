import React, { useState } from 'react';
import './index.css';
import { ARC_TESTNET_CONFIG, ArcAppKit } from '../../config/arcConfig.js';

// Initial Mock Seed Data from PayPerRegistry on Arc
const INITIAL_LISTINGS = [
  {
    id: 1,
    seller: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    name: 'Web Scraper Pro',
    endpoint: 'http://localhost:4020/api/service/web-scraper',
    pricePerCall: 10000, // 0.01 USDC
    category: 'scraping',
    description: 'Fast headless page extraction & structured JSON parser with DOM filtering.',
    active: true,
    totalCalls: 142,
    successRatio: 99.3,
    avgResponseMs: 120,
    ratingScore: 99
  },
  {
    id: 2,
    seller: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    name: 'AI Summarizer & Sentiment Engine',
    endpoint: 'http://localhost:4020/api/service/summarizer',
    pricePerCall: 20000, // 0.02 USDC
    category: 'summarization',
    description: 'LLM summary engine with sentiment scoring and bullet-point key insight extraction.',
    active: true,
    totalCalls: 289,
    successRatio: 98.6,
    avgResponseMs: 180,
    ratingScore: 98
  },
  {
    id: 3,
    seller: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    name: 'Neural Image Generator',
    endpoint: 'http://localhost:4020/api/service/image-gen',
    pricePerCall: 50000, // 0.05 USDC
    category: 'image-gen',
    description: 'High-speed visual banner and promotional graphic generation for AI agents.',
    active: true,
    totalCalls: 94,
    successRatio: 100.0,
    avgResponseMs: 340,
    ratingScore: 100
  }
];

export default function App() {
  const [viewMode, setViewMode] = useState('buyer'); // 'buyer' | 'seller'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [listings, setListings] = useState(INITIAL_LISTINGS);
  const [totalTxCount, setTotalTxCount] = useState(528);
  const [totalUsdcVolume, setTotalUsdcVolume] = useState(9.56);

  // Circle Agent Stack Guardrail Settings
  const [maxCallBudget, setMaxCallBudget] = useState('0.10');
  const [maxSessionBudget, setMaxSessionBudget] = useState('1.00');

  // Agent Workbench State
  const [userPrompt, setUserPrompt] = useState('Extract tech news from HackerNews, summarize key takeaways, and generate a banner image.');
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

  const filteredListings = categoryFilter === 'all'
    ? listings
    : listings.filter(l => l.category === categoryFilter);

  // Run Autonomous Agent Pipeline Simulation under Circle Agent Stack Rules
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
      // Step 1: Planning under Circle Agent Stack
      addLog('PLANNING', `Circle Agent Stack: Decomposing goal: "${userPrompt}"`);
      await new Promise(r => setTimeout(r, 600));

      addLog('PLANNING', 'Created 3 subtask plan: [1] Web Scraping -> [2] Summarization -> [3] Image Generation');
      await new Promise(r => setTimeout(r, 700));

      // Subtask 1: Scraping
      addLog('DISCOVERY', 'Querying PayPerRegistry contract on Arc Testnet (Chain 5040) for category: "scraping"');
      await new Promise(r => setTimeout(r, 500));

      addLog('POLICY_APPROVED', `Circle Agent Stack: 0.01 USDC complies with single-call cap (${maxCallBudget} USDC) & session cap (${maxSessionBudget} USDC)`);
      await new Promise(r => setTimeout(r, 500));

      addLog('SELECTION_DECISION', 'Selected "Web Scraper Pro" (Score: 99.4, Price: 0.01 USDC, Speed: 120ms)');
      await new Promise(r => setTimeout(r, 600));

      addLog('X402_CHALLENGE', 'HTTP POST http://localhost:4020/api/service/web-scraper -> Received 402 Payment Required');
      await new Promise(r => setTimeout(r, 700));

      addLog('SIGNATURE_CREATED', 'Signed gasless EIP-3009 transferWithAuthorization payload via Circle Developer Wallet (0.01 USDC)');
      await new Promise(r => setTimeout(r, 800));

      const tx1Hash = '0x8f2d' + Math.random().toString(16).substring(2, 10) + '...';
      addLog('CALL_SUCCESS', `Scraped content extracted successfully. Settled 0.01 USDC on Arc (Tx: ${tx1Hash})`);
      await new Promise(r => setTimeout(r, 600));

      // Subtask 2: Summarization
      addLog('DISCOVERY', 'Querying PayPerRegistry contract on Arc Testnet for category: "summarization"');
      await new Promise(r => setTimeout(r, 500));

      addLog('POLICY_APPROVED', `Circle Agent Stack: 0.02 USDC complies with single-call cap (${maxCallBudget} USDC) & session cap (${maxSessionBudget} USDC)`);
      await new Promise(r => setTimeout(r, 500));

      addLog('SELECTION_DECISION', 'Selected "AI Summarizer & Sentiment Engine" (Score: 98.6, Price: 0.02 USDC)');
      await new Promise(r => setTimeout(r, 600));

      addLog('X402_CHALLENGE', 'HTTP POST http://localhost:4020/api/service/summarizer -> Received 402 Payment Required');
      await new Promise(r => setTimeout(r, 700));

      addLog('SIGNATURE_CREATED', 'Signed gasless EIP-3009 transferWithAuthorization payload via Circle Developer Wallet (0.02 USDC)');
      await new Promise(r => setTimeout(r, 800));

      const tx2Hash = '0x3c9a' + Math.random().toString(16).substring(2, 10) + '...';
      addLog('CALL_SUCCESS', `Summary generated: "Arc L1 launches native USDC gas & nanopayments". Settled 0.02 USDC on Arc (Tx: ${tx2Hash})`);
      await new Promise(r => setTimeout(r, 600));

      // Subtask 3: Image Generation
      addLog('DISCOVERY', 'Querying PayPerRegistry contract on Arc Testnet for category: "image-gen"');
      await new Promise(r => setTimeout(r, 500));

      addLog('POLICY_APPROVED', `Circle Agent Stack: 0.05 USDC complies with single-call cap (${maxCallBudget} USDC) & session cap (${maxSessionBudget} USDC)`);
      await new Promise(r => setTimeout(r, 500));

      addLog('SELECTION_DECISION', 'Selected "Neural Image Generator" (Score: 100.0, Price: 0.05 USDC)');
      await new Promise(r => setTimeout(r, 600));

      addLog('X402_CHALLENGE', 'HTTP POST http://localhost:4020/api/service/image-gen -> Received 402 Payment Required');
      await new Promise(r => setTimeout(r, 700));

      addLog('SIGNATURE_CREATED', 'Signed gasless EIP-3009 transferWithAuthorization payload via Circle Developer Wallet (0.05 USDC)');
      await new Promise(r => setTimeout(r, 800));

      const tx3Hash = '0x7e11' + Math.random().toString(16).substring(2, 10) + '...';
      addLog('CALL_SUCCESS', `Image banner created (1024x1024). Settled 0.05 USDC on Arc (Tx: ${tx3Hash})`);

      // Update Ticker Stats
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

  const handleRegisterService = (e) => {
    e.preventDefault();
    if (!sellerForm.name || !sellerForm.endpoint) return;

    const newListing = {
      id: listings.length + 1,
      seller: '0x3C44CdD47a3680043E1E08469b37882800d69644',
      name: sellerForm.name,
      endpoint: sellerForm.endpoint,
      pricePerCall: Math.round(parseFloat(sellerForm.pricePerCall) * 1e6),
      category: sellerForm.category,
      description: sellerForm.description || 'Newly registered capability service on Arc Testnet.',
      active: true,
      totalCalls: 0,
      successRatio: 100.0,
      avgResponseMs: 150,
      ratingScore: 98
    };

    setListings([...listings, newListing]);
    alert(`Service "${sellerForm.name}" registered successfully on PayPerRegistry!`);
    setSellerForm({ name: '', endpoint: '', pricePerCall: '0.01', category: 'scraping', description: '' });
    setViewMode('buyer');
  };

  return (
    <div className="app-container">
      {/* Header Navigation */}
      <header className="navbar glass">
        <div className="brand">
          <div className="brand-icon">P</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="brand-title">PayPer</span>
              <span className="network-badge">
                <span className="pulse-dot"></span> Arc Testnet (5040)
              </span>
              <span className="circle-badge">Circle Agent Stack</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Agentic Economy • Arc App Kit Powered</div>
          </div>
        </div>

        {/* Live Ticker */}
        <div className="ticker-bar">
          <div className="ticker-item">
            <span className="ticker-label">Total Txs:</span>
            <span className="ticker-val">{totalTxCount.toLocaleString()}</span>
          </div>
          <div style={{ color: 'var(--border-color)' }}>|</div>
          <div className="ticker-item">
            <span className="ticker-label">USDC Volume:</span>
            <span className="ticker-val">${totalUsdcVolume.toFixed(2)} USDC</span>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="toggle-group">
          <button
            className={`toggle-btn ${viewMode === 'buyer' ? 'active' : ''}`}
            onClick={() => setViewMode('buyer')}
          >
            Browse (Buyer)
          </button>
          <button
            className={`toggle-btn ${viewMode === 'seller' ? 'active' : ''}`}
            onClick={() => setViewMode('seller')}
          >
            List Service (Seller)
          </button>
        </div>
      </header>

      {/* Hero Landing Banner */}
      <section className="hero">
        <span className="hero-tag">Circle Arc L1 • Agentic Economy Track</span>
        <h1 className="hero-title">
          Autonomous Agent-to-Agent <br />
          <span>Nanopayment Marketplace</span>
        </h1>
        <p className="hero-desc">
          AI agents pay other specialized service agents per API call in USDC on Arc — zero subscriptions, no API keys as auth credentials. Built on <strong>x402</strong>, <strong>EIP-3009</strong>, <strong>Circle Agent Stack</strong>, and <strong>Arc App Kit</strong>.
        </p>
      </section>

      {/* VIEW MODE: BUYER */}
      {viewMode === 'buyer' && (
        <main>
          {/* Circle Developer Wallet Status Banner */}
          <div className="wallet-banner glass">
            <div className="wallet-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="circle-dot"></span>
                <strong>Circle Developer-Controlled Agent Wallet</strong>
              </div>
              <span className="mono-addr">0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266</span>
            </div>
            <div className="guardrail-settings">
              <div className="guardrail-item">
                <span className="guard-lbl">Max/Call:</span>
                <input
                  type="text"
                  className="guard-input"
                  value={maxCallBudget}
                  onChange={(e) => setMaxCallBudget(e.target.value)}
                />
                <span className="guard-unit">USDC</span>
              </div>
              <div className="guardrail-item">
                <span className="guard-lbl">Max/Session:</span>
                <input
                  type="text"
                  className="guard-input"
                  value={maxSessionBudget}
                  onChange={(e) => setMaxSessionBudget(e.target.value)}
                />
                <span className="guard-unit">USDC</span>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="section-header">
            <h2 className="section-title">Registered Seller Capabilities</h2>
            <div className="filter-pills">
              {['all', 'scraping', 'summarization', 'image-gen'].map((cat) => (
                <button
                  key={cat}
                  className={`filter-btn ${categoryFilter === cat ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Game Card Grid */}
          <div className="cards-grid">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="card glass">
                <div className="card-top">
                  <span className="card-category">{listing.category}</span>
                  <div className={`status-indicator ${listing.active ? 'online' : 'offline'}`}>
                    <span className="pulse-dot" style={{ backgroundColor: listing.active ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}></span>
                    {listing.active ? 'Online' : 'Offline'}
                  </div>
                </div>

                <h3 className="card-title">{listing.name}</h3>
                <p className="card-desc">{listing.description}</p>

                <div className="card-stats">
                  <div className="stat-box">
                    <div className="stat-lbl">Rating</div>
                    <div className="stat-num" style={{ color: 'var(--accent-amber)' }}>★ {listing.ratingScore}/100</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-lbl">Success</div>
                    <div className="stat-num" style={{ color: 'var(--accent-emerald)' }}>{listing.successRatio}%</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-lbl">Avg Speed</div>
                    <div className="stat-num" style={{ color: 'var(--primary-arc)' }}>{listing.avgResponseMs}ms</div>
                  </div>
                </div>

                <div className="card-footer">
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Price per call</div>
                    <div className="price-tag">{(listing.pricePerCall / 1e6).toFixed(2)} USDC</div>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Endpoint: /api/{listing.category}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Agent Execution Workbench */}
          <section className="workbench glass">
            <h2 className="workbench-title">⚡ Circle Agent Stack Autonomous Execution Workbench</h2>
            <p className="workbench-sub">
              Input a high-level goal. The buyer agent evaluates listings against Circle spending guardrails, signs gasless EIP-3009 authorizations, and settles on Arc Testnet.
            </p>

            <div className="prompt-box">
              <input
                type="text"
                className="prompt-input"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Enter prompt goal for autonomous buyer agent..."
              />
              <button
                className="run-btn"
                onClick={handleRunAgent}
                disabled={isRunningAgent}
              >
                {isRunningAgent ? 'Running Agent...' : '🚀 Execute Agent'}
              </button>
            </div>

            {/* Execution Console */}
            <div className="console">
              {agentLogs.length === 0 ? (
                <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>
                  Click "Execute Agent" to watch real-time Circle Agent Stack guardrail checks, x402 payment challenges, and Arc EIP-3009 settlements.
                </div>
              ) : (
                agentLogs.map((log, idx) => (
                  <div key={idx} className="log-entry">
                    <span className="log-time">[{log.timestamp}]</span>
                    <span className={`log-step ${log.step}`}>{log.step}</span>
                    <span className="log-msg">{log.message}</span>
                  </div>
                ))
              )}
            </div>

            {/* Agent Result Display */}
            {agentResult && (
              <div style={{ marginTop: '24px', padding: '20px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <h3 style={{ color: 'var(--accent-emerald)', fontSize: '18px', marginBottom: '10px' }}>
                  ✓ Pipeline Complete ({agentResult.txCount} calls • Total Settled: {agentResult.totalSpent})
                </h3>
                <p style={{ color: 'var(--text-main)', marginBottom: '14px', fontSize: '14px' }}>
                  <strong>Summary Output:</strong> {agentResult.summary}
                </p>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px', fontFamily: 'var(--font-mono)' }}>
                  Arc Explorer Receipts: {agentResult.txHashes.map(h => (
                    <a key={h} href={`${ARC_TESTNET_CONFIG.blockExplorerUrl}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-arc)', marginRight: '12px' }}>
                      {h} ↗
                    </a>
                  ))}
                </div>
                {agentResult.imageUrl && (
                  <img
                    src={agentResult.imageUrl}
                    alt="Generated Artwork"
                    style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                  />
                )}
              </div>
            )}
          </section>
        </main>
      )}

      {/* VIEW MODE: SELLER */}
      {viewMode === 'seller' && (
        <main>
          <div className="seller-form-card glass">
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Register Service Listing</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
              Publish your wrapped HTTP API capability endpoint to the PayPerRegistry smart contract on Arc Testnet.
            </p>

            <form onSubmit={handleRegisterService}>
              <div className="form-group">
                <label className="form-label">Service Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Code Linter API"
                  value={sellerForm.name}
                  onChange={(e) => setSellerForm({ ...sellerForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Public HTTP Endpoint URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://api.yourdomain.com/payper"
                  value={sellerForm.endpoint}
                  onChange={(e) => setSellerForm({ ...sellerForm, endpoint: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Price per Call (USDC)</label>
                  <input
                    type="number"
                    step="0.001"
                    className="form-input"
                    value={sellerForm.pricePerCall}
                    onChange={(e) => setSellerForm({ ...sellerForm, pricePerCall: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
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

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Explain what your service provides..."
                  value={sellerForm.description}
                  onChange={(e) => setSellerForm({ ...sellerForm, description: e.target.value })}
                ></textarea>
              </div>

              <button type="submit" className="submit-btn">
                Publish to PayPerRegistry Contract
              </button>
            </form>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="footer">
        PayPer Marketplace • Built for Encode Club Programmable Money Hackathon • Powered by Circle Agent Stack & Arc App Kit
      </footer>
    </div>
  );
}
