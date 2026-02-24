import { Router } from 'express';
const router = Router();
import { getTasks, getTask, getTasksByProject, createTask, updateTask, deleteTask } from '../controllers/taskController.js';
import { protect, authorize } from '../middleware/auth';

router.route('/')
    .get(protect, getTasks)
    .post(protect, authorize('admin'), createTask);

router.get('/project/:projectId', protect, getTasksByProject);

router.route('/:id')
    .get(protect, getTask)
    .put(protect, updateTask)
    .delete(protect, authorize('admin'), deleteTask);

export default router;