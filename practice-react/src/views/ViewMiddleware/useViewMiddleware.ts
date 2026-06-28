// Implement a middlewares function that takes any number of middleware functions and composes them into a single callable function. This composed function accepts a context, returns a Promise, and calls each middleware in order.

// Each middleware is a function that receives two arguments:

// context: An object shared across all middlewares
// next: A function that invokes the next middleware in the chain
// When next() is called, the next middleware should run. If a middleware does not call next, the chain stops.

// The execution should be asynchronous and sequential, similar to how middleware works in frameworks like Koa.

// Examples

// async function fn1(ctx, next) {
//   ctx.stack.push('fn1-start');
//   await next();
//   ctx.stack.push('fn1-end');
// }

// async function fn2(ctx, next) {
//   ctx.stack.push('fn2-start');
//   await new Promise((resolve) => setTimeout(resolve, 1000));
//   await next();
//   ctx.stack.push('fn2-end');
// }

// function fn3(ctx, next) {
//   ctx.stack.push('fn3-start');
//   next();
//   ctx.stack.push('fn3-end');
// }

// const composedFn = middlewares(fn1, fn2, fn3);

// const context = { stack: [] };
// await composedFn(context);

// console.log(context.stack);
// // ['fn1-start', 'fn2-start', 'fn3-start', 'fn3-end', 'fn2-end', 'fn1-end']

type Fn = (ctx: any, next: () => Promise<any>) => Promise<any>;

const middlewares = (...args: Fn[]) => {
    const fns = args;

    return function compose(context: any) {
        let lastCalledIndex = -1;

        async function dispatch(targetIndex: number): Promise<any> {
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