import { useCallback } from "react";

// Define an interface for the localStorage functions
interface LocalStorageFunctions {
  setItem: <T>(key: string, value: T) => void;
  getItem: <T>(key: string) => T | null;
  deleteItem: (key: string) => void;
  clearLs: () => void;
}

function useLocalStorage(): LocalStorageFunctions {
  const setItem = useCallback((key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error setting item in localStorage", error);
    }
  }, []);

  const getItem = useCallback((key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Error getting item from localStorage", error);
      return null;
    }
  }, []);

  const deleteItem = useCallback((key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing item from localStorage", error);
    }
  }, []);

  const clearLs = useCallback(() => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing localStorage", error);
    }
  }, []);

  return { setItem, getItem, deleteItem, clearLs };
}

export default useLocalStorage;
