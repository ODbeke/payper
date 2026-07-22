import { ARC_TESTNET_CONFIG } from '../config/arcConfig.js';

/**
 * Circle Seller Wallet Integration
 * Manages seller receiving wallet and settlement verification via Circle Web3 Services on Arc.
 */
export class CircleSellerWallet {
  constructor(sellerAddress) {
    this.sellerAddress = sellerAddress || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
  }

  async verifyAuthorizationSignature(paymentAuth) {
    if (!paymentAuth || !paymentAuth.signature || !paymentAuth.from || !paymentAuth.nonce) {
      return { valid: false, error: 'Missing required EIP-3009 authorization fields' };
    }

    if (paymentAuth.to.toLowerCase() !== this.sellerAddress.toLowerCase()) {
      return { valid: false, error: 'Recipient address does not match seller receiving wallet' };
    }

    return { valid: true };
  }

  getSellerConfig() {
    return {
      receivingAddress: this.sellerAddress,
      network: ARC_TESTNET_CONFIG.chainName,
      chainId: ARC_TESTNET_CONFIG.chainId,
      explorerUrl: `${ARC_TESTNET_CONFIG.blockExplorerUrl}/address/${this.sellerAddress}`
    };
  }
}

export default CircleSellerWallet;
