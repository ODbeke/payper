import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("PayPer Marketplace Contracts", function () {
  let registry;
  let owner, seller1, seller2, buyer;

  beforeEach(async function () {
    [owner, seller1, seller2, buyer] = await ethers.getSigners();

    // Deploy PayPerRegistry smart contract on Arc Testnet EVM
    const PayPerRegistry = await ethers.getContractFactory("PayPerRegistry");
    registry = await PayPerRegistry.deploy();
    await registry.waitForDeployment();
  });

  describe("PayPerRegistry On-Chain Directory", function () {
    it("Should register a new seller service listing", async function () {
      const tx = await registry.connect(seller1).registerService(
        "Web Scraper Pro",
        "https://scraper.payper.ai/api",
        10000, // 0.01 USDC
        "scraping",
        "Fast headless page extraction & structured JSON parser"
      );

      const services = await registry.getServices();
      expect(services.length).to.equal(1);
      expect(services[0].name).to.equal("Web Scraper Pro");
      expect(services[0].seller).to.equal(seller1.address);
      expect(services[0].pricePerCall).to.equal(10000);
      expect(services[0].active).to.equal(true);
    });

    it("Should allow seller to toggle active status", async function () {
      await registry.connect(seller1).registerService(
        "AI Summarizer",
        "https://summarizer.payper.ai/api",
        20000,
        "summarization",
        "LLM summary engine"
      );

      await registry.connect(seller1).setActive(1, false);
      const listing = await registry.getListing(1);
      expect(listing.active).to.equal(false);
    });

    it("Should update metrics and network volume on call recording", async function () {
      await registry.connect(seller1).registerService(
        "Image Generator",
        "https://gen.payper.ai/api",
        50000, // 0.05 USDC
        "image-gen",
        "Fast visual asset generation"
      );

      await registry.recordCallMetrics(1, true, 180);
      const listing = await registry.getListing(1);
      expect(listing.totalCalls).to.equal(1);
      expect(listing.successCount).to.equal(1);
      expect(listing.ratingScore).to.equal(100);

      const totalTx = await registry.totalNetworkTransactions();
      const totalVol = await registry.totalUSDCVolumeMoved();
      expect(totalTx).to.equal(1);
      expect(totalVol).to.equal(50000);
    });

    it("Should filter services by category", async function () {
      await registry.connect(seller1).registerService(
        "Web Scraper Pro",
        "https://scraper.payper.ai/api",
        10000,
        "scraping",
        "Scraper description"
      );
      await registry.connect(seller2).registerService(
        "AI Summarizer",
        "https://summarizer.payper.ai/api",
        20000,
        "summarization",
        "Summarizer description"
      );

      const scrapingServices = await registry.getServicesByCategory("scraping");
      expect(scrapingServices.length).to.equal(1);
      expect(scrapingServices[0].name).to.equal("Web Scraper Pro");
    });
  });
});
