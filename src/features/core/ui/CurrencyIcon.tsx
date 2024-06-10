import {Currency, getCurrencyIcon} from '@layerzerolabs/ui-core';

import {styled} from '@/core/ui/system';
import {overrideImageSrcOnError} from '@/core/utils/overrideImageSrcOnError';

import { TLOS_SYMBOL } from '../../../config';
import {fiatStore} from '../stores/fiatStore';
import {Icon} from './Icon';

type CurrencyIconProps = {
  currency?: Currency | {symbol: string};
  size?: number;
};

const Image = styled('img')(() => ({}));

export const getTokenIcon = (symbol: string): string => {
  switch(symbol) {
    case 'BANANA':
      return 'https://raw.githubusercontent.com/telosnetwork/token-list/master/logos/banana-logo.png';
    case 'LVC':
      return 'https://raw.githubusercontent.com/telosnetwork/token-list/master/logos/LVC.png';
    case 'RF':
      return 'https://raw.githubusercontent.com/telosnetwork/token-list/master/logos/RF.webp';
    case 'VC':
      return 'https://raw.githubusercontent.com/telosnetwork/token-list/master/logos/VC.png';
    case TLOS_SYMBOL:
      return 'https://raw.githubusercontent.com/telosnetwork/token-list/main/logos/telos.png';
    default:
      return getCurrencyIcon(symbol);
  }
};

export const CurrencyIcon: React.FC<CurrencyIconProps> = (props) => {
  const {size, currency, ...otherProps} = props;
  const defaultUrl = getCurrencyIcon('default');
  if (!currency) {
    return <Icon type='emptyToken' size={props.size} />;
  }

  return (
    <Image
      src={getTokenIcon(fiatStore.getSymbol(currency))}
      width={size}
      height={size}
      onError={overrideImageSrcOnError(defaultUrl)}
      alt={currency.symbol}
      {...otherProps}
    />
  );
};
