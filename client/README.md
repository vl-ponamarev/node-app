# File Manager — Client

SPA-клиент облачного файлового менеджера: загрузка, скачивание, перемещение, копирование, переименование и удаление файлов и папок, древовидная навигация, авторизация по JWT с молчаливым refresh-flow.

Серверная часть и API лежат в [`../server`](../server).

## Стек

- **React 18** + **React Router 6** — SPA, защищённые маршруты
- **MobX** + `mobx-react-lite` — управление состоянием (user / files / posts / errors), observer-компоненты
- **Ant Design 5** + `@ant-design/icons` — UI-кит (таблицы, модалки, dropdown, drag-and-drop)
- **Axios** — HTTP-клиент с request/response interceptors, авто-refresh access-токена и принудительный logout при провале refresh
- **dayjs** — форматирование дат
- **Create React App** (`react-scripts 5`) — сборка и dev-сервер

## Архитектура

Проект организован по принципам **Feature-Sliced Design**:

```
src/
├── app/                   # точка входа приложения
│   ├── App.jsx            # корневой компонент
│   ├── Router.jsx         # маршруты, защита по isAuth/isActivated
│   ├── providers/         # withRouter и композиция HOC-провайдеров
│   ├── store/             # MobX-сторы: userStore, filesStore, postsStore, errorStore
│   └── styles/
├── pages/                 # страничные композиции (main, activation)
├── widgets/               # независимые блоки (data-action-panel, data-view-component, data-view-panel)
├── features/              # пользовательские сценарии:
│   ├── login_signup/      #   логин и регистрация
│   ├── uploadFile/        #   загрузка файлов
│   ├── download/          #   скачивание (одиночное и ZIP)
│   ├── create-directory/  #   создание папки
│   ├── rename/            #   переименование
│   ├── move/ copy/        #   перемещение и копирование
│   ├── delete/            #   удаление
│   ├── open/              #   открытие папки
│   ├── breadcrumbs/       #   хлебные крошки
│   └── logout/
├── entities/              # доменные сущности (folder, data-list-view, data-table-view, data-side-menu)
└── shared/                # переиспользуемая база:
    ├── api/               #   сервисные обёртки (authService, filesService, postService)
    ├── http/              #   настроенный axios-инстанс + interceptors
    ├── hooks/             #   useUpload, useDownload
    ├── lib/               #   утилиты (handleDelete, handleMenuClick…)
    └── ui/                #   button, menu, modal, navbar, loader
```

Алиасы импортов настроены через `jsconfig.json` (`baseUrl: "./src"`), поэтому импорты идут как `import { ... } from 'features'`, `'entities'`, `'shared/ui/...'`.

## Аутентификация

- При логине сервер выдаёт `accessToken` (JSON) и кладёт `refreshToken` в **httpOnly cookie**.
- `accessToken` хранится в `localStorage` и автоматически подставляется в `Authorization: Bearer …` через request-interceptor (`src/shared/http/index.js`).
- При получении **401** response-interceptor однократно дёргает `GET /api/refresh`, обновляет access-токен и повторяет исходный запрос.
- Если refresh упал — interceptor сам очищает токен, сбрасывает `userStore.isAuth` / `userStore.user` и пользователь возвращается на форму логина без бесконечного цикла.
- На старте приложения вызывается `userStore.checkAuth()` — silent-refresh для авто-логина по cookie.

## Возможности

- Регистрация с подтверждением по email (активационная ссылка)
- Логин / logout, чекбокс «запомнить меня»
- Дерево папок, открытие, breadcrumbs
- Множественная загрузка файлов (`multipart/form-data`)
- Скачивание выбранных файлов и папок единым ZIP-архивом (генерируется на сервере, прогресс на клиенте)
- Переименование, удаление, перемещение и копирование (с рекурсивным копированием подпапок)
- Контекстные меню, drag-and-drop через `react-draggable`

## Быстрый старт

### Требования
- Node.js ≥ 18
- Запущенный backend из `../server` (по умолчанию `http://localhost:4000`)

### Установка и запуск

```bash
npm install
npm start          # dev-сервер на http://localhost:3000
```

### Сборка

```bash
npm run build      # production-сборка в build/
```

### Конфигурация API

URL бэкенда задан константой в `src/shared/http/index.js`:

```js
export const API_URL = 'http://localhost:4000/api';
```

При деплое или смене порта правится здесь (или выносится в `.env`/`REACT_APP_*` по желанию).

## Скрипты

| Команда         | Назначение                                  |
| --------------- | ------------------------------------------- |
| `npm start`     | dev-сервер с hot-reload                     |
| `npm run build` | production-сборка                           |
| `npm test`      | запуск тестов (react-scripts / Jest)        |
