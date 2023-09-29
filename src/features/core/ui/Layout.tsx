import {observer} from 'mobx-react';
import dynamic from 'next/dynamic';
import Image from 'next/legacy/image';
import Link from 'next/link';
import {useRouter} from 'next/router';

import {useToggle} from '@/core/hooks/useToggle';
import {AVAILABLE_THEMES, useUserThemePreference} from '@/core/hooks/useUserThemePreference';
import {Bar} from '@/core/ui/Bar';
import {Button} from '@/core/ui/Button';
import {Icon} from '@/core/ui/Icon';
import {ListItem as ModalListItem} from '@/core/ui/ListItem';
import {Modal, ModalProps} from '@/core/ui/Modal';
import {Box, styled} from '@/core/ui/system';

import {DesktopOnly, MobileOnly} from './PageLayout';

// The elements connected to wallet functionality need to be imported dynamically
// with ssr option set to false
//
// This is to avoid hydration errors (naturally the wallet providers are not available on the server
// so their server version would not match the client version)
const ConnectButtons = dynamic(() => import('./ConnectButtons').then((m) => m.ConnectButtons), {
  ssr: false,
});

const NavLink = styled('a', {name: 'NavLink'})<{pathname?: string}>(({theme, pathname, href}) => ({
  color: theme.palette.text.secondary,
  cursor: 'pointer',
  ...theme.typography.p2,
  ...(pathname === href && {
    color: theme.palette.text.primary,
  }),
  '&:hover': {
    color: theme.palette.text.primary,
  },
}));

const Logo = styled(Image, {name: 'Logo'})(({theme}) => ({
  filter: theme.palette.mode === 'light' ? 'invert(1)' : 'invert(0)',
}));

export const AppHeader = observer(() => {
  const router = useRouter();
  const {pathname} = router;
  const themeModal = useToggle();

  return (
    <Bar>
      <Bar.Section sx={{gap: {md: 6}}}>
        {/* <Logo src={'/static/logo.png'} width={112} height={35} alt='' /> */}
        <Link href='/bridge' passHref legacyBehavior>
          <NavLink pathname={pathname}>Bridge</NavLink>
        </Link>
      </Bar.Section>
      <Bar.Section>
        <Button variant='secondary' size='md' onClick={themeModal.open} sx={{typography: 'p2'}}>
          Change theme
        </Button>
        <ThemeSelectModal open={themeModal.value} onClose={themeModal.close} />
        <DesktopOnly>
          <ConnectButtons />
        </DesktopOnly>
      </Bar.Section>
    </Bar>
  );
});

export const AppFooter = () => {
  return (
    <Bar>
      <MobileOnly>
        <Bar.Section>
          <ConnectButtons />
        </Bar.Section>
      </MobileOnly>
      <Bar.Section sx={{minWidth: '300px'}}>
        <a href='https://layerzero.network' target='_blank' rel='noreferrer'>
          <Logo src={'/static/layerzero.svg'} height={24} width={88} alt='logo' />
        </a>
      </Bar.Section>
      <Bar.Section sx={{typography: 'p3'}}>
        <Box
          component='a'
          href='https://layerzero.network'
          sx={{typography: 'link', display: 'flex', alignItems: 'center', gap: 1}}
          target='_blank'
        >
          <Icon type='globe' size={16} />
          layerzero.network
        </Box>
        <Box
          component='a'
          href='https://layerzero.gitbook.io/'
          sx={{typography: 'link', display: 'flex', alignItems: 'center', gap: 1}}
          target='_blank'
        >
          <Icon type='file' size={16} />
          Gitbook
        </Box>
      </Bar.Section>
    </Bar>
  );
};

const ThemeSelectModal = (props: Omit<ModalProps, 'title' | 'children'>) => {
  const {changeUserThemePreference} = useUserThemePreference();
  const {open, onClose} = props;
  return (
    <Modal
      title='Select theme'
      open={open}
      onClose={onClose}
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      {AVAILABLE_THEMES.map((theme) => (
        <ModalListItem
          key={theme}
          onClick={() => {
            changeUserThemePreference(theme);
            onClose();
          }}
          bottomLeft={theme}
        />
      ))}
    </Modal>
  );
};
