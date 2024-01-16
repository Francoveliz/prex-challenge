import { useState, useEffect } from "react";

const useLocalStorage = (key: any, defaultValue: any) => {
  const [value, setValue] = useState(() => {
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
      console.error("Error parsing stored value:", error);
      return defaultValue;
    }
  });

  useEffect(() => {
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
  }, [key]);

  const updateValue = (newValue: any) => {
    try {
      const newValueString = JSON.stringify(newValue);
      localStorage.setItem(key, newValueString);
      setValue(newValue);
    } catch (error) {
      console.error("Error updating local storage:", error);
    }
  };

  return [value, updateValue];
};

export default useLocalStorage;
