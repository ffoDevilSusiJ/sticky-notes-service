import { Router } from 'express';
import StickyNotesController from '../controllers/StickyNotesController.js';

const router = Router();

router.get('/room/:roomId', StickyNotesController.getNotesByRoom.bind(StickyNotesController));
router.get('/:noteId', StickyNotesController.getNoteById.bind(StickyNotesController));
router.post('/', StickyNotesController.createNote.bind(StickyNotesController));
router.put('/:noteId', StickyNotesController.updateNote.bind(StickyNotesController));
router.delete('/:noteId', StickyNotesController.deleteNote.bind(StickyNotesController));
router.patch('/:noteId/move', StickyNotesController.moveNote.bind(StickyNotesController));

export default router;
