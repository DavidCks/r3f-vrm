/**
 * Pick an item from the given array by probability evaluation functions.
 */
export declare function pickByProbability<T>(array: T[], evaluators: {
    func: (value: T) => number;
    weight: number;
}[]): T | null;
//# sourceMappingURL=pickByProbability.d.ts.map