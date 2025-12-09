import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "./useToast";

export const useFetch = (fetchFunction, dependencies = [], options = {}) => {
  const { successMessage, errorMessage, immediate = true } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const toast = useToast();

  // Ref para rastrear el ID de la solicitud actual y evitar condiciones de carrera
  const requestId = useRef(0);
  // Ref para saber si el componente sigue montado
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      // Al desmontar, invalidamos cualquier solicitud pendiente incrementando el ID
      requestId.current += 1;
    };
  }, []);

  const execute = useCallback(async () => {
    // Generamos un ID único para esta ejecución específica
    const currentId = ++requestId.current;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction();

      // Verificamos:
      // 1. Si el componente sigue montado
      // 2. Si esta solicitud sigue siendo la "actual" (no ha habido otra después)
      if (!isMounted.current || currentId !== requestId.current) return;

      setData(result);
      if (successMessage) toast.success(successMessage);
    } catch (err) {
      if (!isMounted.current || currentId !== requestId.current) return;

      console.error("useFetch error:", err);
      setError(err);
      if (errorMessage) toast.error(errorMessage);
    } finally {
      if (isMounted.current && currentId === requestId.current) {
        setLoading(false);
      }
    }
  }, [fetchFunction, toast, successMessage, errorMessage]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute, ...dependencies]);

  return { data, loading, error, refetch: execute, setData };
};
