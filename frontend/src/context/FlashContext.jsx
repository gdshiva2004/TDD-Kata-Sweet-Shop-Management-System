import { createContext, useState, useCallback } from "react";

export const FlashContext = createContext();

export function FlashProvider({ children }) {
  const [flash, setFlash] = useState(null);

  const showFlash = useCallback((msg, type = "success") => {
    setFlash({ msg, type });
    setTimeout(() => setFlash(null), 3000); // auto hide
  }, []);

  return (
    <FlashContext.Provider value={{ flash, showFlash }}>
      {children}
    </FlashContext.Provider>
  );
}
