import {ChainId, ChainStage, getChainStage} from '@layerzerolabs/lz-sdk';
import {
  Currency,
  CurrencyAmount,
  DefaultAirdropProvider,
  getNativeCurrency,
  isAptosChainId,
} from '@layerzerolabs/ui-core';
import {AptosClient} from 'aptos';
import assert from 'assert';

export class DefaultAirdropProvider__aptos implements DefaultAirdropProvider {
  constructor(private readonly sdk: {client: AptosClient; stage: ChainStage}) {}
  supports(dstChainId: ChainId): boolean {
    return isAptosChainId(dstChainId) && getChainStage(dstChainId) === this.sdk.stage;
  }

  estimateDefaultAirdrop(dstChainId: ChainId): Promise<CurrencyAmount<Currency>> {
    return this.estimateClaimCoinGasAmount(dstChainId);
  }

  estimateRegisterCoinGasAmount: (chainId: ChainId) => Promise<CurrencyAmount> = async (
    chainId,
  ) => {
    assert(isAptosChainId(chainId));

    // can't call client.simulateTransaction()
    // because no publicKey is available in the wallet adapter (yet)

    // using value from this tx
    // https://explorer.aptoslabs.com/txn/0xddb86441811bdd9fe6968a9932cfb41be62afe3a27f73c1fd4b361ebaa7847c3?network=testnet
    const gasUnits = 658;
    const {gas_estimate: gasPrice} = await this.sdk.client.estimateGasPrice();
    const estimate = gasUnits * gasPrice * 4;

    const native = getNativeCurrency(chainId);
    return CurrencyAmount.fromRawAmount(native, estimate);
  };

  estimateClaimCoinGasAmount: (chainId: ChainId) => Promise<CurrencyAmount> = async (chainId) => {
    assert(isAptosChainId(chainId));

    // can't call client.simulateTransaction()
    // because no publicKey is available in the wallet adapter (yet)

    // using value from this tx
    // https://explorer.aptoslabs.com/txn/0x2de11ed5f2ef195831129ecb80637edc684d9db311105a32662e20b5d1e7a684
    const gasUnits = 1301;
    const {gas_estimate: gasPrice} = await this.sdk.client.estimateGasPrice();
    const estimate = gasUnits * gasPrice * 4;

    const native = getNativeCurrency(chainId);
    return CurrencyAmount.fromRawAmount(native, estimate);
  };
}
