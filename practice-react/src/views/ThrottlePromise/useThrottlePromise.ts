export type Fn = () => Promise<any>;

/**
 * Your original implementation containing bugs.
 * We keep this exactly as you wrote it so we can run it in the visualizer 
 * and show the asynchronous race conditions and off-by-one errors visually!
 */
export const throttlePromiseBuggy = async (fns: Fn[], limit: number): Promise<any[]> => {
    let currentIndex = 0;
    let results: any[] = [];

    const handler = async () => {
        if (currentIndex === fns.length) return;

        const fn = fns[currentIndex];

        await fn().then((resolved) => {
            results[currentIndex] = resolved
            currentIndex++
            handler()
        }).catch((rejected) => {
            results[currentIndex] = rejected
            currentIndex++
            handler()
        })
    }

    for (let i = 0; i < limit; i++) {
        handler()
    }

    return results;
}

/**
 * Correct, simple, and highly semantic worker-pool implementation.
 * It resolves all 4 bugs: returns correctly, preserves exact indices,
 * executes all tasks, and runs with no duplicate indices.
 */
export const throttlePromiseFixed = async (fns: Fn[], limit: number): Promise<any[]> => {
    const results: any[] = new Array(fns.length);
    let nextIndex = 0;
    let completedCount = 0;

    return new Promise((resolve) => {
        if (fns.length === 0) {
            resolve([]);
            return;
        }

        const worker = async () => {
            while (nextIndex < fns.length) {
                // Synchronously capture and increment index to prevent race conditions
                const currentIndex = nextIndex;
                nextIndex++;

                const fn = fns[currentIndex];

                try {
                    const resolved = await fn();
                    results[currentIndex] = resolved;
                } catch (rejected) {
                    results[currentIndex] = rejected;
                } finally {
                    completedCount++;
                    if (completedCount === fns.length) {
                        resolve(results);
                    }
                }
            }
        };

        // Run initial batch of workers
        const initialLimit = Math.min(limit, fns.length);
        for (let i = 0; i < initialLimit; i++) {
            worker();
        }
    });
}


const throttlePromiseSelfFixed = (fns: Fn[], limit: number): Promise<any[]> => {
    return new Promise((resolve) => {
        if (fns.length === 0) {
            resolve([]);
            return;
        }

        let nextIndex = 0;
        let completedCount = 0;
        let results: any[] = [];

        const handler = async () => {
            while (nextIndex <= fns.length) {
                const currentIndex = nextIndex;
                nextIndex++;
                const fn = fns[currentIndex];

                try {
                    const result = await fn()
                    results[currentIndex] = result
                } catch (error) {
                    results[currentIndex] = error
                } finally {
                    completedCount++
                    if (completedCount === fns.length) resolve(results)
                }
            }
        }

        const initialLimit = Math.min(limit, fns.length);
        for (let i = 0; i < initialLimit; i++) {
            handler()
        }


        // 
    })
}