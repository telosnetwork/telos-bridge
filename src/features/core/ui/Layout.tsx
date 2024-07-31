import {observer} from 'mobx-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import {useRouter} from 'next/router';
import {useEffect, useState} from 'react';

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

type AppMenuProps = {
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const NavLink = styled('a', {name: 'NavLink'})<{pathname?: string}>(({theme, pathname, href}) => ({
  color: theme.palette.text.contrast,
  cursor: 'pointer',
  ...theme.typography.p1,
  ...(pathname === href && {
    color: theme.palette.text.primary,
  }),
  '&:hover': {
    color: theme.palette.text.contrastHover,
  },
}));

const Logo = styled(Image, {name: 'Logo'})(({theme}) => ({
  filter: theme.palette.mode === 'light' ? 'invert(1)' : 'invert(0)',
}));

export const AppMenu = observer(() => {
  const router = useRouter();
  const {pathname} = router;
  const {changeUserThemePreference} = useUserThemePreference();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const logoStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
  };

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    changeUserThemePreference('Telos Dark');
  }, [changeUserThemePreference]);

  return (
    <>
      <DesktopOnly>
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            width: '300px',
            background: 'linear-gradient(0.4turn, #071033, #6039A4)',
          }}
        >
          <div style={{zIndex: 1}}>
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '20px',
                  marginBottom: '50px',
                }}
              >
                <Link href='/bridge' passHref legacyBehavior>
                  <NavLink
                    pathname={pathname}
                    style={logoStyle}
                  >
                    <Logo
                      src={'/static/telos-logo.png'}
                      width={95 * 1.5}
                      height={112 * 1.5}
                      alt='Telos Blockchain Logo'
                      priority={true}
                    />
                  </NavLink>
                </Link>
              </div>
              <div style={{display: 'flex', justifyContent: 'left', marginLeft: '30px'}}>
                <NavLink
                  sx={{'margin-left': {xs: 'auto', md: 'unset'}, display: 'flex'}}
                  href='https://stakely.io/en/faucet/telos-evm-tlos'
                  target='_blank'
                  rel='noreferrer'
                >
                  <Image
                    src='/static/icons/arrowup.svg'
                    alt='placeholder'
                    width={22}
                    height={22}
                    style={{filter: 'invert(100%)', marginRight: '10px'}}
                  />
                  Faucet
                </NavLink>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'left',
                  marginLeft: '30px',
                  marginTop: '20px',
                }}
              >
                <NavLink
                  sx={{'margin-right': {xs: 'auto', md: 'unset'}, display: 'flex'}}
                  href='https://dapp.p.network/#/swap?asset=tlos&from=eth&to=telos'
                  target='_blank'
                  rel='noreferrer'
                >
                  <Image
                    src='/static/icons/arrowup.svg'
                    alt='placeholder'
                    width={22}
                    height={22}
                    style={{filter: 'invert(100%)', marginRight: '10px'}}
                  />
                  pToken Bridge (Deprecated)
                </NavLink>
              </div>
              <div style={{position: 'absolute', bottom: '24px', left: '24px', width: '100%'}}>
                <div
                  style={{
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <a href='https://layerzero.network' target='_blank' rel='noreferrer'>
                    <Logo src={'/static/layerzero.svg'} height={24} width={88} alt='logo' />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DesktopOnly>
      <MobileOnly>
        {isMenuOpen ? (
          <>
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: '100%',
                background: 'rgba(0, 0, 0, 0.75)',
                zIndex: 10,
              }}
            ></div>
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: '300px',
                background: 'linear-gradient(0.4turn, #071033, #6039A4)',
                zIndex: 100,
              }}
            >
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <div></div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      marginTop: '20px',
                      marginBottom: '50px',
                    }}
                  >
                    <Link href='/bridge' passHref legacyBehavior>
                      <NavLink
                        pathname={pathname}
                        style={logoStyle}
                      >
                        <Logo
                          src={'/static/telos-logo.png'}
                          width={95 * 1.5}
                          height={112 * 1.5}
                          alt='Telos Blockchain Logo'
                          priority={true}
                        />
                      </NavLink>
                    </Link>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'right',
                      marginTop: '20px',
                      marginBottom: '50px',
                    }}
                  >
                    <div onClick={handleMenuClick} style={{cursor: 'pointer', marginRight: '24px'}}>
                      <Image
                        src='/static/icons/menu.svg'
                        alt='placeholder'
                        width={24}
                        height={24}
                        style={{filter: 'invert(100%)'}}
                      />
                    </div>
                  </div>
                </div>
                <div style={{marginLeft: '30px'}}>
                  <NavLink
                    sx={{'margin-left': {xs: 'auto', md: 'unset'}, display: 'flex'}}
                    href='https://stakely.io/en/faucet/telos-evm-tlos'
                    target='_blank'
                    rel='noreferrer'
                  >
                    <Icon type='link' size={28} style={{marginRight: '10px'}} />
                    Faucet
                  </NavLink>
                </div>
                <div
                  style={{
                    marginLeft: '30px',
                    marginTop: '20px',
                  }}
                >
                  <NavLink
                    sx={{'margin-right': {xs: 'auto', md: 'unset'}, display: 'flex'}}
                    href='https://dapp.p.network/#/swap?asset=tlos&from=eth&to=telos'
                    target='_blank'
                    rel='noreferrer'
                  >
                    <Icon type='link' size={28} style={{marginRight: '10px'}} />
                    pToken Bridge (Deprecated)
                  </NavLink>
                </div>

                <div style={{position: 'absolute', bottom: '24px', left: '24px', width: '100%'}}>
                  <div
                    style={{
                      zIndex: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                    }}
                  >
                    <Bar.Section>
                      <ConnectButtons />
                    </Bar.Section>
                    <a href='https://layerzero.network' target='_blank' rel='noreferrer'>
                      <Logo src={'/static/layerzero.svg'} height={24} width={88} alt='logo' />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{height: '40px'}}></div>
            <div
              onClick={handleMenuClick}
              style={{cursor: 'pointer', flex: 1, position: 'absolute', top: 0, left: '24px'}}
            >
              <Image src='/static/icons/menu.svg' alt='placeholder' width={24} height={24} />
            </div>
          </>
        )}
      </MobileOnly>
    </>
  );
});

export const AppHeader = observer(() => {
  const {changeUserThemePreference} = useUserThemePreference();

  useEffect(() => {
    changeUserThemePreference('Telos Dark');
  }, [changeUserThemePreference]);

  return (
    <>
      <Bar style={{zIndex: 1}}>
        <Bar.Section></Bar.Section>
        <Bar.Section>
          <DesktopOnly>
            <ConnectButtons />
          </DesktopOnly>
        </Bar.Section>
      </Bar>
    </>
  );
});

export const AppFooter = () => {
  return (
    <Bar style={{display: 'flex', justifyContent: 'space-between'}}>
      <Bar.Section style={{zIndex: 10}}>
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
