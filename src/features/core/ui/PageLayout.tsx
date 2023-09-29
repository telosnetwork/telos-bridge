import {styled, TypographyProps} from '@/core/ui/system';

interface PageLayoutProps {
  centered?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  header?: React.ReactNode;
  mainBackground?: React.ReactNode;
  pageBackground?: React.ReactNode;
}

const LayoutRoot = styled('div', {name: 'Layout'})(({theme}) => ({
  minHeight: '100vh',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.default,
  overflow: 'auto',
  fontFamily: (theme.typography as TypographyProps).fontFamily,
  position: 'relative',
}));

const Main = styled('main', {name: 'LayoutMain', shouldForwardProp: (prop) => prop !== 'centered'})<
  Pick<PageLayoutProps, 'centered'>
>(({...props}) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: props.centered ? 'center' : 'flex-start',
  justifyContent: props.centered ? 'center' : 'flex-start',
  flex: 1,
  position: 'relative',
}));

export const PageLayout = (props: PageLayoutProps) => {
  const {children, centered, header, footer, mainBackground, pageBackground} = props;
  return (
    <LayoutRoot>
      {header}
      <Main centered={centered}>
        {mainBackground}
        {children}
      </Main>
      {pageBackground}
      {footer}
    </LayoutRoot>
  );
};

interface MediaQueryProps {
  display?: string;
}

export const MobileOnly = styled('div')<MediaQueryProps>(({theme, ...props}) => ({
  display: props.display ?? 'block',
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}));

export const DesktopOnly = styled('div')<MediaQueryProps>(({theme, ...props}) => ({
  display: 'none',
  [theme.breakpoints.up('md')]: {
    display: props.display ?? 'block',
  },
}));
