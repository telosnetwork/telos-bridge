import {ChainId} from '@layerzerolabs/lz-sdk';
import React from 'react';

import {ListItem} from './ListItem';
import {Modal, ModalProps} from './Modal';

export type ModalListProps<Item extends ModalListItem> = {
  title?: React.ReactNode;
  items: Item[];
  onSelect?: (chainId: ChainId) => void;
  renderItem?: (item: Item, index: number) => React.ReactElement;
} & Omit<ModalProps, 'children' | 'title'>;

type ModalListItem = {
  text?: string;
  disabled?: boolean;
  key?: React.Key;
};

export const ModalList: React.FC<ModalListProps<{disabled: boolean; chainId: ChainId}>> = ({
  items,
  title = 'Network',
  onSelect = () => {},
  renderItem = (item: ModalListItem, index: number) => {
    return <ListItem key={index} topLeft={item.text} />;
  },
  ...modalProps
}) => {
  return (
    <Modal title={title} {...modalProps}>
      {items.map((item, index) =>
        React.cloneElement(renderItem(item, index), {
          key: index,
          onClick: () => {
            if (!item.disabled) {
              onSelect(item.chainId);
            }
          },
        }),
      )}
    </Modal>
  );
};
