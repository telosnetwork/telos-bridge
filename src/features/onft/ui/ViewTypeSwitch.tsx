import {observer} from 'mobx-react';

import {Icon} from '@/core/ui/Icon';
import {Box, styled} from '@/core/ui/system';

export enum ViewType {
  List,
  Grid,
}

interface ViewTypeSwitchProps {
  value: ViewType;
  onChange: (value: ViewType) => void;
}

export const ViewTypeSwitch: React.FC<ViewTypeSwitchProps> = observer(({value, onChange}) => {
  const handleListClick = () => onChange(ViewType.List);
  const handleGridClick = () => onChange(ViewType.Grid);

  return (
    <Box sx={{display: 'flex'}}>
      <ViewTypeSwitchButton
        onClick={handleGridClick}
        selected={value === ViewType.Grid}
        title='Grid view'
      >
        <Icon type='grid' size={16} />
      </ViewTypeSwitchButton>
      <ViewTypeSwitchButton
        onClick={handleListClick}
        selected={value === ViewType.List}
        title='List view'
      >
        <Icon type='list' size={16} />
      </ViewTypeSwitchButton>
    </Box>
  );
});

const ViewTypeSwitchButton = styled('button', {name: 'ViewTypeSwitchButton'})<{selected?: boolean}>(
  ({theme, selected}) => ({
    display: 'block',
    position: 'relative',
    width: 32,
    height: 32,
    padding: 7,
    appearance: 'none',
    background: 'none',
    color: theme.palette.text.primary,
    outline: 'none',
    border: `1px solid ${theme.palette.text.primary}`,
    opacity: selected ? 1 : 0.4,
    cursor: 'pointer',
    marginRight: -1,
    transition: 'opacity 0.2s ease-in-out',
    '&:last-of-type': {
      marginRight: 0,
    },
    '&:hover': {
      opacity: 1,
    },
  }),
);
