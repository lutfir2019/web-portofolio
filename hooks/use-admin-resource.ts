"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";

type UseAdminResourceOptions<T> = {
  autoLoad?: boolean;
  mapResponse?: (response: unknown) => T;
};

export function useAdminResource<T>(
  url: string,
  options: UseAdminResourceOptions<T>,
) {
  const { autoLoad = true, mapResponse } = options;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(autoLoad);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest<unknown>(url);
      setData(mapResponse ? mapResponse(response) : (response as T));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load data";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [mapResponse, url]);

  useEffect(() => {
    if (autoLoad) {
      void refresh();
    }
  }, [autoLoad, refresh]);

  return { data, error, isLoading, refresh, setData };
}
