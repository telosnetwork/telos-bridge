import React from 'react';

import {Box, styled} from '@/core/ui/system';

const SelectorRoot = styled(Box, {name: 'Selector-SelectorRoot'})(() => ({
  position: 'relative',
  width: '100%',
}));

const BgBar = styled('div', {name: 'Selector-BgBar'})(({theme}) => ({
  width: '100%',
  backgroundColor: theme.palette.secondary.main,
  borderRadius: theme.shape.borderRadius,
  height: 32,
}));

const Buttons = styled('div', {name: 'Selector-Buttons'})(() => ({
  position: 'absolute',
  top: 0,
  bottom: 0,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
}));

type ButtonBaseProps = {itemWidth: number; active?: boolean};

const Button = styled('button', {name: 'Selector-Button'})<ButtonBaseProps>(
  ({itemWidth, active, theme}) => ({
    color: active ? theme.palette.primary.contrastText : theme.palette.secondary.contrastText,
    backgroundColor: 'transparent',
    border: 0,
    borderRadius: theme.shape.borderRadius,
    width: `${itemWidth}%`,
    height: '100%',
    textTransform: 'uppercase',
    outline: 0,
    ...theme.typography.p3,
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.05)',
      opacity: 0.7,
      cursor: 'pointer',
    },
  }),
);

const SelectionBox = styled('div', {name: 'Selector-SelectionBox'})<{
  position?: number;
  itemWidth: number;
}>(({position = 0, itemWidth, theme}) => ({
  backgroundColor: theme.palette.primary.main,
  borderRadius: theme.shape.borderRadius,
  width: `${itemWidth}%`,
  height: 32,
  position: 'absolute',
  top: 0,
  transform: `translateX(${position * 100}%)`,
  transition: 'transform 100ms ease-out',
}));

interface SelectorProps {
  selection: string;
  children: React.ReactElement<OptionChildProps>[] | React.ReactElement<OptionChildProps>;
}

type OptionChildProps = {
  children: React.ReactNode;
  onClick?: () => void;
  value: string;
};

export const Selector = (props: SelectorProps) => {
  const {selection} = props;
  const childrenArray = React.Children.toArray(props.children) as React.ReactElement[];
  const activeChildIdx = childrenArray.findIndex((child) => child.props.value === selection);
  const selectionPosition = Math.max(activeChildIdx, 0);
  const itemWidth = 100 / childrenArray.length;
  return (
    <SelectorRoot>
      <BgBar />
      {activeChildIdx > -1 && <SelectionBox position={selectionPosition} itemWidth={itemWidth} />}
      <Buttons>
        {React.Children.map(childrenArray, ({props: {value, onClick, children}}) => (
          <Button onClick={onClick} itemWidth={itemWidth} active={selection === value}>
            {children}
          </Button>
        ))}
      </Buttons>
    </SelectorRoot>
  );
};

const Option: React.FC<OptionChildProps> = () => {
  return null;
};

Selector.Option = Option;
