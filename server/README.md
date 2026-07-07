# File Manager — Server

REST API облачного файлового менеджера на **Node.js / Express / MongoDB**. Отвечает за аутентификацию по JWT (access + refresh), хранение и отдачу файлов через `multer`, упаковку выбранных файлов и папок в ZIP-архив на лету, а также рекурсивные операции move/copy/delete над деревом папок.

Клиентская часть — в [`../client`](../client).

## Стек

- **Node.js** + **Express 4**
- **MongoDB** + **Mongoose 7** — модели `User`, `Token`, `File`, `Folder`, `FilesStore`, `Post`
- **JWT** (`jsonwebtoken`) — access + refresh, refresh лежит в `httpOnly`-cookie
- **bcrypt** — хеш паролей
- **Multer** — приём `multipart/form-data` и сохранение на диск с уникальными именами; кириллица в `originalname` корректно перекодируется в UTF-8
- **Archiver** — потоковая упаковка папок и файлов в ZIP при скачивании
- **Nodemailer** — письма с активационной ссылкой
- **express-validator** — валидация входных данных
- **express-session** + `session-file-store` — серверные сессии
- **cookie-parser**, **cors**, **morgan**, **dotenv**
- **nodemon** — dev-режим

## Архитектура

Классическая многослойная структура:

```
server/
├── server.js          # точка входа: middlewares, mongoose.connect, app.listen
├── routes/            # описание REST-маршрутов
├── controllers/       # обработка запроса/ответа, делегирование в сервисы
│   ├── user-controller.js
│   ├── data-controller.js
│   └── post-controller.js
├── service/           # бизнес-логика
│   ├── user-service.js     # registration / login / logout / refresh / activate
│   ├── tokenService.js     # подпись и валидация JWT, persistence refresh-токенов
│   ├── data-service.js     # CRUD файлов и папок, ZIP-скачивание, multer-storage
│   └── mail-service.js     # отправка активационных писем
├── models/            # mongoose-схемы (user, tocken, file, folder, files-store, post)
├── middlewares/
│   ├── auth-middleware.js  # проверка access-токена в Authorization
│   └── error-middleware.js # маппинг ApiError → HTTP-статус
├── dtos/              # data-transfer объекты (UserDto)
├── exeptions/         # класс ApiError с фабриками UnauthorizedError / BadRequest
├── files/             # каталог хранения загруженных файлов (UPLOAD_URL)
└── sessions/          # файловое хранилище сессий
```

## Аутентификация и refresh-flow

1. `POST /api/registration` — создаёт пользователя, шлёт письмо со ссылкой `GET /api/activate/:link`. Пока пользователь не активирован, фронт показывает страницу ожидания.
2. `POST /api/login` — выдаёт `accessToken` в теле ответа и `refreshToken` в `httpOnly`-cookie сроком на 30 дней.
3. Защищённые маршруты идут через `auth-middleware`, который проверяет `Authorization: Bearer <accessToken>`.
4. При истечении access-токена клиент дёргает `GET /api/refresh`. Сервер валидирует refresh-токен из cookie, сверяет с записью в БД и выпускает новую пару токенов.
5. `POST /api/logout` — удаляет refresh-токен из БД и чистит cookie.

Ошибки прикладного уровня выбрасываются как `ApiError(status, message)` и единообразно сериализуются `error-middleware`-ом с правильным HTTP-статусом.

## API

Все маршруты замонтированы под `/api`.

### Пользователи

| Метод  | Маршрут                | Описание                                        |
| ------ | ---------------------- | ----------------------------------------------- |
| POST   | `/registration`        | Регистрация (email + password ≥ 3 символов)     |
| POST   | `/login`               | Логин, выдача токенов                           |
| POST   | `/logout`              | Logout, чистка refresh-токена                   |
| GET    | `/activate/:link`      | Активация по uuid-ссылке из письма              |
| GET    | `/refresh`             | Тихое обновление пары токенов                   |
| GET    | `/users`               | Список пользователей (требует auth)             |

### Файлы и папки

| Метод  | Маршрут              | Описание                                                       |
| ------ | -------------------- | -------------------------------------------------------------- |
| POST   | `/save-files`        | Загрузка файлов (`multipart/form-data`, поле `mediacontent`)   |
| GET    | `/get-files`         | Все файлы                                                      |
| GET    | `/files/:folderId`   | Файлы конкретной папки                                         |
| PUT    | `/edit-file/:id`     | Переименование файла                                           |
| DELETE | `/delete-files`      | Удаление файлов (с физическим `unlink`)                        |
| POST   | `/create-folder`     | Создание папки                                                 |
| GET    | `/get-folders`       | Все папки                                                      |
| PUT    | `/edit-folder/:id`   | Переименование папки                                           |
| DELETE | `/delete-folders`    | Рекурсивное удаление папки с вложенными файлами и подпапками   |
| POST   | `/move-items`        | Перемещение файлов и папок в другую папку                      |
| POST   | `/copy-items`        | Рекурсивное копирование папок и файлов                         |
| POST   | `/download-data`     | ZIP-архив из выбранных файлов и папок, отдаётся потоком        |

### Посты

| Метод  | Маршрут            | Описание                       |
| ------ | ------------------ | ------------------------------ |
| POST   | `/create-post`     | Создание поста                 |
| GET    | `/posts`           | Список постов (auth)           |
| PUT    | `/posts/:id`       | Редактирование поста           |
| DELETE | `/delete`          | Удаление поста                 |

## Быстрый старт

### Требования
- Node.js ≥ 18
- Запущенный MongoDB (локально или Atlas)
- SMTP-аккаунт для отправки активационных писем (например, Mail.ru / Yandex / Gmail App Password)

### Установка и запуск

```bash
npm install
npm start              # nodemon server.js на $PORT
```

### Переменные окружения (`.env`)

```dotenv
PORT=4000
DB_URL=mongodb://localhost:27017/file-manager

# абсолютные/относительные пути и URL
API_URL=http://localhost:4000/api
CLIENT_URL=http://localhost:3000
UPLOAD_URL=./files

# секреты JWT
JWT_ACCESS_SECRET=replace-me
JWT_REFRESH_SECRET=replace-me
SESSION_SECRET=replace-me

# SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_USER=noreply@example.com
SMTP_PASSWORD=app-password
```

Каталог, на который указывает `UPLOAD_URL`, должен существовать и быть доступен на запись (`mkdir -p files`).

## Скрипты

| Команда       | Назначение                                |
| ------------- | ----------------------------------------- |
| `npm start`   | dev-режим с авто-перезапуском (`nodemon`) |
