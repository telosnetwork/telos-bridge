import {ChainId, ChainStage} from '@layerzerolabs/lz-sdk';

function getChainStage(chainId: ChainId) {
  return chainId < 10000
    ? ChainStage.MAINNET
    : chainId < 20000
    ? ChainStage.TESTNET
    : ChainStage.TESTNET_SANDBOX;
}

export function getScanLink(chainId: ChainId, hash: string) {
  const chainStage = getChainStage(chainId);
  if (chainStage === ChainStage.MAINNET) {
    return `https://layerzeroscan.com/tx/${hash}`;
  }
  if (chainStage === ChainStage.TESTNET) {
    return `https://testnet.layerzeroscan.com/tx/${hash}`;
  }
  return `https://sandbox.layerzeroscan.com/tx/${hash}`;
}
