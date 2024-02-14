import {ChainId} from '@layerzerolabs/lz-sdk';
import {getNetwork} from '@layerzerolabs/ui-core';
import {observer} from 'mobx-react';
import React, {useState} from 'react';

import {useToggle} from '@/core/hooks/useToggle';
import {ListItem as ModalListItem} from '@/core/ui/ListItem';
import {Modal} from '@/core/ui/Modal';
import {NetworkIcon} from '@/core/ui/NetworkIcon';
import {SearchBar} from '@/core/ui/SearchBar';
import {SelectButton} from '@/core/ui/SelectButton';
import {SxProps, Theme} from '@/core/ui/system';

import { BridgeStore } from '../stores/bridgeStore';

interface CommonProps {
  theme?: Theme;
  as?: React.ElementType;
  sx?: SxProps<Theme>;
}

type NetworkSelectProps = {
  icon?: boolean;
  overlay?: boolean;
  readonly?: boolean;
  onSelect?: (chainId: ChainId) => void;
  options?: (NetworkSelectOption | ChainId)[];
  renderOption?: (option: NetworkSelectOption, index: number) => React.ReactElement;
  component?: typeof SelectButton;
  title?: string;
  value?: ChainId;
  withSearch?: boolean;
} & Omit<CommonProps, 'as'>;

export type NetworkSelectOption = {
  chainId: ChainId;
  disabled?: boolean;
  overlay?: React.ReactNode;
};

const ListItem = observer(ModalListItem);

export const NetworkSelect: React.FC<NetworkSelectProps> = observer(
  ({
    icon: withIcon = true,
    title = 'Network',
    value,
    options = [],
    overlay = true,
    onSelect,
    renderOption,
    component,
    withSearch = true,
    readonly = !onSelect,
    ...props
  }) => {
    const modal = useToggle();
    const [search, setSearch] = useState('');
    const filtered = options.map(toOption).filter((option) => matchSearch(option.chainId, search));
    
    // maintain preferred order while filtering available options to the top
    filtered.sort((a, b) => BridgeStore.chainOrder.indexOf(a.chainId) - BridgeStore.chainOrder.indexOf(b.chainId))
    filtered.sort((a, b) => (a.disabled === b.disabled) || (a.disabled && !b.disabled) ? 1 : -1);

    const icon = withIcon ? <NetworkIcon chainId={value} size={40} /> : null;
    const network = value ? getNetwork(value) : undefined;

    function close() {
      modal.close();
      setSearch('');
    }

    const SelectComponent = component ?? SelectButton;

    return (
      <>
        <SelectComponent
          title={title}
          onClick={readonly ? undefined : modal.value ? close : modal.open}
          chevron={!readonly}
          icon={icon}
          value={network?.name}
          readonly={readonly}
          {...props}
        />
        <Modal
          overlay={overlay}
          topAdornment={
            withSearch ? (
              <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} />
            ) : null
          }
          title={title}
          open={readonly ? false : modal.value}
          onClose={close}
        >
          {filtered.map((option, index) => {
            const {chainId} = option;
            const network = getNetwork(chainId);
            const onClick = () => {
              if (option.disabled) return;
              onSelect?.(chainId);
              close();
            };

            if (renderOption) {
              return React.cloneElement(renderOption(option, index), {onClick, key: index});
            }

            return (
              <ListItem
                disabled={option.disabled}
                overlay={option.overlay}
                startAdornment={<NetworkIcon chainId={chainId} size={32} />}
                key={index}
                topLeft={network.name}
                bottomLeft={network.symbol}
                onClick={onClick}
              />
            );
          })}
        </Modal>
      </>
    );
  },
);

function matchSearch(chainId: ChainId, query?: string) {
  if (!query) return true;
  const text = query.toLowerCase();
  const network = getNetwork(chainId);
  return network.name.toLowerCase().includes(text) || network.symbol.includes(text);
}

function toOption(option: NetworkSelectOption | ChainId): NetworkSelectOption {
  if (typeof option === 'number') {
    return {
      chainId: option,
    };
  }
  return option;
}
