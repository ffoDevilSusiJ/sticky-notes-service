import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface NoteAttributes {
  id: string;
  title: string;
  content: string;
  color: string;
  positionX: number;
  positionY: number;
  userId: string;
  roomId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface NoteCreationAttributes extends Optional<NoteAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Note extends Model<NoteAttributes, NoteCreationAttributes> implements NoteAttributes {
  declare id: string;
  declare title: string;
  declare content: string;
  declare color: string;
  declare positionX: number;
  declare positionY: number;
  declare userId: string;
  declare roomId: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  public toClientJSON() {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      color: this.color,
      position: {
        x: this.positionX,
        y: this.positionY,
      },
      userId: this.userId,
      roomId: this.roomId,
      createdAt: this.createdAt.getTime(),
      updatedAt: this.updatedAt.getTime(),
    };
  }
}

Note.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '#ffeb3b',
    },
    positionX: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      field: 'position_x',
    },
    positionY: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      field: 'position_y',
    },
    userId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'user_id',
    },
    roomId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'room_id',
    },
  },
  {
    sequelize,
    tableName: 'notes',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_notes_room_id',
        fields: ['room_id'],
      },
      {
        name: 'idx_notes_user_id',
        fields: ['user_id'],
      },
      {
        name: 'idx_notes_room_user',
        fields: ['room_id', 'user_id'],
      },
    ],
  }
);

export default Note;
