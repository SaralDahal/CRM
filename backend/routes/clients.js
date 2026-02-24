import { Router } from 'express';
const router = Router();
import { getClients, getClient, createClient, updateClient, deleteClient } from '../controllers/clientController';
import { protect, authorize } from '../middleware/auth';

router.route('/')
    .get(protect, authorize('admin'), getClients)
    .post(protect, authorize('admin'), createClient);

router.route('/:id')
    .get(protect, authorize('admin'), getClient)
    .put(protect, authorize('admin'), updateClient)
    .delete(protect, authorize('admin'), deleteClient);

export default router;