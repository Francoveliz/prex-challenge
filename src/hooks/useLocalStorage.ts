import { useState, useEffect } from "react";

const useLocalStorage = (key: string, defaultValue: any) => {
  const isClient = typeof window !== "undefined"; // Verifica si se está ejecutando en un entorno de navegador

  const [value, setValue] = useState(() => {
    try {
      // Solo intenta acceder a localStorage si se está ejecutando en el navegador
      if (isClient) {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
      }
    } catch (error) {
      console.error("Error parsing stored value:", error);
    }

    return defaultValue;
  });

  useEffect(() => {
    // Solo suscríbete a cambios en localStorage si se está ejecutando en el navegador
    if (isClient) {
      const handleStorageChange = (event: any) => {
        if (event.key === key) {
          try {
            setValue(event.newValue ? JSON.parse(event.newValue) : null);
          } catch (error) {
            console.error("Error parsing changed value:", error);
          }
        }
      };

      window.addEventListener("storage", handleStorageChange);

      return () => {
        window.removeEventListener("storage", handleStorageChange);
      };
    }
  }, [key, isClient]);

  const updateValue = (newValue: any) => {
    try {
      // Solo actualiza localStorage si se está ejecutando en el navegador
      if (isClient) {
        const newValueString = JSON.stringify(newValue);
        localStorage.setItem(key, newValueString);
        setValue(newValue);
      }
    } catch (error) {
      console.error("Error updating local storage:", error);
    }
  };

  return [value, updateValue];
};

export default useLocalStorage;
