import { Router } from 'express';
const router = Router();
import { getProjects, getProject, createProject, updateProject, deleteProject } from '../controllers/projectController';
import { protect, authorize } from '../middleware/auth';

router.route('/')
    .get(protect, getProjects)
    .post(protect, authorize('admin'), createProject);

router.route('/:id')
    .get(protect, getProject)
    .put(protect, authorize('admin'), updateProject)
    .delete(protect, authorize('admin'), deleteProject);

export default router;