import {getWalletIcon} from '@layerzerolabs/ui-core';

import {Box} from '@/core/ui/system';

import { useIconUrl } from '../config/createWallets';

const getIcon = (type: string, iconUrl: string | undefined) => {
  return useIconUrl.includes(type) ? iconUrl : getWalletIcon(type);
}
export interface WalletIconProps {
  size?: number;
  type?: string;
  iconUrl?: string;
}
export const WalletIcon = ({type, iconUrl, size = 26}: WalletIconProps) => {
  return (
    <Box sx={{width: size, minHeight: size, position: 'relative', display: 'inline-block'}}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {type && <img src={getIcon(type, iconUrl)} width={size} alt={type} title={type} />}
    </Box>
  );
};
