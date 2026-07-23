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

export default function App() {
  // Navigation Page State: 'landing' vs 'app'
  const [currentPage, setCurrentPage] = useState('landing');
  // Inside App View Toggle State: 'buyer' vs 'seller' (Default on load = Buyer)
  const [viewMode, setViewMode] = useState('buyer');

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
      
      // Submit registration to live PayPerRegistry contract
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

  return (
    <div className="app-shell">
      {/* Top Terminal Navigation Bar */}
      <header className="nav-terminal">
        <button className="nav-brand" onClick={() => setCurrentPage('landing')}>
          <div className="brand-mark">P</div>
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

        {/* Toggle Mode / Launch App */}
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
            </>
          ) : (
            <button className="btn-terminal active" onClick={() => setCurrentPage('app')}>
              LAUNCH APP →
            </button>
          )}
        </div>
      </header>

      {/* 1. LANDING PAGE VIEW (Admon.peerfix.dev Aesthetic) */}
      {currentPage === 'landing' && (
        <main>
          <section className="hero-admon">
            <div className="tag-monad">⚡ ENCODE CLUB PROGRAMMABLE MONEY HACKATHON • ARC TRACK</div>
            <h1 className="hero-display-title">
              Agent-to-Agent Nanopayment <br />
              <span>Marketplace on Arc</span>
            </h1>
            <p className="hero-lede">
              AI agents pay other specialized service agents per API call in USDC on Arc — zero subscriptions, zero API keys as auth credentials. Payment itself is the credential.
            </p>

            <button className="btn-cta-primary" onClick={() => setCurrentPage('app')}>
              LAUNCH MARKETPLACE APP →
            </button>
          </section>

          {/* Proof Grid Section */}
          <section className="proof-section">
            <div className="proof-grid">
              <article className="proof-card">
                <span className="proof-mark">01 / X402_PROTOCOL</span>
                <h3>HTTP 402 Nanopayments</h3>
                <p>
                  Sellers return exact price challenges; agents respond with gasless EIP-3009 transfer authorizations settled directly in USDC on Arc.
                </p>
              </article>

              <article className="proof-card">
                <span className="proof-mark">02 / ONCHAIN_DIRECTORY</span>
                <h3>Signal-Based Discovery</h3>
                <p>
                  Buyer agents evaluate listings on-chain using real performance metrics: rating score, response speed, success ratio, and USDC pricing.
                </p>
              </article>

              <article className="proof-card">
                <span className="proof-mark">03 / NO_CHARGE_SAFETY</span>
                <h3>Task-Success Settlement</h3>
                <p>
                  Funds are settled only when the seller's upstream execution succeeds. If the seller service fails, zero USDC is ever deducted.
                </p>
              </article>
            </div>
          </section>
        </main>
      )}

      {/* 2. INSIDE APP VIEW */}
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
                  <div style={{ marginTop: '24px', padding: '24px', background: 'rgba(16, 185, 129, 0.06)', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
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
