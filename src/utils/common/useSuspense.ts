const suspenseCache = new Map();

function useSuspense<T>(promise: Promise<T>) {
  // Check if the promise is already in the cache
  if (!suspenseCache.has(promise)) {
    const suspender = promise.then(
      (res) => {
        suspenseCache.set(promise, { status: "success", response: res });
      },
      (err) => {
        suspenseCache.set(promise, { status: "error", response: err });
      }
    );
    suspenseCache.set(promise, { status: "pending", suspender });
  }

  const state = suspenseCache.get(promise);

  const handler = {
    pending: () => {
      throw state.suspender;
    },
    error: () => {
      throw state.response;
    },
    success: () => state.response,
  } as const;

  const read = () => {
    if (state.status === "pending") {
      handler.pending();
    } else if (state.status === "error") {
      handler.error();
    } else if (state.status === "success") {
      return handler.success();
    }
  };

  return { read };
}

export default useSuspense;
