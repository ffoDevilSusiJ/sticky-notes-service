import { Op, WhereOptions } from 'sequelize';
import Note from '../models/Note.js';

export interface CreateNoteDTO {
  title: string;
  content: string;
  color?: string;
  positionX: number;
  positionY: number;
  userId: string;
  roomId: string;
}

export interface UpdateNoteDTO {
  title?: string;
  content?: string;
  color?: string;
  positionX?: number;
  positionY?: number;
}

export class NotesRepository {
  async create(data: CreateNoteDTO): Promise<Note> {
    return await Note.create({
      title: data.title,
      content: data.content,
      color: data.color || '#ffeb3b',
      positionX: data.positionX,
      positionY: data.positionY,
      userId: data.userId,
      roomId: data.roomId,
    });
  }

  async findById(noteId: string): Promise<Note | null> {
    return await Note.findByPk(noteId);
  }

  async findByRoom(roomId: string): Promise<Note[]> {
    return await Note.findAll({
      where: { roomId },
      order: [['createdAt', 'DESC']],
    });
  }

  async update(noteId: string, data: UpdateNoteDTO): Promise<Note | null> {
    const note = await this.findById(noteId);
    if (!note) {
      return null;
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.positionX !== undefined) updateData.positionX = data.positionX;
    if (data.positionY !== undefined) updateData.positionY = data.positionY;

    await note.update(updateData);
    return note;
  }

  async updatePosition(
    noteId: string,
    positionX: number,
    positionY: number
  ): Promise<Note | null> {
    const note = await this.findById(noteId);
    if (!note) {
      return null;
    }

    await note.update({
      positionX,
      positionY,
    });

    return note;
  }

  async delete(noteId: string): Promise<boolean> {
    const note = await this.findById(noteId);
    if (!note) {
      return false;
    }

    await note.destroy();
    return true;
  }

  async deleteByRoom(roomId: string): Promise<number> {
    const deletedCount = await Note.destroy({
      where: { roomId },
    });
    return deletedCount;
  }

  async deleteByRoomAndUser(roomId: string, userId: string): Promise<number> {
    const deletedCount = await Note.destroy({
      where: {
        roomId,
        userId,
      },
    });
    return deletedCount;
  }

  async exists(noteId: string): Promise<boolean> {
    const count = await Note.count({
      where: { id: noteId },
    });
    return count > 0;
  }

}

export default NotesRepository;
