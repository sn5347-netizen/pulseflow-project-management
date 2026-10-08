import { z } from 'zod';

const normalizeProjectStatus = (val: unknown) => {
  if (typeof val !== 'string') return val;
  const clean = val.trim().toUpperCase().replace(/\s+/g, '_');
  if (clean === 'NOT_STARTED' || clean === 'IN_PROGRESS' || clean === 'COMPLETED') {
    return clean;
  }
  return val;
};

export const createProjectSchema = z.object({
  name: z
    .string({ required_error: 'Project name is required' })
    .min(1, 'Project name cannot be empty')
    .max(150, 'Project name cannot exceed 150 characters')
    .trim(),
  description: z.string().max(1000).optional().nullable(),
  status: z
    .preprocess(
      normalizeProjectStatus,
      z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'], {
        errorMap: () => ({ message: 'Status must be Not Started, In Progress, or Completed' }),
      })
    )
    .optional()
    .default('NOT_STARTED'),
  startDate: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid start date format',
    }),
  endDate: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid end date format',
    }),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(150).trim().optional(),
  description: z.string().max(1000).optional().nullable(),
  status: z
    .preprocess(
      normalizeProjectStatus,
      z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'], {
        errorMap: () => ({ message: 'Status must be Not Started, In Progress, or Completed' }),
      })
    )
    .optional(),
  startDate: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid start date format',
    }),
  endDate: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid end date format',
    }),
});

export const queryProjectSchema = z.object({
  search: z.string().optional(),
  status: z.preprocess(normalizeProjectStatus, z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']).optional()),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

