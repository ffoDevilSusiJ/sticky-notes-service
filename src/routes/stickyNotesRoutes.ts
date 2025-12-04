import { Router } from 'express';
import StickyNotesController from '../controllers/StickyNotesController.js';

const router = Router();

router.get('/:roomId', StickyNotesController.getNotesByRoom.bind(StickyNotesController));

router.post('/', StickyNotesController.createNote.bind(StickyNotesController));

export default router;
