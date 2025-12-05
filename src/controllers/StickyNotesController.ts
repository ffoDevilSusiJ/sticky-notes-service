import { Request, Response } from 'express';
import { StickyNotesService } from '../services/StickyNotesService.js';

class StickyNotesController {
  private service: StickyNotesService | null = null;

  setService(service: StickyNotesService): void {
    this.service = service;
  }

  async getNotesByRoom(req: Request, res: Response): Promise<void> {
    try {
      if (!this.service) {
        res.status(500).json({
          success: false,
          message: 'StickyNotes service not initialized',
        });
        return;
      }

      const { roomId } = req.params;

      if (!roomId) {
        res.status(400).json({
          success: false,
          message: 'Room ID is required',
        });
        return;
      }

      const notes = await this.service.getNotesByRoom(roomId);

      res.json({
        success: true,
        data: notes,
        count: notes.length,
      });
    } catch (error) {
      console.error('Error fetching notes:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notes',
      });
    }
  }

  async createNote(req: Request, res: Response): Promise<void> {
    try {
      if (!this.service) {
        res.status(500).json({
          success: false,
          message: 'StickyNotes service not initialized',
        });
        return;
      }

      const { userId, roomId, title, content, color, position } = req.body;

      if (!userId || !roomId || !title || !content || !position) {
        res.status(400).json({
          success: false,
          message:
            'userId, roomId, title, content, and position are required',
        });
        return;
      }

      if (!position.x || !position.y) {
        res.status(400).json({
          success: false,
          message: 'Position must have x and y coordinates',
        });
        return;
      }

      const note = await this.service.createNoteViaAPI(userId, roomId, {
        title,
        content,
        color,
        position,
      });

      res.status(201).json({
        success: true,
        data: note,
        message: 'Note created and broadcast to room',
      });
    } catch (error) {
      console.error('Error creating note:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create note',
      });
    }
  }

  async getNoteById(req: Request, res: Response): Promise<void> {
    try {
      if (!this.service) {
        res.status(500).json({
          success: false,
          message: 'StickyNotes service not initialized',
        });
        return;
      }

      const { noteId } = req.params;

      const note = await this.service.getNoteById(noteId);

      if (!note) {
        res.status(404).json({
          success: false,
          message: 'Note not found',
        });
        return;
      }

      res.json({
        success: true,
        data: note,
      });
    } catch (error) {
      console.error('Error fetching note:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch note',
      });
    }
  }

  async updateNote(req: Request, res: Response): Promise<void> {
    try {
      if (!this.service) {
        res.status(500).json({
          success: false,
          message: 'StickyNotes service not initialized',
        });
        return;
      }

      const { noteId } = req.params;
      const { title, content, color } = req.body;

      const note = await this.service.updateNote(noteId, {
        title,
        content,
        color,
      });

      if (!note) {
        res.status(404).json({
          success: false,
          message: 'Note not found',
        });
        return;
      }

      res.json({
        success: true,
        data: note,
        message: 'Note updated successfully',
      });
    } catch (error) {
      console.error('Error updating note:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update note',
      });
    }
  }

  async deleteNote(req: Request, res: Response): Promise<void> {
    try {
      if (!this.service) {
        res.status(500).json({
          success: false,
          message: 'StickyNotes service not initialized',
        });
        return;
      }

      const { noteId } = req.params;

      const success = await this.service.deleteNote(noteId);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Note not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Note deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete note',
      });
    }
  }

  async moveNote(req: Request, res: Response): Promise<void> {
    try {
      if (!this.service) {
        res.status(500).json({
          success: false,
          message: 'StickyNotes service not initialized',
        });
        return;
      }

      const { noteId } = req.params;
      const { position } = req.body;

      if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
        res.status(400).json({
          success: false,
          message: 'Position with x and y coordinates is required',
        });
        return;
      }

      const note = await this.service.moveNote(noteId, position.x, position.y);

      if (!note) {
        res.status(404).json({
          success: false,
          message: 'Note not found',
        });
        return;
      }

      res.json({
        success: true,
        data: note,
        message: 'Note moved successfully',
      });
    } catch (error) {
      console.error('Error moving note:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to move note',
      });
    }
  }
}

export default new StickyNotesController();
