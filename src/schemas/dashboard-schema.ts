import { z } from "zod";

export const DashboardFiltersSchema = z.object({
  userId: z.string().min(1),
  semester: z.string().optional(),
  filterCurriculum: z.string().optional(),
});
