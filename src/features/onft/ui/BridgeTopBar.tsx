import {Button} from '@/core/ui/Button';
import {styled, SxProps, Theme} from '@/core/ui/system';

import {onftStore} from '../stores/onftStore';
import {NetworkFilter} from './NetworkFilter';
import {ViewType, ViewTypeSwitch} from './ViewTypeSwitch';

type BridgeTopBarProps = {
  viewType: ViewType;
  setViewType?: (viewType: ViewType) => void;
  onTransfer?: () => void;
  sx?: SxProps<Theme>;
};

export const BridgeTopBar = (props: BridgeTopBarProps) => {
  const {viewType, setViewType = () => {}, onTransfer = () => {}, sx = {}} = props;
  const {items} = onftStore.form;
  return (
    <TopBar sx={sx}>
      <NetworkFilter />
      <TopBarRightSection>
        <ViewTypeSwitch value={viewType} onChange={setViewType} />
        <Button
          variant='primary'
          onClick={onTransfer}
          disabled={items.length === 0}
          sx={{flex: {xs: 1}, whiteSpace: 'nowrap'}}
          size='md'
        >
          Transfer
          {items.length > 0 && ` (${items.length})`}
        </Button>
      </TopBarRightSection>
    </TopBar>
  );
};

const TopBar = styled('div', {name: 'TopBar'})(({theme}) => ({
  paddingBottom: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexDirection: 'column',
  gap: 16,
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
  },
}));

const TopBarRightSection = styled('div', {name: 'TopBarRightSection'})(({theme}) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 24,
  boxShadow: `-18px 0 10px ${theme.palette.background.default}`,
  position: 'relative',
  zIndex: 1,
  width: '100%',
  pl: '16px',
  [theme.breakpoints.up('md')]: {
    width: 'auto',
    paddingLeft: 0,
  },
}));
