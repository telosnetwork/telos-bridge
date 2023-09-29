import {getWalletIcon} from '@layerzerolabs/ui-core';

import {Box} from '@/core/ui/system';

export interface WalletIconProps {
  size?: number;
  type?: string;
}
export const WalletIcon = ({type, size = 26}: WalletIconProps) => {
  return (
    <Box sx={{width: size, minHeight: size, position: 'relative', display: 'inline-block'}}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {type && <img src={getWalletIcon(type)} width={size} alt={type} title={type} />}
    </Box>
  );
};
