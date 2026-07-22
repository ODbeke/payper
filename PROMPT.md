# Build Prompt: Agent-to-Agent Nanopayment Marketplace on Arc

## Context (for the coding agent)
This is a submission for Encode Club's **Programmable Money Hackathon** on **Arc** (Circle's stablecoin-native L1, USDC as native gas, sub-second finality). It targets the **Agentic Economy track**, judged on:
- Agents with clear decision logic tied to real signals
- Autonomous spending, payments, or settlement flows
- Use of Nanopayments for micro-transactions between agents/services
- USDC-denominated operations with demonstrable autonomy

**Final submission deadline: Sunday, 9 August (Anywhere on Earth).** Deliverables required: functional MVP deployed on Arc, public code repo, 3-min video pitch + demo, deck. No placeholders — every link must work.

---

## What we're building

A marketplace where **AI agents pay other agents/services per API call**, in USDC, on Arc — no subscriptions, no API keys as the auth mechanism, payment itself is the credential. Buyer agents autonomously discover sellers, pick one based on real signals (price/rating/speed), pay per call via a nanopayment flow, and consume the result — optionally chaining into further paid calls.

### Core actors
- **Seller**: a wrapped capability (LLM call, scraper, sentiment analysis, image gen, etc.) exposed via a public HTTP endpoint. Holds a receiving wallet on Arc. Any real upstream API key (e.g. an LLM provider key) lives server-side only, never exposed to buyers.
- **Buyer agent**: has a goal, breaks it into sub-tasks, discovers sellers via the registry, pays per call, consumes results, may chain into more paid calls.
- **Registry**: an on-chain directory (see below) mapping service listings to seller endpoints. Pure discovery layer — no execution happens here.

---

## Payment mechanics (must be implemented exactly this way)

Use **x402** (HTTP 402 Payment Required) + **EIP-3009 `transferWithAuthorization`** + **Circle Gateway** for settlement.

1. Buyer sends request to seller's endpoint.
2. Seller responds `402 Payment Required` with the exact price if no valid payment is attached.
3. Buyer signs an EIP-3009 authorization (off-chain, gasless, short `validBefore` expiry — 1-2 minutes) and retries the request with it attached.
4. Seller verifies the signature/amount is valid (this does **not** move funds yet).
5. Seller attempts the actual task (calls its own upstream key/service).
6. **Critical ordering rule — never violate this:**
   - Task succeeds → seller submits/settles the authorization (immediately or batched via Gateway) → returns the result.
   - Task fails → seller **never submits** the authorization. It just expires unused. Buyer is never charged. Return an error instead.
7. For hackathon demo simplicity, settle synchronously right before responding (batched settlement is fine to describe as the "production" approach in the pitch, not required for the MVP).

### Safety nets to implement
- Seller server fails a startup health check (and can self-flag "unavailable" in the registry) if required config/keys are missing — fail loud at boot, not mid-request.
- Wrap upstream calls in try/catch; any failure short-circuits before settlement.
- Keep authorization `validBefore` short to prevent stale replay.

---

## Registry (on-chain, Arc testnet)

Simple Solidity contract, sellers write a pointer record (not their code/model):

```solidity
struct Listing {
    address seller;
    string name;
    string endpoint;       // public URL of the seller's live server
    uint256 pricePerCall;  // USDC, 6 decimals
    string category;       // e.g. "scraping", "summarization", "image-gen"
    string description;
    bool active;
}
```
- `registerService(name, endpoint, price, category, description)`
- `getServices()` / `getServicesByCategory(category)`
- `setActive(bool)` — lets a seller mark itself offline

The registry is a phone book only. All actual work happens off-chain at the seller's public URL (deployed on Railway/Render — must be a real public endpoint reachable by anyone, not localhost).

---

## Frontend requirements

- **Landing page**: single scroll, headline + one-line explanation + optional live stat ticker (total transactions / total USDC moved, pulled from real data) + one CTA: **"Launch App"**. No role-selection on the landing page.
- **Inside the app**: a **toggle** — `Browse (Buyer)` / `List a Service (Seller)`. Default view on load = Buyer.
  - **Buyer view**: game-card grid of listings pulled from the registry. Each card shows: name/description, price per call, category tag, live online/offline status, and stats (avg response time, success rate, rating). Buyer agent's selection logic should be visibly tied to these stats (not random) — this directly satisfies the "clear decision logic tied to real signals" judging criterion.
  - **Seller view**: simple form to register a new listing (name, endpoint, price, category, description) that calls `registerService()`, plus a list of the user's own active listings.
- **Persistent live ticker**: visible in both views — total transactions and total USDC moved — reinforcing this is a running economy, not a static catalog.

---

## Suggested build order (sequence to avoid getting blocked)

1. Registry contract — write + deploy to Arc testnet first (everything else reads from it).
2. One seller server — deploy for real (Railway/Render), implement the 402 check + settle-on-success logic. Prove one works end-to-end before building more.
3. Buyer-side call flow (script) — discover listing → call → sign authorization → get result → confirm funds moved on Arc testnet.
4. Frontend: card grid, registration form, toggle, live ticker.
5. Clone the seller pattern for 2-3 more services once step 2-3 are proven.
6. Polish for submission: video (3 min), deck, verify every link/repo is public and functional — no placeholders.

---

## Tech stack

- **Contracts**: Solidity, Arc testnet (EVM-compatible — standard Ethereum tooling works)
- **Payments**: Circle Gateway + Nanopayments, x402 middleware
- **Seller servers**: Node/Express or Python/FastAPI, deployed on Railway or Render
- **Buyer agent logic**: Python or TS script/service, calls an LLM (for task decomposition/decision logic) + signs EIP-3009 authorizations
- **Frontend**: React, card-grid UI, toggle state, live ticker (poll or websocket from registry/tx data)
- **Reference starting point**: `circlefin/arc-nanopayments` repo and public x402-on-Arc tutorials for the payment middleware scaffold — don't build the payment layer from scratch.

---

## What NOT to build (explicitly out of scope for this MVP)
- No cross-chain bridging (single-chain on Arc only)
- No true on-chain escrow/lockup — this pattern uses "verify → execute → settle" ordering instead, funds never move until success is confirmed
- No dispute/arbitration system — not needed at this payment granularity
- No subscription or rate-limit auth logic — payment itself is the auth
