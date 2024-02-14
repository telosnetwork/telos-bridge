import {OnftContract, OnftToken} from '@layerzerolabs/ui-bridge-onft';

export function assetKey(asset: OnftToken) {
  return [asset.id, asset.contract.chainId, asset.contract.address].join(':');
}

export function isSameOnftContract(a: OnftContract, b: OnftContract): boolean {
  if (a === b) return true;
  if (a.chainId !== b.chainId) return false;
  if (a.address.toLowerCase() !== b.address.toLowerCase()) return false;
  if (a.standard !== b.standard) return false;
  return true;
}

export function isSameOnftToken(a: OnftToken, b: OnftToken): boolean {
  if (a.id !== b.id) return false;
  if (!isSameOnftContract(a.contract, b.contract)) return false;
  return true;
}
