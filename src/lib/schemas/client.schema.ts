import { z } from "zod";

export const clientSchema = z.object({
  nom: z.string().min(1),
  reference: z.string().min(1),
});
