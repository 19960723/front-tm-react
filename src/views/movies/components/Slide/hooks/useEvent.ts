// src/hooks/useEvent.ts
import { useEffect, useRef } from 'react';

// 辅助类型，确保事件名是字符串
type EventNames<T extends EventTarget> = keyof (T extends Window
  ? WindowEventMap
  : T extends Document
    ? DocumentEventMap
    : T extends HTMLElement
      ? HTMLElementEventMap
      : Record<string, Event>);

/**
 * 通用 Hook，用于附加和分离事件监听器。
 *
 * @param target 事件目标 (例如：`window`, `document` 或 HTML 元素的引用)。
 * @param eventName 事件名称。
 * @param handler 事件处理函数。
 * @param options 事件监听器选项 (例如：`passive`, `capture`)。
 */
export function useEvent<
  T extends Window | Document | HTMLElement | null | React.RefObject<HTMLElement>,
  K extends EventNames<NonNullable<T extends React.RefObject<infer R> ? R : T>>,
>(
  target: T,
  eventName: K,
  handler: (
    this: NonNullable<T extends React.RefObject<infer R> ? R : T>,
    ev: (NonNullable<T extends React.RefObject<infer R> ? R : T> extends Window
      ? WindowEventMap
      : NonNullable<T extends React.RefObject<infer R> ? R : T> extends Document
        ? DocumentEventMap
        : NonNullable<T extends React.RefObject<infer R> ? R : T> extends HTMLElement
          ? HTMLElementEventMap
          : Record<string, Event>)[K]
  ) => any,
  options?: boolean | AddEventListenerOptions
) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    let currentTarget: EventTarget | null = null;

    if (target instanceof Window || target instanceof Document || target instanceof HTMLElement) {
      currentTarget = target;
    } else if (target && 'current' in target) {
      currentTarget = target.current;
    }

    if (!currentTarget) return;

    const eventListener = (event: Event) => handlerRef.current.call(currentTarget, event);

    currentTarget.addEventListener(eventName as string, eventListener as EventListenerOrEventListenerObject, options);

    return () => {
      currentTarget?.removeEventListener(eventName as string, eventListener as EventListenerOrEventListenerObject, options);
    };
  }, [target, eventName, options]);
}
