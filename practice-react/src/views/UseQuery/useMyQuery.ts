import { useEffect, useRef, useState, type DependencyList } from 'react'

type Query = () => Promise<any>

type QueryState = {
    status: 'loading' | 'success' | 'error'
    data?: any
    error?: any
}

const useMyQuery = (fn: Query, deps: DependencyList) => {
    const [state, setState] = useState<QueryState>({
        status: 'loading'
    })

    const latestFnRef = useRef(fn);
    latestFnRef.current = fn;


    useEffect(() => {
        setState({
            status: 'loading'
        })
        let shouldCancelRequest = false

        const fetch = async () => {
            try {
                const res = await latestFnRef.current();

                if (shouldCancelRequest) return

                setState({
                    status: 'success',
                    data: res
                })

            } catch (error) {
                if (shouldCancelRequest) return;

                setState({
                    status: 'error',
                    error: error
                })
            }
        }

        fetch()

        return () => {
            shouldCancelRequest = true
        }
    }, deps)

    return state
}

export default useMyQuery