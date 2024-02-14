import {observer} from 'mobx-react';

import {Button} from '@/core/ui/Button';
import {Icon} from '@/core/ui/Icon';

import {onftStore} from '../stores/onftStore';

type GasOnDestinationDetailItemProps = {
  onClick: () => void;
};

export const GasOnDestinationDetailItem = observer((props: GasOnDestinationDetailItemProps) => {
  const {onClick} = props;
  const {dstNativeAmount} = onftStore;
  const gasAmount = dstNativeAmount?.toExact();
  return (
    <div>
      {gasAmount && gasAmount !== '0' ? (
        <Button
          variant='incognito'
          onClick={onClick}
          sx={{display: 'flex', alignItems: 'center', gap: 0.5, typography: 'p3'}}
        >
          <Icon type='pencil' size={16} />
          {gasAmount} {dstNativeAmount?.currency.symbol}
        </Button>
      ) : (
        <Button variant='incognito' onClick={onClick} sx={{typography: 'p3'}}>
          + Add
        </Button>
      )}
    </div>
  );
});
