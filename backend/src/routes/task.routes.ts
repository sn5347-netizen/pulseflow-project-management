import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createTaskSchema,
  updateTaskSchema,
  queryTaskSchema,
} from '../validations/task.schema';

const router = Router();

// All task routes require authentication
router.use(authenticate);

router.get('/', validateQuery(queryTaskSchema), getTasks);
router.get('/:id', getTaskById);
router.post('/', validateBody(createTaskSchema), createTask);
router.put('/:id', validateBody(updateTaskSchema), updateTask);
router.delete('/:id', deleteTask);

export default router;

