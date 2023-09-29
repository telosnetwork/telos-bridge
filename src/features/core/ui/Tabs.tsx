import * as React from 'react';

import {Box, styled, SxProps, Theme} from '@/core/ui/system';

interface CommonProps {
  theme?: Theme;
  as?: React.ElementType;
  sx?: SxProps<Theme>;
}

export type TabsProps = {
  activeTab: string;
  children: React.ReactElement<TabChildProps>[] | React.ReactElement<TabChildProps>;
  setActiveTab: (_tab: string) => void;
} & CommonProps;

type TabChildProps = {
  children: React.ReactNode;
  title: string;
};

const STabs = styled(Box, {name: 'Tabs'})(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

const STabsBar = styled('div', {name: 'TabsBar'})(({theme}) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: 24,
  position: 'relative',
}));

const STab = styled('button', {name: 'Tab', shouldForwardProp: (props) => props !== 'active'})<{
  active: boolean;
}>(({theme, ...props}) => ({
  border: 0,
  backgroundColor: 'transparent',
  outline: 'none',
  cursor: 'pointer',
  paddingBottom: 16,
  color: props.active ? theme.palette.text.primary : theme.palette.text.secondary,
  paddingLeft: 0,
  paddingRight: 0,
  textAlign: 'left',
  marginRight: 12,
  borderBottom: props.active ? `1px solid ${theme.palette.text.primary}` : '1px solid transparent',
  ...theme.typography.p2,
  '&:only-child': {
    borderBottom: '1px solid transparent',
  },
  '&:hover': {
    color: theme.palette.text.primary,
  },
  '&:not(:first-of-type)': {
    marginLeft: 12,
  },
}));

const TabContent = styled('div', {name: 'TabContent'})(() => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
}));

export const Tabs = (props: TabsProps) => {
  const {children, activeTab, setActiveTab, sx} = props;
  const childrenArray = React.Children.toArray(children) as React.ReactElement<TabChildProps>[];
  const activeChild = childrenArray.find((child) => child.props.title === activeTab)!;
  const activeIdx = childrenArray.indexOf(activeChild);
  return (
    <STabs sx={sx}>
      <STabsBar>
        {React.Children.map(childrenArray, ({props: {title}}) => (
          <STab onClick={() => setActiveTab(title)} active={title === activeTab}>
            {title}
          </STab>
        ))}
      </STabsBar>
      <TabContent>{activeChild?.props.children}</TabContent>
    </STabs>
  );
};

const Tab = (_props: TabChildProps) => {
  return null;
};

Tabs.Tab = Tab;
