export async function waitForAll<T>(
  ...ps: (Promise<T> | Response)[]
): Promise<T[]> {
  const promises = ps.map((p) => (p instanceof Response ? p.json() : p));
  return Promise.all(promises);
}
