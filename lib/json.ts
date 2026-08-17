export type JsonSafe<T> = T extends bigint
  ? string
  : T extends Date
    ? string
    : T extends undefined
      ? undefined
      : T extends null | string | number | boolean
        ? T
        : T extends readonly (infer U)[]
          ? JsonSafe<U>[]
          : T extends object
            ? { [K in keyof T]: JsonSafe<T[K]> }
            : never;

/** Converts Prisma results to values accepted by JSON.stringify/Response.json. */
export function serializeForJson<T>(data: T): JsonSafe<T> {
  return JSON.parse(
    JSON.stringify(data, (_key, value: unknown) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
  ) as JsonSafe<T>;
}

export function jsonResponse<T>(data: T, init?: ResponseInit) {
  return Response.json(serializeForJson(data), init);
}
