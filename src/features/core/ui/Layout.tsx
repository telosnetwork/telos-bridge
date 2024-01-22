import {observer} from 'mobx-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import {useRouter} from 'next/router';
import {useEffect} from 'react';

import {useUserThemePreference} from '@/core/hooks/useUserThemePreference';
import {Bar} from '@/core/ui/Bar';
import {Icon} from '@/core/ui/Icon';
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
  const {changeUserThemePreference} = useUserThemePreference();
  const logoStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
  };
  
  useEffect(() => {
    changeUserThemePreference('Telos Dark');
  }, [changeUserThemePreference]);

  return (
    <Bar>
      <Bar.Section sx={{gap: {md: 6}, width:{xs: "100%", md: 'unset'}}}>
        <Link href='/bridge' passHref legacyBehavior>
          <NavLink sx={{ margin: {xs: 'auto'}, width:{xs: "100%", md: 'unset'}}} pathname={pathname} style={logoStyle} >
            <Logo src={'/static/telos-logo.png'} width={95} height={112} alt='Telos Blockchain Logo' priority={true} />
          </NavLink>
        </Link>
        <NavLink sx={{ margin:{xs: "auto", md: 'unset'}}} href='https://stakely.io/en/faucet/telos-evm-tlos' target='_blank' rel="noreferrer">
          Faucet 
        </NavLink>
        <NavLink href='https://dapp.ptokens.io/#/swap?asset=tlos&from=eth&to=telos' target='_blank' rel="noreferrer" >
          Bridge TLOS (pToken)
        </NavLink>
        {/* <Link href='/oft' passHref legacyBehavior>
          <NavLink pathname={pathname}>OFT</NavLink>
        </Link>
        <Link href='/onft' passHref legacyBehavior>
          <NavLink pathname={pathname}>ONFT</NavLink>
        </Link> */}
      </Bar.Section>
      <Bar.Section>
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
          href='https://telos.net'
          sx={{typography: 'link', display: 'flex', alignItems: 'center', gap: 1}}
          target='_blank'
        >
          <Icon type='globe' size={16} />
          telos.net
        </Box>
        <Box
          component='a'
          href='https://docs.telos.net/'
          sx={{typography: 'link', display: 'flex', alignItems: 'center', gap: 1}}
          target='_blank'
        >
          <Icon type='file' size={16} />
          Telos Docs
        </Box>
      </Bar.Section>
    </Bar>
  );
};
