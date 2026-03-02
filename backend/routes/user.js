import { Router } from 'express';
const router = Router();
import { getUsers, getEmployees, getUser, updateUser, deleteUser } from '../controller/userController.js';
import { protect, authorize } from '../middleware/auth.js';

router.get('/', protect, authorize('admin'), getUsers);
router.get('/employees', protect, authorize('admin'), getEmployees);

router.route('/:id')
    .get(protect, authorize('admin'), getUser)
    .put(protect, authorize('admin'), updateUser)
    .delete(protect, authorize('admin'), deleteUser);

export default router;