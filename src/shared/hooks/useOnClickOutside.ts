import { useEffect, RefObject } from 'react';

type EventType = MouseEvent | TouchEvent;

export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
    ref: RefObject<T | null>,
    handler: (event: EventType) => void
) {
    useEffect(() => {
        const listener = (event: EventType) => {
            const el = ref?.current;
            
            // Do nothing if clicking ref's element or descendent elements
            if (!el || el.contains(event.target as Node)) {
                return;
            }
            
            handler(event);
        };

        // Bind events using capture phase so it fires before other handlers
        document.addEventListener('mousedown', listener, true);
        document.addEventListener('touchstart', listener, true);

        return () => {
            document.removeEventListener('mousedown', listener, true);
            document.removeEventListener('touchstart', listener, true);
        };
    }, [ref, handler]);
}
