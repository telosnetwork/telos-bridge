import {Currency, CurrencyAmount, getNetwork} from '@layerzerolabs/ui-core';
import {observer} from 'mobx-react';
import {useState} from 'react';

import {unclaimedStore} from '@/bridge/stores/unclaimedStore';
import {fiatStore} from '@/core/stores/fiatStore';
import {Button} from '@/core/ui/Button';
import {CurrencyIcon} from '@/core/ui/CurrencyIcon';
import {Box} from '@/core/ui/system';

export const UnclaimedTokensPanel = observer(() => {
  const {unclaimed} = unclaimedStore;
  return (
    <>
      {unclaimed.map((balance) => (
        <UnclaimedItem
          key={balance.amount.currency.symbol}
          amount={balance.amount}
          onClaim={(currency) => unclaimedStore.claim(currency)}
        />
      ))}
    </>
  );
});

const UnclaimedItem: React.FC<{amount: CurrencyAmount; onClaim: (currency: Currency) => unknown}> =
  observer((props) => {
    const {amount, onClaim} = props;
    const network = getNetwork(amount.currency.chainId);
    const [isClaiming, setIsClaiming] = useState(false);
    const fiatBalance = fiatStore.getFiatAmount(amount);

    async function claim(currency: Currency) {
      try {
        setIsClaiming(true);
        await Promise.resolve(onClaim(currency));
      } finally {
        setIsClaiming(false);
      }
    }

    return (
      <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 2, width: '100%'}}>
        <Box sx={{display: 'flex', alignItems: 'center'}}>
          <CurrencyIcon size={32} currency={amount.currency} />
          <Box sx={{ml: 1.5}}>
            <Box sx={{typography: 'p3', color: 'text.secondary'}}>{network?.name}</Box>
            <Box sx={{typography: 'p2', color: 'text.primary'}}>{amount.currency.symbol}</Box>
          </Box>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center'}}>
          <Box sx={{textAlign: 'right'}}>
            <Box sx={{typography: 'p3', color: 'text.secondary'}}>
              {fiatBalance ? '$' + fiatBalance.value.toFixed(2) : '-'}
            </Box>
            <Box sx={{typography: 'p2', color: 'text.primary'}}>{amount.toExact()}</Box>
          </Box>
          <Button
            variant={isClaiming ? 'secondary' : 'primary'}
            size='md'
            sx={{ml: 1.5}}
            onClick={() => claim(amount.currency)}
          >
            Claim
          </Button>
        </Box>
      </Box>
    );
  });
