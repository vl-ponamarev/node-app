# File Manager

Облачный файловый менеджер: SPA на React + REST API на Node.js/Express + MongoDB. Аутентификация по JWT (access + refresh), загрузка и хранение файлов через Multer, потоковая упаковка папок в ZIP через Archiver, рекурсивные move / copy / delete на дереве папок, активация аккаунта по email.

Монорепа: [`client/`](./client) — фронтенд, [`server/`](./server) — бэкенд.

## Стек

**Frontend:** React 18, React Router 6, MobX, Ant Design 5, Axios (с auto-refresh interceptor), Feature-Sliced Design.

**Backend:** Node.js, Express 4, Mongoose 7, JWT (jsonwebtoken), bcrypt, Multer, Archiver (ZIP-стриминг), Nodemailer, express-validator.

**Infra:** Docker + docker-compose, MongoDB 7, nginx (отдача статики client).

## Возможности

- Регистрация с подтверждением по email (uuid-ссылка из письма)
- Логин / logout, опция «запомнить меня»
- JWT-flow: access в `Authorization` header, refresh в `httpOnly`-cookie, silent refresh с авто-logout при провале
- Дерево папок (создание, переименование, рекурсивное удаление и копирование)
- Множественная загрузка файлов (`multipart/form-data`), корректная обработка UTF-8 в именах (включая кириллицу)
- Скачивание любого набора файлов и папок единым ZIP-архивом (стримом, без выгрузки в память)
- Перемещение и копирование (рекурсивно по подпапкам)
- Авторизация и фильтрация по `owner` на всех data-роутах — пользователь видит и трогает только свои файлы

## Архитектура

```
file-manager/
├── client/                  # React SPA (FSD)
│   └── src/{app,pages,widgets,features,entities,shared}
├── server/                  # Express REST API
│   ├── routes/              # описание API
│   ├── controllers/         # request/response
│   ├── service/             # бизнес-логика
│   ├── models/              # mongoose-схемы
│   ├── middlewares/         # auth, error
│   ├── exceptions/          # ApiError
│   └── dtos/
├── docker-compose.yml       # mongo + server + client одной командой
└── README.md                # вы здесь
```

Подробности — в `client/README.md` и `server/README.md`.

## Быстрый старт через Docker

Полное окружение (Mongo + API + клиент за nginx) поднимается одной командой:

```bash
docker compose up --build
```

После сборки:
- клиент — http://localhost:3000
- API — http://localhost:4000/api
- MongoDB — `mongodb://localhost:27017/file-manager`

Секреты JWT/сессий и SMTP-доступ можно переопределить через переменные окружения (или `.env` в корне репо). Полный список — в `server/.env.example`.

## Локальный запуск без Docker

### Требования
- Node.js ≥ 18
- MongoDB (локально или Atlas)
- SMTP-аккаунт для активационных писем

### Сервер

```bash
cd server
cp .env.example .env       # заполнить секреты и пути
npm install
npm run dev                # nodemon, http://localhost:4000
```

### Клиент

```bash
cd client
cp .env.example .env       # REACT_APP_API_URL=http://localhost:4000/api
npm install
npm start                  # http://localhost:3000
```

## Переменные окружения

| Переменная             | Назначение                                          | Где               |
| ---------------------- | --------------------------------------------------- | ----------------- |
| `PORT`                 | Порт API                                            | server            |
| `DB_URL`               | MongoDB connection string                           | server, **обяз.** |
| `API_URL`              | Публичный URL API (используется в письмах)          | server            |
| `CLIENT_URL`           | URL фронта для редиректа после активации и CORS     | server            |
| `UPLOAD_URL`           | Каталог для загруженных файлов                      | server, **обяз.** |
| `SESSION_PATH`         | Каталог для файловых сессий (по умолчанию `./sessions`) | server         |
| `JWT_ACCESS_SECRET`    | Секрет для access-токенов                           | server, **обяз.** |
| `JWT_REFRESH_SECRET`   | Секрет для refresh-токенов                          | server, **обяз.** |
| `SESSION_SECRET`       | Секрет express-session                              | server, **обяз.** |
| `SMTP_HOST/PORT/USER/PASSWORD` | SMTP для активационных писем                | server            |
| `REACT_APP_API_URL`    | URL API для клиента (на build-time)                 | client            |

## Тесты

На сервере подключены **Jest + supertest**. Запуск:

```bash
cd server
npm test
```

Покрыты критические места: refresh-flow в `user-service` и рекурсивное копирование в `data-service`.

## Ключевые архитектурные решения

- **FSD** на клиенте — слои `app → pages → widgets → features → entities → shared`, импорты только сверху вниз.
- **JWT access + httpOnly refresh** — access живёт 120 минут, refresh 30 дней в httpOnly-cookie. Silent refresh реализован через axios response-interceptor; при сбое refresh пользователь сам логаутится, без бесконечного цикла.
- **Ownership на всех data-роутах** — каждый файл/папка имеет `owner: ObjectId(User)`, любой запрос данных фильтруется по `req.user.id` из access-токена.
- **Потоковый ZIP** — `archiver` пишет в `res` напрямую, ничего не выгружая в память.
- **UTF-8 в именах файлов** — `originalname` перекодируется из `latin1` (multer default) в `utf8` на этапе сохранения, поэтому кириллица корректно отображается в UI и при скачивании.
- **Многослойная архитектура сервера** — `routes → controllers → service → models`, ошибки прикладного уровня выбрасываются как `ApiError(status, message)` и единообразно сериализуются в `error-middleware`.

## Скрипты

| Сервис | Команда               | Назначение                                   |
| ------ | --------------------- | -------------------------------------------- |
| Root   | `docker compose up`   | поднять всё окружение                        |
| Server | `npm run dev`         | dev-сервер с nodemon                         |
| Server | `npm start`           | прод-старт через `node`                      |
| Server | `npm test`            | Jest-тесты                                   |
| Client | `npm start`           | CRA dev-сервер                               |
| Client | `npm run build`       | production-сборка                            |
