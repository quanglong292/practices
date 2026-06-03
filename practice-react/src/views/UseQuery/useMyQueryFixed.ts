import { useEffect, useState, useRef, type DependencyList } from "react";


export default function useQuery(fn, deps = []) {
    const [state, setState] = useState({
        status: "loading",
    });

    // Keep a reference to the latest fn to avoid closure-related stale bugs
    const latestFnRef = useRef(fn);
    latestFnRef.current = fn;

    useEffect(() => {
        // Transition status to loading when dependencies change
        setState({ status: "loading" });

        // Track active request to prevent out-of-order race conditions
        let isRequestCancelled = false;

        const executePromise = async () => {
            try {
                const resolvedData = await latestFnRef.current();

                const shouldUpdateState = isRequestCancelled === false;
                if (shouldUpdateState) {
                    setState({
                        status: "success",
                        data: resolvedData,
                    });
                }
            } catch (caughtError: any) {
                const shouldUpdateState = isRequestCancelled === false;
                if (shouldUpdateState) {
                    setState({
                        status: "error",
                        error: caughtError,
                    });
                }
            }
        };

        executePromise();

        // Cancel old pending resolution if component unmounts or dependencies change
        const cleanupPreviousRequest = () => {
            isRequestCancelled = true;
        };
        return cleanupPreviousRequest;
    }, deps);

    return state;
}