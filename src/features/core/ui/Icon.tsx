import React from 'react';

import {keyframes, styled, SxProps, Theme, useTheme} from '@/core/ui/system';
import ActiveDot from '@/public/static/icons/activeDot.svg';
import Arrow from '@/public/static/icons/arrow.svg';
import BlockchainExplorer from '@/public/static/icons/blockchainExplorer.svg';
import Checkmark from '@/public/static/icons/checkmark.svg';
import Chevron from '@/public/static/icons/chevron.svg';
import Close from '@/public/static/icons/close.svg';
import Cube from '@/public/static/icons/cube.svg';
import Error from '@/public/static/icons/error.svg';
import File from '@/public/static/icons/file.svg';
import Globe from '@/public/static/icons/globe.svg';
import Grid from '@/public/static/icons/grid.svg';
import Info from '@/public/static/icons/info.svg';
import Link from '@/public/static/icons/link.svg';
import LinkFA from '@/public/static/icons/linkfa.svg';
import List from '@/public/static/icons/list.svg';
import Minus from '@/public/static/icons/minus.svg';
import Pencil from '@/public/static/icons/pencil.svg';
import Plus from '@/public/static/icons/plus.svg';
import Search from '@/public/static/icons/search.svg';
import Success from '@/public/static/icons/success.svg';
import Swap from '@/public/static/icons/swap.svg';
import Trash from '@/public/static/icons/trash.svg';

const Spinner = styled('div', {name: 'IconSpinner'})<{
  size?: number;
  color?: string;
  inline?: boolean;
}>((props) => ({
  borderRadius: '100%',
  width: props.size ?? 16,
  height: props.size ?? 16,
  borderWidth: 2,
  borderStyle: 'solid',
  borderColor: props.theme.palette.secondary.main,
  borderTopColor: props.color ?? props.theme.palette.text.primary,
  borderRightColor: props.color ?? props.theme.palette.text.primary,
  animation: `1s ${rotate} linear infinite`,
  display: 'inline-block',
  verticalAlign: props.inline ? 'middle' : undefined,
}));

type EmptyIconProps = {
  size?: number;
};

const EmptyToken: React.FC<EmptyIconProps> = (props) => {
  const theme = useTheme();
  const {size = 40} = props;
  return (
    <svg viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <rect
        width={size}
        height={size}
        rx='20'
        fill={theme.palette.divider ?? 'rgba(242, 242, 242, 0.12)'}
      />
    </svg>
  );
};

const EmptyNetwork: React.FC<EmptyIconProps> = (props) => {
  const theme = useTheme();
  const {size = 40} = props;
  return (
    <svg viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <rect
        width={size}
        height={size}
        fill={theme.palette.divider ?? 'rgba(242, 242, 242, 0.12)'}
      />
    </svg>
  );
};

const ICONS = {
  blockchainExplorer: BlockchainExplorer,
  checkmark: Checkmark,
  chevron: Chevron,
  close: Close,
  emptyNetwork: EmptyNetwork,
  emptyToken: EmptyToken,
  error: Error,
  info: Info,
  search: Search,
  success: Success,
  swap: Swap,
  spinner: Spinner,
  activeDot: ActiveDot,
  list: List,
  grid: Grid,
  arrow: Arrow,
  pencil: Pencil,
  cube: Cube,
  trash: Trash,
  plus: Plus,
  minus: Minus,
  file: File,
  globe: Globe,
  link: Link,
  linkfa: LinkFA,
};

type Icons = typeof ICONS;

type IconProps = {
  color?: string;
  size?: number;
  type: keyof Icons;
} & React.ComponentProps<'svg'> & {sx?: SxProps<Theme>};

export const BaseIcon = React.forwardRef<React.ElementType, IconProps>(({type, ...props}, ref) => {
  const IconComponent = ICONS[type];
  if (!type) {
    return null;
  }
  return <IconComponent {...props} ref={ref} />;
});

BaseIcon.displayName = 'BaseIcon';

export const Icon = styled(BaseIcon, {name: 'Icon'})(({color = 'currentColor', size}) => ({
  color,
  width: size || 'initial',
  minWidth: size || 'initial',
  height: size || 'initial',
}));

const rotate = keyframes({
  '0%': {
    transform: 'rotate(0deg)',
  },
  '100%': {
    transform: 'rotate(360deg)',
  },
});
