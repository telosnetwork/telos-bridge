import {useEffect, useRef} from 'react';

export function useVisibilityChange(callback: (isVisible: boolean) => void) {
  const ref = useRef(callback);
  ref.current = callback;
  useEffect(() => {
    const handler = () => {
      const isVisible = document.visibilityState === 'visible';
      ref.current(isVisible);
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);
}
