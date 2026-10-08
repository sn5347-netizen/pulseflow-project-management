import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/project.controller';
import { authenticate } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createProjectSchema,
  updateProjectSchema,
  queryProjectSchema,
} from '../validations/project.schema';

const router = Router();

// All project routes require authentication
router.use(authenticate);

router.get('/', validateQuery(queryProjectSchema), getProjects);
router.get('/:id', getProjectById);
router.post('/', validateBody(createProjectSchema), createProject);
router.put('/:id', validateBody(updateProjectSchema), updateProject);
router.delete('/:id', deleteProject);

export default router;

