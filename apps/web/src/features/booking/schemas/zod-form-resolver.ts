import type { FieldErrors, Resolver } from "react-hook-form";
import type { z } from "zod";

export function createZodFormResolver<TValues extends Record<string, unknown>>(
  schema: z.Schema<TValues>,
): Resolver<TValues> {
  return async (values) => {
    const parsed = schema.safeParse(values);

    if (parsed.success) {
      return {
        errors: {},
        values: parsed.data,
      };
    }

    const errors = parsed.error.issues.reduce<Record<string, unknown>>((accumulator, issue) => {
        const path = issue.path.join(".");

        if (path) {
          accumulator[path] = {
            message: issue.message,
            type: issue.code,
          };
        }

        return accumulator;
      }, {}) as FieldErrors<TValues>;

    return {
      errors,
      values: {},
    };
  };
}
