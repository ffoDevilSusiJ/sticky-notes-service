# KRAFTEK TZ - Sticky Notes Service

Cервис обработки "Sticky Notes".

Реализован через Event-Driven паттерн, в основном использует 

`kraftek-socket-backend-lib` используется как основная библиотека для реализации Event-Drive паттерна.


## Схема

Общая диаграма последовательностей описана в `diagrams/sequenceSocketArch.mermaid`

### Диаграмма последовательностей: Передвижение заметки

Процесс передвижения заметки двумя пользователями в canvas (подробная версия в `diagrams/noteMovementSequence.mermaid`).

**Примечание:** Диаграмма подключения/отключения находится в `kraftek-socket-gateway/connectionSequence.mermaid`


## Структура проекта

API реализовано по методологии REST с применением MVC

Контроллеры `src\controllers`
Модели      `src\models`
Сервисы     `src\services`

## Project Structure

```
.
├── src/
│   ├── config/          # Конфиги
│   │   └── database.ts
│   ├── models/          # Модели
│   │   └── index.ts
│   ├── controllers/     # Контроллеры
│   │   └── UserController.ts
│   ├── routes/          # Маршрутизация
│   │   ├── userRoutes.ts
│   │   └── index.ts
│   ├── middleware/      # Middleware
│   │   └── errorHandler.ts
│   ├── sockets/         # Event Processor
│   │   └── eventProcessor.ts
│   ├── services/        # Сервисы
│   │   └── StickyNotesService.ts
│   ├── app.ts
│   └── server.ts
├── docker-compose.yml
├── .env
└── package.json

```


