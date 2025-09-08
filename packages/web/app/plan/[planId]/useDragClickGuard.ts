import { useRef, useCallback } from 'react';

/**
 * Hook to prevent accidental clicks immediately after drag operations
 * 
 * This is needed because drag operations can sometimes trigger click events
 * when the user releases the mouse, leading to unwanted actions like
 * opening modals right after completing a drag.
 */
export function useDragClickGuard() {
  const isDraggingRef = useRef(false);
  const dragEndTimeRef = useRef<number>(0);
  
  // Track when drag starts
  const onDragStart = useCallback(() => {
    isDraggingRef.current = true;
  }, []);
  
  // Track when drag ends
  const onDragEnd = useCallback(() => {
    isDraggingRef.current = false;
    dragEndTimeRef.current = Date.now();
  }, []);
  
  // Guard function that wraps click handlers
  const guardClick = useCallback((handler: () => void) => {
    return () => {
      const now = Date.now();
      const timeSinceDragEnd = now - dragEndTimeRef.current;
      
      // Block clicks if:
      // 1. Currently dragging
      // 2. Less than 150ms since drag ended (prevents accidental clicks)
      if (isDraggingRef.current || timeSinceDragEnd < 150) {
        return;
      }
      
      handler();
    };
  }, []);
  
  return {
    onDragStart,
    onDragEnd,
    guardClick
  };
}

/**
 * Alternative version that works with event handlers
 * Useful when you need to pass the click event to your handler
 */
export function useDragClickGuardWithEvent() {
  const isDraggingRef = useRef(false);
  const dragEndTimeRef = useRef<number>(0);
  
  const onDragStart = useCallback(() => {
    isDraggingRef.current = true;
  }, []);
  
  const onDragEnd = useCallback(() => {
    isDraggingRef.current = false;
    dragEndTimeRef.current = Date.now();
  }, []);
  
  const guardClick = useCallback(<T extends Event>(handler: (event: T) => void) => {
    return (event: T) => {
      const now = Date.now();
      const timeSinceDragEnd = now - dragEndTimeRef.current;
      
      if (isDraggingRef.current || timeSinceDragEnd < 150) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      
      handler(event);
    };
  }, []);
  
  return {
    onDragStart,
    onDragEnd,
    guardClick
  };
}