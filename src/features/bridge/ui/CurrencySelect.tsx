import {Currency, CurrencyAmount, FiatAmount, getNetwork, isCurrency, isNativeCurrency, Token} from '@layerzerolabs/ui-core';
import {observer} from 'mobx-react';
import Image from 'next/legacy/image';
import React, {useState} from 'react';

import {bridgeStore, CurrencyOption, OptionGroup} from '@/bridge/stores/bridgeStore';
import {useToggle} from '@/core/hooks/useToggle';
import {fiatStore} from '@/core/stores/fiatStore';
import {getWalletBalance} from '@/core/stores/utils';
import {CurrencyIcon} from '@/core/ui/CurrencyIcon';
import {ListItem as ModalListItem} from '@/core/ui/ListItem';
import {Modal} from '@/core/ui/Modal';
import {SearchBar} from '@/core/ui/SearchBar';
import {SelectButton} from '@/core/ui/SelectButton';
import {styled, SxProps, Theme} from '@/core/ui/system';

import { TLOS_SYMBOL } from '../../../config';

interface CommonProps {
  theme?: Theme;
  as?: React.ElementType;
  sx?: SxProps<Theme>;
}

type CurrencySelectProps = {
  label?: string;
  title?: string;
  icon?: boolean;
  value?: Currency;
  readonly?: boolean;
  onSelect?: (currency: Currency) => void;
  options?: (CurrencyOption | Currency)[];
  groups?: OptionGroup<CurrencyOption>[];
  renderOption?: (option: CurrencyOption, index: number) => React.ReactElement;
} & CommonProps;

const ListItem = observer(ModalListItem);

export const CurrencySelect: React.FC<CurrencySelectProps> = observer(
  ({
    icon: withIcon = true,
    title = 'Token',
    label = title,
    value,
    options = [],
    groups,
    onSelect,
    sx,
    renderOption,
    readonly = !onSelect,
  }) => {
    const modal = useToggle();
    const [search, setSearch] = useState('');
    function close() {
      modal.close();
      setSearch('');
    }

    const icon = withIcon ? <CurrencyIcon currency={value} size={40} /> : null;

    function getGroupsContent(groups: OptionGroup<CurrencyOption>[]): React.ReactNode {
      const searchLowercase = search.toLowerCase();

      const match = ({currency}: CurrencyOption) => {
        return (
          currency.symbol.toLowerCase().includes(searchLowercase) ||
          currency.name?.toLowerCase().includes(searchLowercase)
        );
      };

      const filteredGroups = !search
        ? groups
        : groups
            .map((group) => ({
              ...group,
              items: group.items.filter(match),
            }))
            .filter((group) => group.items.length > 0);

      return (
        <>
          {filteredGroups.map((group) => (
            <React.Fragment key={group.key}>
              <GroupHeader>{group.title}</GroupHeader>
              {renderOptions(group.items)}
            </React.Fragment>
          ))}
        </>
      );
    }

    function getOptionsContent(options: CurrencyOption[]): React.ReactElement {
      const filtered = options.filter((option) => matchSearch(option.currency, search));
      return renderOptions(filtered);
    }

    function renderOptions(options: CurrencyOption[]): React.ReactElement {
      const sorted = options
        .map((option) => {
          const balance = getWalletBalance(option.currency);
          const fiatBalance = fiatStore.getFiatAmount(balance);
          return {
            option,
            balance,
            fiatBalance,
          };
        })
        .sort((a, b) => {
          let aBalance = a.fiatBalance?.value;
          let bBalance = b.fiatBalance?.value;
          if (aBalance === undefined) aBalance = -1;
          if (bBalance === undefined) bBalance = -1;
          return aBalance - bBalance;
        })
        .sort(sortTokenQuantity) // order tokens w/out fiat value by token quantity          
        .sort(sortTlos) // TLOS to top
        .sort((a) => (a.option.disabled ? 1 : -1));

      return (
        <>
          {sorted.map(({option, fiatBalance, balance}, index) => {
            const onClick = () => {
              if (option.disabled) return;
              onSelect?.(option.currency);
              close();
            };
            if (renderOption) {
              return React.cloneElement(renderOption(option, index), {onClick, key: index});
            }
            const {currency} = option;
            const network = getNetwork(currency.chainId);
            const key = index;
            return (
              <ListItem
                key={key}
                disabled={option.disabled}
                overlay={option.overlay}
                startAdornment={<CurrencyIcon size={32} currency={currency} />}
                bottomLeft={fiatStore.getSymbol(currency)}
                topLeft={network.name}
                topRight={balance?.toExact() ?? '-'}
                bottomRight={fiatBalance ? '$' + fiatBalance.value.toFixed(2) : '-'}
                onClick={onClick}
              />
            );
          })}
        </>
      );
    }

    const content = groups ? getGroupsContent(groups) : getOptionsContent(options.map(toOption));

    const SelectTokenContainer = styled('div', {name: 'SelectTokenContainer'})(({theme}) => ({
      width: '100%',
      height: '100%',
    }));

    return (
      <>
        {!value || isNativeCurrency(value) ? (
          <SelectButton
            sx={sx}
            title={label}
            chevron={!readonly}
            onClick={readonly ? undefined : modal.value ? close : modal.open}
            icon={icon}
            value={fiatStore.getSymbol(value)}
            readonly={readonly}
          />
        ) : (
          <SelectTokenContainer>
            <SelectButton
              style={{width: '100%', float: 'left', paddingRight: '0'}}
              sx={sx}
              title={label}
              chevron={!readonly}
              onClick={readonly ? undefined : modal.value ? close : modal.open}
              icon={icon}
              value={fiatStore.getSymbol(value)}
              readonly={readonly}
            />
          </SelectTokenContainer>
        )}
        <Modal
          overlay
          title={title}
          topAdornment={<SearchBar value={search} onChange={(e) => setSearch(e.target.value)} />}
          open={readonly ? false : modal.value}
          onClose={close}
        >
          {content}
        </Modal>
      </>
    );
  },
);

function matchSearch(currency: Currency, query?: string) {
  if (!query) return true;
  const text = query.toLowerCase();
  return currency.symbol.toLowerCase().includes(text);
}

type NestedCurrencyOption = {
  option: CurrencyOption;
}
// sort TLOS tokens to top of list
function sortTlos(a:NestedCurrencyOption, b:NestedCurrencyOption){
  return (a.option.currency.symbol === TLOS_SYMBOL && b.option.currency.symbol !== TLOS_SYMBOL) ? 1 
    : (a.option.currency.symbol !== TLOS_SYMBOL && b.option.currency.symbol === TLOS_SYMBOL ? -1 
    : 0)
}

type TokenOption = {
  option: CurrencyOption;
  balance: CurrencyAmount<Currency> | undefined;
  fiatBalance: FiatAmount | undefined;
}

function sortTokenQuantity(a: TokenOption, b: TokenOption){
  if (a.fiatBalance?.value === undefined && b.fiatBalance?.value === undefined){
    let aBalance = a.balance?.quotient;
    let bBalance = b.balance?.quotient;
    if (aBalance === undefined) aBalance = 0n;
    if (bBalance === undefined) bBalance = 0n;
    return aBalance - bBalance > 0 ? -1 
      : aBalance - bBalance < 0 ? 1 
      : 0
  }
  return 0;
}

function toOption(option: CurrencyOption | Currency): CurrencyOption {
  if (isCurrency(option)) {
    return {
      currency: option,
    };
  }
  return option;
}

const GroupHeader = styled('div', {name: 'CurrencySelect-GroupHeader'})(({theme}) => ({
  ...theme.typography.caption,
  textTransform: 'uppercase',
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
  marginLeft: theme.spacing(2),
  marginTop: theme.spacing(1),
  '&:first-of-type': {
    marginTop: 0,
  },
}));
