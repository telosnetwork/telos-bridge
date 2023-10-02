import React from 'react';

import * as Palettes from '@/core/colorPalettes';
import {baseTheme} from '@/core/theme';
import {createTheme, ThemeProvider} from '@/core/ui/system';

const STORE_KEY = 'theme-preference';

export const THEMES = {
  'Telos Dark': createTheme({...baseTheme, palette: Palettes.telosDarkPalette}),
  'LayerZero Dark': createTheme({...baseTheme, palette: Palettes.lzDarkPalette}),
  'LayerZero Light': createTheme({...baseTheme, palette: Palettes.lzLightPalette}),
  Aptos: createTheme({...baseTheme, palette: Palettes.aptosPalette}),
  'Goerli Light': createTheme({...baseTheme, palette: Palettes.goerliLightPalette}),
  'Goerli Dark': createTheme({...baseTheme, palette: Palettes.goerliDarkPalette}),
  Pontem: createTheme({...baseTheme, palette: Palettes.pontemPalette}),
  Yellow: createTheme({...baseTheme, palette: Palettes.yellowPalette}),
};

export const AVAILABLE_THEMES = Object.keys(THEMES) as Array<ThemeName>;
type ThemeName = keyof typeof THEMES;
const DEFAULT = Object.keys(THEMES)[0] as ThemeName;

export const UserThemePreferenceProvider = ({children}: {children: React.ReactNode}) => {
  const [userThemePreference, setUserThemePreference] = React.useState<ThemeName>(DEFAULT);

  React.useEffect(() => {
    const storedValue = localStorage.getItem(STORE_KEY);
    if (storedValue) {
      setUserThemePreference(JSON.parse(storedValue));
    }
  }, []);

  const theme = THEMES[userThemePreference];
  const contextValue = React.useMemo(
    () => ({
      userThemePreference,
      changeUserThemePreference: (themeName: ThemeName) => {
        setUserThemePreference(themeName);
        localStorage.setItem(STORE_KEY, JSON.stringify(themeName));
      },
    }),
    [userThemePreference],
  );

  return (
    <UserThemePreferenceContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </UserThemePreferenceContext.Provider>
  );
};

export const UserThemePreferenceContext = React.createContext({
  userThemePreference: DEFAULT,
  changeUserThemePreference: (themeName: ThemeName) => {
    localStorage.setItem(STORE_KEY, JSON.stringify(themeName));
  },
});

export const useUserThemePreference = () => {
  return React.useContext(UserThemePreferenceContext);
};
