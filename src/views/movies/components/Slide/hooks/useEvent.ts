// hooks/useEvent.ts
import { useEffect, useRef } from 'react';

type EventListener<K extends keyof WindowEventMap> = (this: Window, ev: WindowEventMap[K]) => any;
type ElementEventListener<K extends keyof HTMLElementEventMap> = (this: HTMLElement, ev: HTMLElementEventMap[K]) => any;

export function useEvent<K extends keyof WindowEventMap>(
  target: Window | Document | HTMLElement | null | React.RefObject<HTMLElement>,
  eventName: K,
  handler: EventListener<K>,
  options?: boolean | AddEventListenerOptions
): void;
export function useEvent<K extends keyof HTMLElementEventMap>(
  target: HTMLElement | null | React.RefObject<HTMLElement>,
  eventName: K,
  handler: ElementEventListener<K>,
  options?: boolean | AddEventListenerOptions
): void;
export function useEvent<T extends EventTarget, K extends keyof EventTargetEventMap<T>>(
  target: T | null | React.RefObject<T>,
  eventName: K,
  handler: (this: T, ev: EventTargetEventMap<T>[K]) => any,
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

    currentTarget.addEventListener(eventName, eventListener as EventListenerOrEventListenerObject, options);

    return () => {
      currentTarget?.removeEventListener(eventName, eventListener as EventListenerOrEventListenerObject, options);
    };
  }, [target, eventName, options]);
}

type EventTargetEventMap<T> = T extends Window
  ? WindowEventMap
  : T extends Document
    ? DocumentEventMap
    : T extends HTMLElement
      ? HTMLElementEventMap
      : EventTargetEventMapDefault;

interface EventTargetEventMapDefault {
  [key: string]: Event;
}
