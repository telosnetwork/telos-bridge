import {ChainId} from '@layerzerolabs/lz-sdk';
import {getNetwork} from '@layerzerolabs/ui-core';
import React from 'react';

import {ListItem} from './ListItem';
import {Modal, ModalProps} from './Modal';

export type NetworkListModalProps = {
  title?: React.ReactNode;
  options: NetworkListItem[];
  onSelect?: (chainId: ChainId) => void;
  renderOption?: (item: NetworkListItem, index: number) => React.ReactElement;
} & Omit<ModalProps, 'children' | 'title'>;

type NetworkListItem = {
  chainId: ChainId;
  disabled?: boolean;
  key?: React.Key;
};

export const NetworkListModal: React.FC<NetworkListModalProps> = ({
  options,
  title = 'Network',
  onSelect = () => {},
  renderOption = (item, index) => {
    const {chainId} = item;
    const network = getNetwork(chainId);
    return <ListItem key={index} topLeft={network.name} bottomLeft={network.symbol} />;
  },
  ...modalProps
}) => {
  return (
    <Modal title={title} {...modalProps}>
      {options.map((option, index) =>
        React.cloneElement(renderOption(option, index), {
          key: option.key ?? index,
          onClick: () => {
            if (!option.disabled) {
              onSelect(option.chainId);
            }
          },
        }),
      )}
    </Modal>
  );
};
