export function isError(x: unknown): x is Error {
  return (x as Error).message !== undefined;
}
