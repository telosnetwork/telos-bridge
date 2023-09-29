import {useLayoutEffect, useState} from 'react';

// const isMobile = useMediaQuery(theme.breakpoints.down('md'), false)
export const useMediaQuery = (
  mediaQuery: string,
  defaultValue: boolean = matchMediaMUI(mediaQuery).matches,
) => {
  const [visible, setVisible] = useState<boolean>(defaultValue);

  useLayoutEffect(() => {
    const media = matchMediaMUI(mediaQuery);
    setVisible(media.matches);
    const handleChange = (event: MediaQueryListEvent) => setVisible(event.matches);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [mediaQuery, setVisible]);

  return visible;
};

const matchMediaMUI = (muiQuery: string) => matchMedia(muiQuery.replace(/^@media( ?)/m, ''));
