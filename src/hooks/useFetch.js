import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "./useToast";

// Cache global simple en memoria (se limpia al recargar la página F5)
const globalCache = new Map();

export const useFetch = (fetchFunction, dependencies = [], options = {}) => {
  const {
    successMessage,
    errorMessage,
    immediate = true,
    cacheKey = null, // Nueva opción para habilitar caché
  } = options;

  const [data, setData] = useState(() => {
    // Estado inicial: si hay caché, úsalo
    if (cacheKey && globalCache.has(cacheKey)) {
      return globalCache.get(cacheKey);
    }
    return null;
  });

  // Si tenemos datos en caché, no mostramos loading inicial (stale-while-revalidate)
  const [loading, setLoading] = useState(
    immediate && (!cacheKey || !globalCache.has(cacheKey))
  );
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

    // Solo mostramos loading si no tenemos datos previos (o si queremos forzar indicador de actualización)
    if (!data) setLoading(true);

    setError(null);

    try {
      const result = await fetchFunction();

      // Verificamos:
      // 1. Si el componente sigue montado
      // 2. Si esta solicitud sigue siendo la "actual" (no ha habido otra después)
      if (!isMounted.current || currentId !== requestId.current) return;

      // Actualizamos caché si existe key
      if (cacheKey) {
        globalCache.set(cacheKey, result);
      }

      // Solo actualizamos estado si los datos son diferentes (optimización básica)
      if (JSON.stringify(result) !== JSON.stringify(data)) {
        setData(result);
      }

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
  }, [fetchFunction, successMessage, errorMessage, cacheKey, data, toast]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute, ...dependencies]);

  return { data, loading, error, refetch: execute, setData };
};

// Helper para invalidar caché manualmente (útil después de mutaciones)
export const invalidateCache = (pattern) => {
  if (!pattern) {
    globalCache.clear();
    return;
  }
  for (const key of globalCache.keys()) {
    if (key.includes(pattern)) {
      globalCache.delete(key);
    }
  }
};
