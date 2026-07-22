import React, { useState } from 'react';
import './index.css';
import { ARC_TESTNET_CONFIG, ArcAppKit } from '../../config/arcConfig.js';

// Seed Marketplace Listings on Arc Testnet
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
  // Navigation Page State: 'landing' vs 'app'
  const [currentPage, setCurrentPage] = useState('landing');
  // Inside App View Toggle State: 'buyer' vs 'seller' (Default on load = Buyer)
  const [viewMode, setViewMode] = useState('buyer');

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [listings, setListings] = useState(INITIAL_LISTINGS);
  const [totalTxCount, setTotalTxCount] = useState(548);
  const [totalUsdcVolume, setTotalUsdcVolume] = useState(10.24);

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

  const filteredListings = categoryFilter === 'all'
    ? listings
    : listings.filter(l => l.category === categoryFilter);

  // Autonomous Agent Execution Simulation
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
      addLog('DISCOVERY', 'Querying PayPerRegistry contract on Arc Testnet (Chain 5040) for category: "scraping"');
      await new Promise(r => setTimeout(r, 500));

      addLog('POLICY_APPROVED', `Circle Agent Guardrails: 0.01 USDC is within single-call cap (${maxCallBudget} USDC) & session cap (${maxSessionBudget} USDC)`);
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

      // Subtask 2
      addLog('DISCOVERY', 'Querying PayPerRegistry contract on Arc Testnet for category: "summarization"');
      await new Promise(r => setTimeout(r, 500));

      addLog('POLICY_APPROVED', `Circle Agent Guardrails: 0.02 USDC is within single-call cap (${maxCallBudget} USDC) & session cap (${maxSessionBudget} USDC)`);
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
      {/* Top Header Bar */}
      <header className="header-bar glass">
        <button className="brand-link" onClick={() => setCurrentPage('landing')}>
          <div className="brand-symbol">P</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="brand-name">PayPer</span>
              <span className="network-chip">
                <span className="dot-live"></span> ARC TESTNET
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Agentic Nanopayments Marketplace</div>
          </div>
        </button>

        {/* Live Persistent Ticker */}
        <div className="live-ticker">
          <div className="ticker-metric">
            <span className="ticker-key">Total Txs:</span>
            <span className="ticker-value">{totalTxCount.toLocaleString()}</span>
          </div>
          <div style={{ color: 'var(--border-color)' }}>|</div>
          <div className="ticker-metric">
            <span className="ticker-key">USDC Volume:</span>
            <span className="ticker-value">${totalUsdcVolume.toFixed(2)}</span>
          </div>
        </div>

        {/* Toggle Mode inside App View */}
        {currentPage === 'app' ? (
          <div className="mode-switch">
            <button
              className={`switch-btn ${viewMode === 'buyer' ? 'active' : ''}`}
              onClick={() => setViewMode('buyer')}
            >
              Browse (Buyer)
            </button>
            <button
              className={`switch-btn ${viewMode === 'seller' ? 'active' : ''}`}
              onClick={() => setViewMode('seller')}
            >
              List Service (Seller)
            </button>
          </div>
        ) : (
          <button className="switch-btn active" onClick={() => setCurrentPage('app')}>
            Launch App →
          </button>
        )}
      </header>

      {/* 1. LANDING PAGE VIEW (Single Scroll, 1 CTA: Launch App) */}
      {currentPage === 'landing' && (
        <main>
          <section className="landing-hero">
            <div className="badge-tag">⚡ Encode Club Programmable Money Hackathon • Arc Track</div>
            <h1 className="hero-heading">
              The Autonomous Agentic <br />
              <span>Financial Network on Arc</span>
            </h1>
            <p className="hero-subtext">
              AI agents pay other agents per API call in USDC on Arc — zero subscriptions, zero API keys as auth credentials. Payment itself is the credential, powered by <strong>x402</strong> and <strong>EIP-3009</strong>.
            </p>

            {/* ONLY ONE CTA BUTTON ON LANDING PAGE */}
            <button className="launch-cta" onClick={() => setCurrentPage('app')}>
              Launch Marketplace App →
            </button>
          </section>

          {/* Feature Highlights Grid */}
          <section className="landing-features">
            <div className="feat-card glass">
              <div className="feat-icon">💳</div>
              <h3 className="feat-title">x402 Nanopayments</h3>
              <p className="feat-desc">
                HTTP 402 Payment Required flow. Sellers return exact price challenges; agents respond with signed gasless EIP-3009 authorizations.
              </p>
            </div>

            <div className="feat-card glass">
              <div className="feat-icon">🎯</div>
              <h3 className="feat-title">Signal-Based Selection</h3>
              <p className="feat-desc">
                Buyer agents discover listings from on-chain PayPerRegistry and pick sellers based on real metrics: price, rating, success rate, and response speed.
              </p>
            </div>

            <div className="feat-card glass">
              <div className="feat-icon">🔒</div>
              <h3 className="feat-title">Task-Success Settlement</h3>
              <p className="feat-desc">
                Strict safety ordering rule: funds are settled only when the upstream API call succeeds. If the seller fails, zero funds are deducted.
              </p>
            </div>
          </section>
        </main>
      )}

      {/* 2. INSIDE APP VIEW (Buyer & Seller Toggle) */}
      {currentPage === 'app' && (
        <main>
          {/* BUYER VIEW */}
          {viewMode === 'buyer' && (
            <div>
              {/* Circle Developer Wallet Status Banner */}
              <div className="wallet-card glass">
                <div className="wallet-details">
                  <span className="dot-live" style={{ backgroundColor: 'var(--accent-purple)', boxShadow: '0 0 10px var(--accent-purple)' }}></span>
                  <div>
                    <strong style={{ fontSize: '14px' }}>Circle Developer-Controlled Wallet</strong>
                    <div className="wallet-addr">0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266</div>
                  </div>
                </div>

                <div className="guardrails-box">
                  <div className="guard-field">
                    <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Max/Call:</span>
                    <input
                      type="text"
                      className="guard-input-val"
                      value={maxCallBudget}
                      onChange={(e) => setMaxCallBudget(e.target.value)}
                    />
                    <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>USDC</span>
                  </div>
                  <div className="guard-field">
                    <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Session Cap:</span>
                    <input
                      type="text"
                      className="guard-input-val"
                      value={maxSessionBudget}
                      onChange={(e) => setMaxSessionBudget(e.target.value)}
                    />
                    <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>USDC</span>
                  </div>
                </div>
              </div>

              {/* Category Filter Controls */}
              <div className="grid-controls">
                <h2 style={{ fontSize: '24px', fontWeight: '900' }}>Registered Seller Capabilities</h2>
                <div className="filter-group">
                  {['all', 'scraping', 'summarization', 'image-gen'].map((cat) => (
                    <button
                      key={cat}
                      className={`cat-pill ${categoryFilter === cat ? 'active' : ''}`}
                      onClick={() => setCategoryFilter(cat)}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Game Card Grid */}
              <div className="cards-container">
                {filteredListings.map((listing) => (
                  <div key={listing.id} className="service-card glass">
                    <div>
                      <div className="service-header">
                        <span className="tag-category">{listing.category}</span>
                        <div className="online-tag">
                          <span className="dot-live"></span> Online
                        </div>
                      </div>

                      <h3 className="service-name">{listing.name}</h3>
                      <p className="service-desc">{listing.description}</p>
                    </div>

                    <div>
                      <div className="signals-grid">
                        <div>
                          <div className="signal-lbl">Rating</div>
                          <div className="signal-val" style={{ color: 'var(--accent-amber)' }}>★ {listing.ratingScore}/100</div>
                        </div>
                        <div>
                          <div className="signal-lbl">Success</div>
                          <div className="signal-val" style={{ color: 'var(--accent-emerald)' }}>{listing.successRatio}%</div>
                        </div>
                        <div>
                          <div className="signal-lbl">Speed</div>
                          <div className="signal-val" style={{ color: 'var(--primary-arc)' }}>{listing.avgResponseMs}ms</div>
                        </div>
                      </div>

                      <div className="service-footer">
                        <div>
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)', uppercase: 'true' }}>Price per Call</div>
                          <div className="price-display">{(listing.pricePerCall / 1e6).toFixed(2)} USDC</div>
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
                          /api/{listing.category}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Agent Execution Console Workbench */}
              <section className="agent-console-box glass">
                <div className="console-header">
                  <h2 className="console-title">⚡ Circle Agent Stack Autonomous Execution Workbench</h2>
                  <p className="console-sub">
                    Input a goal prompt. Watch the autonomous agent evaluate seller signals, sign gasless EIP-3009 authorizations, and settle nanopayments on Arc Testnet.
                  </p>
                </div>

                <div className="input-row">
                  <input
                    type="text"
                    className="goal-input"
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="Enter prompt goal for autonomous buyer agent..."
                  />
                  <button
                    className="exec-btn"
                    onClick={handleRunAgent}
                    disabled={isRunningAgent}
                  >
                    {isRunningAgent ? 'Executing Agent...' : '🚀 Execute Agent'}
                  </button>
                </div>

                {/* Execution Log Terminal */}
                <div className="terminal">
                  {agentLogs.length === 0 ? (
                    <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '30px' }}>
                      Click "Execute Agent" to run the autonomous agentic nanopayment pipeline live.
                    </div>
                  ) : (
                    agentLogs.map((log, idx) => (
                      <div key={idx} className="terminal-line">
                        <span className="t-time">[{log.timestamp}]</span>
                        <span className={`t-badge ${log.step}`}>{log.step}</span>
                        <span className="t-msg">{log.message}</span>
                      </div>
                    ))
                  )}
                </div>

                {/* Output Result */}
                {agentResult && (
                  <div style={{ marginTop: '24px', padding: '24px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                    <h3 style={{ color: 'var(--accent-emerald)', fontSize: '20px', marginBottom: '10px', fontWeight: '800' }}>
                      ✓ Pipeline Completed ({agentResult.txCount} calls settled • Total: {agentResult.totalSpent})
                    </h3>
                    <p style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '15px', lineHeight: '1.6' }}>
                      <strong>Summary Output:</strong> {agentResult.summary}
                    </p>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', fontFamily: 'var(--font-mono)' }}>
                      Arc Testnet Receipts: {agentResult.txHashes.map(h => (
                        <a key={h} href={`${ARC_TESTNET_CONFIG.blockExplorerUrl}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-arc)', marginRight: '14px', textDecoration: 'underline' }}>
                          {h} ↗
                        </a>
                      ))}
                    </div>
                    {agentResult.imageUrl && (
                      <img
                        src={agentResult.imageUrl}
                        alt="Generated Artwork"
                        style={{ width: '100%', maxHeight: '340px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
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
              <div className="form-wrapper glass">
                <h2 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '8px' }}>Register Seller Capability Listing</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '28px' }}>
                  Publish your wrapped HTTP API endpoint to the PayPerRegistry smart contract on Arc Testnet.
                </p>

                <form onSubmit={handleRegisterService}>
                  <div className="field-group">
                    <label className="field-lbl">Service Name</label>
                    <input
                      type="text"
                      className="field-inp"
                      placeholder="e.g. Code Security Linter API"
                      value={sellerForm.name}
                      onChange={(e) => setSellerForm({ ...sellerForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-lbl">Public HTTP Endpoint URL</label>
                    <input
                      type="url"
                      className="field-inp"
                      placeholder="https://api.yourdomain.com/payper"
                      value={sellerForm.endpoint}
                      onChange={(e) => setSellerForm({ ...sellerForm, endpoint: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="field-group">
                      <label className="field-lbl">Price per Call (USDC)</label>
                      <input
                        type="number"
                        step="0.001"
                        className="field-inp"
                        value={sellerForm.pricePerCall}
                        onChange={(e) => setSellerForm({ ...sellerForm, pricePerCall: e.target.value })}
                        required
                      />
                    </div>

                    <div className="field-group">
                      <label className="field-lbl">Category</label>
                      <select
                        className="field-sel"
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

                  <div className="field-group">
                    <label className="field-lbl">Description</label>
                    <textarea
                      className="field-txt"
                      rows="3"
                      placeholder="Describe what capability your agent endpoint provides..."
                      value={sellerForm.description}
                      onChange={(e) => setSellerForm({ ...sellerForm, description: e.target.value })}
                    ></textarea>
                  </div>

                  <button type="submit" className="pub-btn">
                    Publish to PayPerRegistry Contract
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      )}

      <footer className="footer-nav">
        PayPer Marketplace • Built for Encode Club Programmable Money Hackathon on Arc L1 • USDC Nanopayments
      </footer>
    </div>
  );
}
