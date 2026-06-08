function middlewares(...fns) {
    return function compose(context) {
        let lastCalledIndex = -1;

        async function dispatch(targetIndex) {
            const isNextCalledMultipleTimes = targetIndex <= lastCalledIndex;
            if (isNextCalledMultipleTimes) {
                throw new Error('next() called multiple times');
            }
            
            lastCalledIndex = targetIndex;

            const currentMiddleware = fns[targetIndex];
            const isLastMiddleware = typeof currentMiddleware !== 'function';
            if (isLastMiddleware) {
                return;
            }

            const next = async () => {
                const nextIndex = targetIndex + 1;
                return await dispatch(nextIndex);
            };

            const result = await currentMiddleware(context, next);
            return result;
        }

        const startIndex = 0;
        return dispatch(startIndex);
    };
}

// middlewares › can be called multiple times
// expect(received).toEqual(expected) // deep equality

// test('can be called multiple times', async () => {
//     let count = 0;

//     async function f1(ctx: any, next: Function) {
//       count++;
//       ctx.push('f1-start');
//       await next();
//       ctx.push('f1-end');
//     }

//     async function f2(ctx: any, next: Function) {
//       count++;
//       ctx.push('f2-start');
//       await next();
//       ctx.push('f2-end');
//     }

//     function f3(ctx: any, next: Function) {
//       count++;
//       ctx.push('f3-start');
//       next();
//       ctx.push('f3-end');
//     }

//     const fn = middlewares(f1, f2, f3);

//     const context1: string[] = [];
//     const context2: string[] = [];

//     await Promise.all([fn(context1), fn(context2)]);

//     expect(context1).toEqual([
//       'f1-start',
//       'f2-start',
//       'f3-start',
//       'f3-end',
//       'f2-end',
//       'f1-end',
//     ]);
//     expect(context2).toEqual([
//       'f1-start',
//       'f2-start',
//       'f3-start',
//       'f3-end',
//       'f2-end',
//       'f1-end',
//     ]);
//     expect(count).toBe(6);
//   });