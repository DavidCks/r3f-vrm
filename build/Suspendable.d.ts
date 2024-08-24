import React from "react";
interface SuspendableProps<T> {
    promise: Promise<T>;
    children: (data: T) => React.ReactElement;
}
export declare const Suspendable: <T>({ promise, children }: SuspendableProps<T>) => React.ReactElement<any, string | React.JSXElementConstructor<any>> | null;
export {};
//# sourceMappingURL=Suspendable.d.ts.map