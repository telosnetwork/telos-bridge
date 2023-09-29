import {ChainId} from '@layerzerolabs/lz-sdk';
import {getNetworkIcon} from '@layerzerolabs/ui-core';

import {styled, SxProps, Theme} from '@/core/ui/system';
import {overrideImageSrcOnError} from '@/core/utils/overrideImageSrcOnError';

import {Icon} from './Icon';

type NetworkIconProps = {
  chainId?: ChainId;
  size?: number;
  sx?: SxProps<Theme>;
};

const Image = styled('img')(({theme}) => ({
  borderRadius: theme.shape.borderRadius,
}));

export const NetworkIcon: React.FC<NetworkIconProps> = (props) => {
  const {size, chainId, ...otherProps} = props;
  const defaultUrl = getNetworkIcon('default');
  if (!chainId) {
    return <Icon type='emptyNetwork' size={size} {...otherProps} />;
  }
  return (
    <Image
      src={getNetworkIcon(chainId)}
      width={size}
      height={size}
      alt={String(chainId)}
      onError={overrideImageSrcOnError(defaultUrl)}
      {...otherProps}
    />
  );
};
