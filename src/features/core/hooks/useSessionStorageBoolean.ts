import {useEffect, useState} from 'react';

export function useSessionStorageBoolean(key: string): [boolean, (value: boolean) => void] {
  const [hasKey, setHasKey] = useState<boolean>(false);

  useEffect(() => {
    if (sessionStorage.getItem(key)) {
      setHasKey(true);
    }
  }, []);

  return [hasKey, setHasKey];
}
