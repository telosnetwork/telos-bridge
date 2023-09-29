import React from 'react';

export function useSystemAppearancePreference<Dark, Light>({
  dark,
  light,
}: {
  dark: Dark;
  light: Light;
}): Dark | Light {
  const matchMediaRef = React.useRef<MediaQueryList | null>(null);
  const [isDark, setIsDark] = React.useState(false);

  const onChangeListener = (e: MediaQueryListEvent) => setIsDark(e.matches);

  // current system scheme
  React.useEffect(() => {
    matchMediaRef.current = window.matchMedia('(prefers-color-scheme: dark)');
  }, [matchMediaRef]);

  // on system scheme change
  React.useEffect(() => {
    const matchMedia = matchMediaRef.current;
    if (matchMedia) {
      matchMedia.addEventListener('change', onChangeListener);
      setIsDark(matchMedia.matches);
    }

    return () => matchMedia?.removeEventListener('change', onChangeListener);
  }, [matchMediaRef, onChangeListener]);

  return isDark ? dark : light;
}
