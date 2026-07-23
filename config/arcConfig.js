import deploymentInfo from '../deployments.json' with { type: 'json' };

/**
 * Arc L1 Network & Arc App Kit Configuration Specs
 * Arc is Circle's stablecoin-native Layer 1 blockchain with USDC as native gas.
 * Docs: https://docs.arc.io/ & https://docs.arc.io/app-kit
 */

const getRpcUrl = () => {
  if (typeof process !== 'undefined' && process.env && process.env.ARC_TESTNET_RPC) {
    return process.env.ARC_TESTNET_RPC;
  }
  return 'https://rpc.testnet.arc.network';
};

export const ARC_TESTNET_CONFIG = {
  chainId: 5042002,
  chainName: 'Arc Testnet',
  rpcUrl: getRpcUrl(),
  blockExplorerUrl: 'https://testnet.arcscan.app',
  nativeCurrency: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6
  },
  contracts: {
    payPerRegistry: deploymentInfo?.payPerRegistry || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
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
