export async function up({ context: queryInterface }) {
  await queryInterface.bulkInsert('notes', [
    {
      id: 'a9026297-842f-40bd-b2da-3e2a5ad7bf30',
      title: 'Заметка из миграции',
      content: 'Содержимое заметки из миграции',
      color: '#ffeb3b',
      position_x: 570,
      position_y: 111,
      user_id: 'user_test-token',
      room_id: 'room-1',
      created_at: new Date('2025-01-05T00:00:00.000Z'),
      updated_at: new Date('2025-01-05T00:00:00.000Z'),
    },
  ]);
}

export async function down({ context: queryInterface }) {
  await queryInterface.bulkDelete('notes', {
    id: 'a9026297-842f-40bd-b2da-3e2a5ad7bf30',
  });
}
