import { useRef, useState, useCallback } from "react";

export default function useMiniMapFade() {
  const [showMiniMap, setShowMiniMap] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onMoveStart = useCallback(() => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    setShowMiniMap(true);
  }, []);

  const onMoveEnd = useCallback(() => {
    hideTimeoutRef.current = setTimeout(() => {
      setShowMiniMap(false);
    }, 1000);
  }, []);

  return { showMiniMap, onMoveStart, onMoveEnd };
}
