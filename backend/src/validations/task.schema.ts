import { z } from 'zod';

const normalizeTaskStatus = (val: unknown) => {
  if (typeof val !== 'string') return val;
  const clean = val.trim().toUpperCase().replace(/\s+/g, '_');
  if (clean === 'PENDING' || clean === 'IN_PROGRESS' || clean === 'COMPLETED') {
    return clean;
  }
  return val;
};

const normalizeTaskPriority = (val: unknown) => {
  if (typeof val !== 'string') return val;
  const clean = val.trim().toUpperCase();
  if (clean === 'LOW' || clean === 'MEDIUM' || clean === 'HIGH') {
    return clean;
  }
  return val;
};

export const createTaskSchema = z.object({
  name: z
    .string({ required_error: 'Task name is required' })
    .min(1, 'Task name cannot be empty')
    .max(200, 'Task name cannot exceed 200 characters')
    .trim(),
  description: z.string().max(2000).optional().nullable(),
  priority: z
    .preprocess(
      normalizeTaskPriority,
      z.enum(['LOW', 'MEDIUM', 'HIGH'], {
        errorMap: () => ({ message: 'Priority must be Low, Medium, or High' }),
      })
    )
    .optional()
    .default('MEDIUM'),
  status: z
    .preprocess(
      normalizeTaskStatus,
      z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED'], {
        errorMap: () => ({ message: 'Status must be Pending, In Progress, or Completed' }),
      })
    )
    .optional()
    .default('PENDING'),
  dueDate: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid due date format',
    }),
  projectId: z.string({ required_error: 'Project ID is required' }).min(1, 'Project ID cannot be empty'),
});

export const updateTaskSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(2000).optional().nullable(),
  priority: z
    .preprocess(
      normalizeTaskPriority,
      z.enum(['LOW', 'MEDIUM', 'HIGH'], {
        errorMap: () => ({ message: 'Priority must be Low, Medium, or High' }),
      })
    )
    .optional(),
  status: z
    .preprocess(
      normalizeTaskStatus,
      z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED'], {
        errorMap: () => ({ message: 'Status must be Pending, In Progress, or Completed' }),
      })
    )
    .optional(),
  dueDate: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid due date format',
    }),
  projectId: z.string().optional(),
});

export const queryTaskSchema = z.object({
  projectId: z.string().optional(),
  search: z.string().optional(),
  status: z.preprocess(normalizeTaskStatus, z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional()),
  priority: z.preprocess(normalizeTaskPriority, z.enum(['LOW', 'MEDIUM', 'HIGH']).optional()),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

