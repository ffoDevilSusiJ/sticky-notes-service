import {
  EventProcessor,
  IEventContext,
  IBroadcastEvent,
} from '../lib/index.js';
import { getEventProcessor } from '../sockets/eventProcessor.js';
import NotesRepository from '../repositories/NotesRepository.js';

export interface StickyNote {
  id: string;
  title: string;
  content: string;
  color: string;
  position: { x: number; y: number };
  userId: string;
  roomId: string;
  createdAt: number;
  updatedAt: number;
}

export class StickyNotesService {
  private processor: EventProcessor;
  private notesRepository: NotesRepository;

  constructor() {
    this.processor = getEventProcessor();
    this.notesRepository = new NotesRepository();
    this.registerEventHandlers();
  }

  // Помимо Event Processor обработки, здесь реализовано API для управления данными заметок
  private registerEventHandlers(): void {
    this.processor.registerEventHandler(
      'stickyNotes:note:create',
      this.handleNoteCreate.bind(this)
    );

    this.processor.registerEventHandler(
      'stickyNotes:note:update',
      this.handleNoteUpdate.bind(this)
    );

    this.processor.registerEventHandler(
      'stickyNotes:note:delete',
      this.handleNoteDelete.bind(this)
    );

    this.processor.registerEventHandler(
      'stickyNotes:note:move',
      this.handleNoteMove.bind(this)
    );
  }

  private async handleNoteCreate(
    context: IEventContext
  ): Promise<IBroadcastEvent | null> {
    if (!context.roomId) {
      return {
        type: 'error',
        recipients: [context.socketId],
        payload: { code: 'NO_ROOM', message: 'Room ID required' },
      };
    }

    const payload = context.event.payload as {
      title: string;
      content: string;
      color: string;
      position: { x: number; y: number };
    };

    const note = await this.notesRepository.create({
      title: payload.title,
      content: payload.content,
      color: payload.color || '#ffeb3b',
      positionX: payload.position.x,
      positionY: payload.position.y,
      userId: context.userId,
      roomId: context.roomId,
    });

    return {
      type: 'stickyNotes:note:created',
      recipients: [],
      payload: note.toClientJSON(),
    };
  }

  private async handleNoteUpdate(
    context: IEventContext
  ): Promise<IBroadcastEvent | null> {
    if (!context.roomId) {
      return {
        type: 'error',
        recipients: [context.socketId],
        payload: { code: 'NO_ROOM', message: 'Room ID required' },
      };
    }

    const payload = context.event.payload as {
      noteId: string;
      title?: string;
      content?: string;
      color?: string;
    };

    const note = await this.notesRepository.findById(payload.noteId);
    if (!note) {
      return {
        type: 'error',
        recipients: [context.socketId],
        payload: { code: 'NOTE_NOT_FOUND', message: 'Note not found' },
      };
    }

    const updatedNote = await this.notesRepository.update(payload.noteId, {
      title: payload.title,
      content: payload.content,
      color: payload.color,
    });

    return {
      type: 'stickyNotes:note:updated',
      recipients: [],
      payload: updatedNote!.toClientJSON(),
    };
  }

  private async handleNoteDelete(
    context: IEventContext
  ): Promise<IBroadcastEvent | null> {
    if (!context.roomId) {
      return {
        type: 'error',
        recipients: [context.socketId],
        payload: { code: 'NO_ROOM', message: 'Room ID required' },
      };
    }

    const payload = context.event.payload as { noteId: string };

    const note = await this.notesRepository.findById(payload.noteId);
    if (!note) {
      return {
        type: 'error',
        recipients: [context.socketId],
        payload: { code: 'NOTE_NOT_FOUND', message: 'Note not found' },
      };
    }

    await this.notesRepository.delete(payload.noteId);

    return {
      type: 'stickyNotes:note:deleted',
      recipients: [],
      payload: {
        noteId: payload.noteId,
        roomId: context.roomId,
      },
    };
  }

  private async handleNoteMove(
    context: IEventContext
  ): Promise<IBroadcastEvent | null> {
    if (!context.roomId) return null;

    const payload = context.event.payload as {
      noteId: string;
      position: { x: number; y: number };
    };

    const note = await this.notesRepository.updatePosition(
      payload.noteId,
      payload.position.x,
      payload.position.y
    );
    if (!note) return null;

    return {
      type: 'stickyNotes:note:moved',
      recipients: [],
      payload: {
        noteId: note.id,
        position: { x: note.positionX, y: note.positionY },
        userId: context.userId,
        roomId: context.roomId,
      },
    };
  }

  public async getNotesByRoom(roomId: string): Promise<StickyNote[]> {
    const notes = await this.notesRepository.findByRoom(roomId);
    return notes.map((note) => note.toClientJSON());
  }

  public async getNoteById(noteId: string): Promise<StickyNote | null> {
    const note = await this.notesRepository.findById(noteId);
    return note ? note.toClientJSON() : null;
  }

  public async updateNote(
    noteId: string,
    data: {
      title?: string;
      content?: string;
      color?: string;
    }
  ): Promise<StickyNote | null> {
    const note = await this.notesRepository.update(noteId, data);

    if (note) {
      await this.processor.broadcast({
        type: 'stickyNotes:note:updated',
        recipients: [],
        payload: note.toClientJSON(),
      });
    }

    return note ? note.toClientJSON() : null;
  }

  public async deleteNote(noteId: string): Promise<boolean> {
    const note = await this.notesRepository.findById(noteId);

    if (!note) {
      return false;
    }

    await this.notesRepository.delete(noteId);

    await this.processor.broadcast({
      type: 'stickyNotes:note:deleted',
      recipients: [],
      payload: {
        noteId: noteId,
        roomId: note.roomId,
      },
    });

    return true;
  }

  public async moveNote(noteId: string, x: number, y: number): Promise<StickyNote | null> {
    const note = await this.notesRepository.updatePosition(noteId, x, y);

    if (note) {
      await this.processor.broadcast({
        type: 'stickyNotes:note:moved',
        recipients: [],
        payload: {
          noteId: note.id,
          position: { x: note.positionX, y: note.positionY },
          roomId: note.roomId,
        },
      });
    }

    return note ? note.toClientJSON() : null;
  }

  public async createNoteViaAPI(
    userId: string,
    roomId: string,
    data: {
      title: string;
      content: string;
      color?: string;
      position: { x: number; y: number };
    }
  ): Promise<StickyNote> {
    const note = await this.notesRepository.create({
      title: data.title,
      content: data.content,
      color: data.color || '#ffeb3b',
      positionX: data.position.x,
      positionY: data.position.y,
      userId,
      roomId,
    });

    const noteObj = note.toClientJSON();

    await this.processor.broadcast({
      type: 'stickyNotes:note:created',
      recipients: [],
      payload: noteObj,
    });

    return noteObj;
  }
}
