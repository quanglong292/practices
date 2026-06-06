import { useState, useEffect, useCallback, useRef } from "react";

// Types for Cache Entry and Subscribers
interface CacheEntry<TData = any, TError = any> {
  data: TData | undefined;
  error: TError | null;
  status: "pending" | "success" | "error";
  isFetching: boolean;
  updatedAt: number;
  promise: Promise<TData> | null;
  listeners: Set<() => void>;
}

// Global Cache Store to persist query states across component lifetimes
const globalQueryCache: Record<string, CacheEntry> = {};

/**
 * Utility function to serialize query key into a string.
 * Helps with nested array or object keys like ['user', 1].
 */
const serializeQueryKey = (key: any): string => {
  const isKeyArray = Array.isArray(key);
  if (isKeyArray) {
    const serializedArray = JSON.stringify(key);
    return serializedArray;
  }

  const isKeyObject = typeof key === "object" && key !== null;
  if (isKeyObject) {
    const serializedObject = JSON.stringify(key);
    return serializedObject;
  }

  const serializedKeyAsString = String(key);
  return serializedKeyAsString;
};

/**
 * Retrieves an existing cache entry or instantiates a new one if not present.
 */
const getOrCreateCacheEntry = (serializedKey: string): CacheEntry => {
  const cacheEntryExists = globalQueryCache[serializedKey] !== undefined;
  if (cacheEntryExists) {
    const existingEntry = globalQueryCache[serializedKey];
    return existingEntry;
  }

  const newEntry: CacheEntry = {
    data: undefined,
    error: null,
    status: "pending",
    isFetching: false,
    updatedAt: 0,
    promise: null,
    listeners: new Set(),
  };

  globalQueryCache[serializedKey] = newEntry;
  return newEntry;
};

/**
 * Notifies all hook subscribers registered to a specific query key of any state changes.
 */
const notifySubscribers = (serializedKey: string): void => {
  const entry = getOrCreateCacheEntry(serializedKey);
  entry.listeners.forEach((listenerCallback) => {
    listenerCallback();
  });
};

/**
 * Orchestrates the async fetching process, handling deduplication and cache updates.
 */
const fetchQuery = async <TData>(
  serializedKey: string,
  queryFn: () => Promise<TData>
): Promise<TData> => {
  const entry = getOrCreateCacheEntry(serializedKey);

  // If a request for this query is already in progress, return the existing promise (Deduplication)
  const isAlreadyFetching = entry.promise !== null;
  if (isAlreadyFetching) {
    const existingPromise = entry.promise;
    return existingPromise;
  }

  // Start fresh fetch
  const newPromise = queryFn();
  entry.promise = newPromise;
  entry.isFetching = true;
  notifySubscribers(serializedKey);

  try {
    const freshData = await newPromise;

    entry.data = freshData;
    entry.error = null;
    entry.status = "success";
    entry.updatedAt = Date.now();

    return freshData;
  } catch (caughtError: any) {
    entry.error = caughtError;
    entry.status = "error";

    throw caughtError;
  } finally {
    // Clean up promise reference once finished
    entry.promise = null;
    entry.isFetching = false;
    notifySubscribers(serializedKey);
  }
};

export interface UseQueryOptions {
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
}

/**
 * Custom React Hook that implements SWR (Stale-While-Revalidate) mechanism.
 */
export function useQuery<TData = any, TError = any>(
  queryKey: any,
  queryFn: () => Promise<TData>,
  options: UseQueryOptions = {}
) {
  const staleTime = options.staleTime ?? 0;
  const refetchOnWindowFocus = options.refetchOnWindowFocus ?? true;

  const serializedKey = serializeQueryKey(queryKey);

  // Capture current state of the global cache entry for local React hook state
  const getSnapshot = useCallback(() => {
    const entry = getOrCreateCacheEntry(serializedKey);
    const snapshot = {
      data: entry.data as TData | undefined,
      error: entry.error as TError | null,
      status: entry.status,
      isFetching: entry.isFetching,
    };
    return snapshot;
  }, [serializedKey]);

  const [state, setState] = useState(getSnapshot);

  // Keep a reference to the latest query function to prevent closure-related issues
  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;

  // Trigger background fetch if missing or data has become stale
  const triggerFetchIfNeeded = useCallback(async () => {
    const entry = getOrCreateCacheEntry(serializedKey);

    const isCacheMissing = entry.status === "pending" && entry.data === undefined;
    const currentTime = Date.now();
    const timePassedSinceUpdate = currentTime - entry.updatedAt;
    const isCacheStale = timePassedSinceUpdate > staleTime;

    const shouldFetch = isCacheMissing || isCacheStale;

    if (shouldFetch) {
      try {
        await fetchQuery(serializedKey, queryFnRef.current);
      } catch (err) {
        // Errors are stored in the state, so we gracefully catch the promise rejection here
      }
    }
  }, [serializedKey, staleTime]);

  // Subscribe to changes in the global query cache entry
  useEffect(() => {
    const entry = getOrCreateCacheEntry(serializedKey);

    const handleCacheUpdate = () => {
      const freshSnapshot = getSnapshot();
      setState(freshSnapshot);
    };

    entry.listeners.add(handleCacheUpdate);

    // Synchronize initial rendering snapshot
    handleCacheUpdate();

    // Trigger re-validation check on component mount
    triggerFetchIfNeeded();

    // Unsubscribe on component unmount or key change
    const unsubscribeCallback = () => {
      entry.listeners.delete(handleCacheUpdate);
    };
    return unsubscribeCallback;
  }, [serializedKey, getSnapshot, triggerFetchIfNeeded]);

  // Handle automatic re-validation when the user refocuses the browser window
  useEffect(() => {
    const handleWindowFocus = () => {
      const isWindowFocusRevalidationEnabled = refetchOnWindowFocus === true;
      if (isWindowFocusRevalidationEnabled) {
        triggerFetchIfNeeded();
      }
    };

    window.addEventListener("focus", handleWindowFocus);

    const cleanupWindowFocusListener = () => {
      window.removeEventListener("focus", handleWindowFocus);
    };
    return cleanupWindowFocusListener;
  }, [refetchOnWindowFocus, triggerFetchIfNeeded]);

  // Explicit refetch function for manual trigger
  const refetch = useCallback(async () => {
    try {
      await fetchQuery(serializedKey, queryFnRef.current);
    } catch (err) {
      // Handled via state, catch here to prevent console unhandled promise warnings
    }
  }, [serializedKey]);

  // Derive loading status: is true only on initial empty pending state
  const isPendingStatus = state.status === "pending";
  const hasNoData = state.data === undefined;
  const isLoading = isPendingStatus && hasNoData;

  return {
    data: state.data,
    error: state.error,
    status: state.status,
    isFetching: state.isFetching,
    isLoading,
    refetch,
  };
}