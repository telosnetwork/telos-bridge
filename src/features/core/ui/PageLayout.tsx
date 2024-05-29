import {styled, TypographyProps} from '@/core/ui/system';

interface PageLayoutProps {
  centered?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  mainBackground?: React.ReactNode;
  pageBackground?: React.ReactNode;
}

const LayoutRoot = styled('div', {name: 'Layout'})(({theme}) => ({
  minHeight: '100vh',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto',
  fontFamily: (theme.typography as TypographyProps).fontFamily,
  position: 'relative',
  backgroundImage: 'url(/static/bk-img2.svg)', //static/bk-img.jpg
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}));

const Main = styled('main', {name: 'LayoutMain', shouldForwardProp: (prop) => prop !== 'centered'})<
  Pick<PageLayoutProps, 'centered'>
>(({theme, ...props}) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: props.centered ? 'center' : 'flex-start',
  justifyContent: props.centered ? 'center' : 'flex-start',
  flex: 1,
  position: 'relative',
  [theme.breakpoints.up('md')]: {
    marginLeft: '300px',
  },
}));

export const PageLayout = (props: PageLayoutProps) => {
  const {children, centered, header, footer, mainBackground, pageBackground, sidebar} = props;
  return (
    <LayoutRoot>
      {header}
      <Main centered={centered}>
        {sidebar}
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
