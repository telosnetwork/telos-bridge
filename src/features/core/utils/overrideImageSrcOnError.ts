import {ReactEventHandler} from 'react';

export const overrideImageSrcOnError: (defaultUrl: string) => ReactEventHandler<HTMLImageElement> =
  (defaultUrl: string) => (event) => {
    if (event.currentTarget.src !== defaultUrl) {
      event.currentTarget.src = defaultUrl;
    }
  };
