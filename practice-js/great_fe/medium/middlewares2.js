function middlewares(...fns) {
  return async (ctx) => {
    let i = 0;

    const next = async () => {
      const fn = fns[i];
      i++;
      if (typeof fn !== "function") return;

      await fn(ctx, next);
    };

    await next();
  };
}
