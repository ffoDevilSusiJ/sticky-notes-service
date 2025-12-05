# Sticky Notes Service

Микросервис для работы с заметками на виртуальной доске с WebSocket синхронизацией.

## Требования

Для работы с real-time событиями требуется запустить `kraftek-socket-gateway`</br>
Без него сервис работает как REST api сервис для notes

- **Gateway**: [kraftek-socket-gateway](https://github.com/ffoDevilSusiJ/kraftek-socket-gateway)
- Node.js 20+
- PostgreSQL 16
- Redis 7

## Быстрый старт (Docker)

```bash
# 1. Клонировать репозитории
git clone https://github.com/ffoDevilSusiJ/kraftek-socket-gateway
git clone https://github.com/ffoDevilSusiJ/sticky-notes-service

# 2. Запустить gateway (для работы realtime событий)
cd kraftek-socket-gateway
docker-compose up -d

# 3. Запустить sticky-notes-service
cd ../sticky-notes-service
docker-compose up -d
```

Сервис доступен: http://localhost:3000

## Локальный запуск

```bash
# 1. Установить зависимости
npm install

# 2. Настроить .env
cp .env.example .env

# 3. Запустить PostgreSQL и Redis

# 4. Запустить в dev режиме
npm run dev
```

## API Endpoints

- `GET /api/notes/room/:roomId` - Получить все заметки комнаты
- `GET /api/notes/:noteId` - Получить заметку по ID
- `POST /api/notes` - Создать заметку
- `PUT /api/notes/:noteId` - Обновить заметку
- `DELETE /api/notes/:noteId` - Удалить заметку
- `PATCH /api/notes/:noteId/move` - Переместить заметку

## WebSocket Events

- `stickyNotes:note:create` - Создать заметку
- `stickyNotes:note:update` - Обновить заметку
- `stickyNotes:note:delete` - Удалить заметку
- `stickyNotes:note:move` - Переместить заметку

## Демо

Откройте `demo/board.html` в браузере для интерактивной доски с заметками.

## Тестирование API

Импортируйте `sticky-notes-insomnia-collection.json` в Insomnia/Postman.

## Диаграммы

- [Архитектура Socket.IO](./diagrams/sequenceSocketArch.mermaid) - Общая диаграмма последовательности работы с WebSocket
- [Перемещение заметки](./diagrams/noteMovementSequence.mermaid) - Подробная диаграмма процесса передвижения заметки
