/* eslint-disable @typescript-eslint/no-explicit-any */
import { Emitter, type EmitterOptions } from './emitter';
import type { IDisposable } from '../lifecycle';
import type { DOMEventEmitter, IEvent, NodeEventEmitter } from './types';

/**
 * @description 给定一个事件，返回另一个只触发一次的事件。
 * @description_en Given an event, returns another event which only fires once.
 */
export function once<T>(event: IEvent<T>): IEvent<T> {
  return (listener, thisArgs) => {
    let didFire = false;
    let result: IDisposable | undefined = undefined;
    result = event((e) => {
      if (didFire) {
        return;
      } else if (result) {
        result.dispose();
      } else {
        didFire = true;
      }
      return listener.call(thisArgs, e);
    }, null);

    if (didFire) {
      result.dispose();
    }

    return result;
  };
}

/**
 * @description 从事件中创建一个promise，使用{@link IEvent.once}助手。
 * @description_en Creates a promise out of an event, using the {@link IEvent.once} helper.
 */
export function toPromise<T>(event: IEvent<T>): Promise<T> {
  return new Promise<T>((resolve) => once(event)(resolve));
}

/**
 * @description 将一个promise转换为事件,成功时触发promise的值，失败时触发undefined
 * @description_en Converts a promise to an event. The event fires the value of the promise when it resolves and undefined when it fails.
 */
export function fromPromise<T>(promise: Promise<T>): IEvent<T | undefined> {
  const result = new Emitter<T | undefined>();

  promise
    .then(
      (res) => {
        result.fire(res);
      },
      () => {
        result.fire(undefined);
      }
    )
    .finally(() => {
      result.dispose();
    });

  return result.event;
}

/**
 * @description 从DOM事件发射器创建一个{@link IEvent}。
 * @description_en Creates an {@link IEvent} from a DOM event emitter.
 */
export function fromDOMEventEmitter<T>(
  emitter: DOMEventEmitter,
  eventName: string,
  map: (...args: any[]) => T = (id) => id
): IEvent<T> {
  const fn = (...args: any[]) => result.fire(map(...args));
  const onFirstListenerAdd = () => emitter.addEventListener(eventName, fn);
  const onLastListenerRemove = () => emitter.removeEventListener(eventName, fn);
  const result = new Emitter<T>({
    onWillAddFirstListener: onFirstListenerAdd,
    onDidRemoveLastListener: onLastListenerRemove,
  });

  return result.event;
}

/**
 * Creates an {@link IEvent} from a node event emitter.
 */
export function fromNodeEventEmitter<T>(
  emitter: NodeEventEmitter,
  eventName: string,
  map: (...args: any[]) => T = (id) => id
): IEvent<T> {
  const fn = (...args: any[]) => result.fire(map(...args));
  const onFirstListenerAdd = () => emitter.on(eventName, fn);
  const onLastListenerRemove = () => emitter.removeListener(eventName, fn);
  const result = new Emitter<T>({
    onWillAddFirstListener: onFirstListenerAdd,
    onDidRemoveLastListener: onLastListenerRemove,
  });

  return result.event;
}

/**
 * @description 转发事件，将事件转发到另一个发射器
 * @description_en Forwards an event, firing the target emitter when the source event fires.
 * @example
 * Event.forward(source, target)
 */
export function forward<T>(from: IEvent<T>, to: Emitter<T>): IDisposable {
  return from((e) => to.fire(e));
}

/**
 * @description 运行一个函数并订阅一个事件，当事件触发时运行函数
 * @description_en Runs a function and subscribes to an event, running the function when the event fires.
 * @example
 * ```
 * // 初始化时触发，并在每次数据更改时触发
 * // Initialize on trigger and trigger on every data change
 * runAndSubscribe(dataChangeEvent, () => this._updateUI());
 * ```
 */
export function runAndSubscribe<T>(
  event: IEvent<T>,
  handler: (e: T) => unknown,
  initial: T
): IDisposable;
export function runAndSubscribe<T>(
  event: IEvent<T>,
  handler: (e: T | undefined) => unknown
): IDisposable;
export function runAndSubscribe<T>(
  event: IEvent<T>,
  handler: (e: T | undefined) => unknown,
  initial?: T
): IDisposable {
  handler(initial);
  return event((e) => handler(e));
}

/**
 * @description 给定一个事件，创建一个新的发射器，该事件将根据事件去抖延迟并给出一个触发的所有事件的数组事件对象。
 * @description_en Given an event, creates a new emitter that debounces the event with a delay and gives an array event object of all events that have triggered.
 * @param event
 * @param merge
 * @param delay
 * @param leading
 * @param flushOnListenerRemove
 */
export function debounce<T>(
  event: IEvent<T>,
  merge: (last: T | undefined, event: T) => T,
  delay?: number,
  leading?: boolean,
  flushOnListenerRemove?: boolean
): IEvent<T>;
export function debounce<I, O>(
  event: IEvent<I>,
  merge: (last: O | undefined, event: I) => O,
  delay?: number,
  leading?: boolean,
  flushOnListenerRemove?: boolean
): IEvent<O>;
export function debounce<I, O>(
  event: IEvent<I>,
  merge: (last: O | undefined, event: I) => O,
  delay = 100,
  leading = false,
  flushOnListenerRemove = true
): IEvent<O> {
  let subscription: IDisposable;
  let output: O | undefined = undefined;
  let handle: any = undefined;
  let numDebouncedCalls = 0;
  let doFire: (() => void) | undefined;

  const options: EmitterOptions = {
    onWillAddFirstListener() {
      subscription = event((cur) => {
        numDebouncedCalls++;
        output = merge(output, cur);

        if (leading && !handle) {
          emitter.fire(output);
          output = undefined;
        }

        doFire = () => {
          const _output = output;
          output = undefined;
          handle = undefined;
          if (!leading || numDebouncedCalls > 1) {
            emitter.fire(_output!);
          }
          numDebouncedCalls = 0;
        };

        clearTimeout(handle);
        handle = setTimeout(doFire, delay);
      });
    },
    onWillRemoveListener() {
      if (flushOnListenerRemove && emitter.hasListeners()) {
        doFire!();
      }
    },
    onDidRemoveLastListener() {
      doFire = undefined;
      subscription.dispose();
    },
  };
  const emitter = new Emitter<O>(options);

  return emitter.event;
}
