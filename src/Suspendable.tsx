import React, { ReactNode, Suspense, useEffect, useState } from "react";
import useSuspense from "./utils/common/useSuspense";

interface SuspendableProps<T> {
  promise: Promise<T>;
  children: (data: T) => React.ReactElement;
}

export const Suspendable = <T,>({ promise, children }: SuspendableProps<T>) => {
  const result = useSuspense(promise).read();
  if (!result) return null;
  const [component, setComponent] = useState<React.ReactElement | null>(null);
  useEffect(() => {
    if (!component) {
      setComponent(children(result));
    }
  }, []);
  return component;
};
