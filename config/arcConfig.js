/**
 * Arc L1 Network & Arc App Kit Configuration Specs
 * Arc is Circle's stablecoin-native Layer 1 blockchain with USDC as native gas.
 * Docs: https://docs.arc.io/ & https://docs.arc.io/app-kit
 */

export const ARC_TESTNET_CONFIG = {
  chainId: 5040,
  chainName: 'Arc Testnet',
  rpcUrl: process.env.ARC_TESTNET_RPC || 'https://rpc-testnet.arc.network',
  blockExplorerUrl: 'https://explorer.testnet.arc.network',
  nativeCurrency: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6
  },
  contracts: {
    payPerRegistry: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    // Official Circle USDC on Arc Testnet (Native Gas Token)
    officialCircleUsdc: '0x0000000000000000000000000000000000004020',
    circleGateway: '0x0000000000000000000000000000000000004020'
  }
};

export class ArcAppKit {
  static getChainParameters() {
    return {
      chainId: `0x${ARC_TESTNET_CONFIG.chainId.toString(16)}`,
      chainName: ARC_TESTNET_CONFIG.chainName,
      nativeCurrency: ARC_TESTNET_CONFIG.nativeCurrency,
      rpcUrls: [ARC_TESTNET_CONFIG.rpcUrl],
      blockExplorerUrls: [ARC_TESTNET_CONFIG.blockExplorerUrl]
    };
  }

  static getExplorerTxUrl(txHash) {
    return `${ARC_TESTNET_CONFIG.blockExplorerUrl}/tx/${txHash}`;
  }

  static getExplorerAddressUrl(address) {
    return `${ARC_TESTNET_CONFIG.blockExplorerUrl}/address/${address}`;
  }
}

export default ARC_TESTNET_CONFIG;
