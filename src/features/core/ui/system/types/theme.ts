import {
  CSSObject,
  SxProps as SystemSxProps,
  SystemProps as SystemSystemProps,
  Theme as SystemTheme,
} from '@mui/system';

export interface Typography {
  fontFamily: string;
  h1: CSSObject;
  h2: CSSObject;
  h3: CSSObject;
  p1: CSSObject;
  p2: CSSObject;
  p3: CSSObject;
  caption: CSSObject;
}

export interface Theme extends Omit<SystemTheme, 'typography'> {
  typography: Typography;
}

export type SxProps = SystemSxProps<Theme>;

export type SystemProps = SystemSystemProps<Theme>;
