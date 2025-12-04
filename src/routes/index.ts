import { Router } from 'express';
import stickyNotesRoutes from './stickyNotesRoutes.js';

const router = Router();

router.use('/notes', stickyNotesRoutes);

export default router;
