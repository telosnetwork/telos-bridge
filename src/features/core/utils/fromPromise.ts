import {IPromiseBasedObservable} from 'mobx-utils';

export type FromPromise<T> = IPromiseBasedObservable<T>;

export function fromPromiseValue<T>(
  observablePromise: IPromiseBasedObservable<T> | undefined,
): T | undefined {
  if (observablePromise?.state === 'fulfilled') {
    return observablePromise.value;
  }
  return undefined;
}
