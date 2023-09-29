import * as React from 'react';

import {styled, Theme} from '@/core/ui/system';

import {useSessionStorageBoolean} from '../hooks/useSessionStorageBoolean';
import {Button} from './Button';
import {Icon} from './Icon';

export enum BannerType {
  INFO = 'info',
  ERROR = 'error',
  ALERT = 'alert',
}

export interface BannerProps {
  centered?: boolean;
  children: React.ReactNode;
  dismissKey?: string;
  dismissible?: boolean;
  type: BannerType;
}

function getColor(theme: Theme, type: BannerType) {
  if (type === BannerType.ERROR) return theme.palette.error.main;
  if (type === BannerType.ALERT) return theme.palette.warning.main;
  return theme.palette.info.main;
}

const SBanner = styled('div', {name: 'Banner'})<BannerProps>(({theme, ...props}) => ({
  width: '100%',
  color: theme.palette.primary.contrastText,
  paddingTop: 10,
  paddingBottom: 10,
  display: 'flex',
  alignItems: 'center',
  backgroundColor: getColor(theme, props.type),
  ...theme.typography.p2,
}));

const Content = styled('div')(({theme}) => ({
  maxWidth: 1440,
  width: '100%',
  margin: '0 auto',
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  display: 'flex',
  [theme.breakpoints.up('md')]: {
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6),
  },
}));

const Children = styled('div')<{centered?: boolean}>(({theme, centered}) => ({
  flex: 1,
  [theme.breakpoints.up('md')]: {
    textAlign: centered ? 'center' : 'left',
  },
}));

export const Banner = (props: BannerProps) => {
  const {
    centered,
    children,
    dismissKey = 'bannerDismiss',
    dismissible,
    type = BannerType.INFO,
    ...otherProps
  } = props;

  const [isDismissed, setIsDismissed] = useSessionStorageBoolean(dismissKey);

  if (dismissible && isDismissed) return null;

  return (
    <SBanner type={type} {...otherProps}>
      <Content>
        {type !== BannerType.INFO && (
          <Icon
            type='info'
            width='16'
            sx={{color: (t) => t.palette.primary.contrastText, mr: 1.5}}
          />
        )}
        <Children centered={centered}>{children}</Children>
        {dismissible && (
          <Button
            variant='incognito'
            sx={{minWidth: '16px'}}
            onClick={() => {
              setIsDismissed(true);
              sessionStorage.setItem(dismissKey, 'true');
            }}
          >
            <Icon type='close' size={16} sx={{color: (t) => t.palette.primary.contrastText}} />
          </Button>
        )}
      </Content>
    </SBanner>
  );
};
