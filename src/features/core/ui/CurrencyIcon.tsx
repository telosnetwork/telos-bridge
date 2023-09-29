import {Currency, getCurrencyIcon} from '@layerzerolabs/ui-core';

import {styled} from '@/core/ui/system';
import {overrideImageSrcOnError} from '@/core/utils/overrideImageSrcOnError';

import {fiatStore} from '../stores/fiatStore';
import {Icon} from './Icon';

type CurrencyIconProps = {
  currency?: Currency | {symbol: string};
  size?: number;
};

const Image = styled('img')(() => ({}));

export const CurrencyIcon: React.FC<CurrencyIconProps> = (props) => {
  const {size, currency, ...otherProps} = props;
  const defaultUrl = getCurrencyIcon('default');
  if (!currency) {
    return <Icon type='emptyToken' size={props.size} />;
  }
  return (
    <Image
      src={getCurrencyIcon(fiatStore.getSymbol(currency))}
      width={size}
      height={size}
      onError={overrideImageSrcOnError(defaultUrl)}
      alt={currency.symbol}
      {...otherProps}
    />
  );
};
