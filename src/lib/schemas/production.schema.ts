import { z } from "zod";

export const productionSchema = z.object({
  numero: z.string().optional(),
});
