import { z } from "zod";

export const commandeSchema = z.object({
  client_id: z.number().int().positive(),
});
