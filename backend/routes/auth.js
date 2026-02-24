import { Router } from 'express';
const router = Router();
import { register, login, getMe } from '../controllers/authController';
import { protect } from '../middleware/auth';

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;