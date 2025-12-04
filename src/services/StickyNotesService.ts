import {
  EventProcessor,
  IEventContext,
  IBroadcastEvent,
} from 'krafter-socket-lib';
import { getEventProcessor } from '../sockets/eventProcessor.js';

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

const notesStore = new Map<string, StickyNote>();

export class StickyNotesService {
  private processor: EventProcessor;

  constructor() {
    this.processor = getEventProcessor();
    this.registerEventHandlers();
  }

  private registerEventHandlers(): void {
    this.processor.registerEventHandler(
      'note:create',
      this.handleNoteCreate.bind(this)
    );

    this.processor.registerEventHandler(
      'note:update',
      this.handleNoteUpdate.bind(this)
    );

    this.processor.registerEventHandler(
      'note:delete',
      this.handleNoteDelete.bind(this)
    );

    this.processor.registerEventHandler(
      'note:move',
      this.handleNoteMove.bind(this)
    );

    console.log('✓ StickyNotes event handlers registered');
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

    const note: StickyNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: payload.title,
      content: payload.content,
      color: payload.color || '#ffeb3b',
      position: payload.position,
      userId: context.userId,
      roomId: context.roomId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    notesStore.set(note.id, note);

    return {
      type: 'note:created',
      recipients: [],
      payload: note,
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

    const note = notesStore.get(payload.noteId);
    if (!note) {
      return {
        type: 'error',
        recipients: [context.socketId],
        payload: { code: 'NOTE_NOT_FOUND', message: 'Note not found' },
      };
    }

    if (note.userId !== context.userId) {
      return {
        type: 'error',
        recipients: [context.socketId],
        payload: {
          code: 'ACCESS_DENIED',
          message: 'You can only edit your own notes',
        },
      };
    }

    if (payload.title !== undefined) note.title = payload.title;
    if (payload.content !== undefined) note.content = payload.content;
    if (payload.color !== undefined) note.color = payload.color;
    note.updatedAt = Date.now();

    notesStore.set(note.id, note);

    return {
      type: 'note:updated',
      recipients: [],
      payload: note,
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

    const note = notesStore.get(payload.noteId);
    if (!note) {
      return {
        type: 'error',
        recipients: [context.socketId],
        payload: { code: 'NOTE_NOT_FOUND', message: 'Note not found' },
      };
    }

    if (note.userId !== context.userId) {
      return {
        type: 'error',
        recipients: [context.socketId],
        payload: {
          code: 'ACCESS_DENIED',
          message: 'You can only delete your own notes',
        },
      };
    }

    notesStore.delete(payload.noteId);

    return {
      type: 'note:deleted',
      recipients: [],
      payload: { noteId: payload.noteId },
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

    const note = notesStore.get(payload.noteId);
    if (!note) return null;

    note.position = payload.position;
    note.updatedAt = Date.now();

    return {
      type: 'note:moved',
      recipients: [],
      payload: {
        noteId: note.id,
        position: note.position,
        userId: context.userId,
      },
    };
  }

  public async getNotesByRoom(roomId: string): Promise<StickyNote[]> {
    const notes: StickyNote[] = [];
    notesStore.forEach((note) => {
      if (note.roomId === roomId) {
        notes.push(note);
      }
    });
    return notes;
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
    const note: StickyNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: data.title,
      content: data.content,
      color: data.color || '#ffeb3b',
      position: data.position,
      userId,
      roomId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    notesStore.set(note.id, note);

    await this.processor.broadcastToRoom(roomId, 'note:created', note);

    return note;
  }
}
