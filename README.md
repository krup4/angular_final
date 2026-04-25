# Subscription Manager

Angular 21 приложение для учета подписок и регулярных платежей. Проект реализует тему 16: пользователь управляет подписками, видит месячные расходы, ближайшие платежи, категории и превышение лимитов.

## Стек

- Angular 21, TypeScript, standalone components, lazy routes
- Taiga UI 4
- NgRx Signal Store
- Mock API на Node.js
- Jest unit tests, Playwright component/e2e scenarios
- ESLint, Prettier, Stylelint

## Запуск

```bash
npm install
npm run dev
```

Приложение: `http://localhost:4200`

Mock API: `http://localhost:3000`

Демо-аккаунт:

```text
student@example.com
password123
```

## Скрипты

```bash
npm start          # Angular dev server with API proxy
npm run mock      # Mock API
npm run dev       # Angular + Mock API
npm test          # Jest unit tests
npm run test:e2e  # Playwright scenarios
npm run lint      # ESLint + Stylelint
npm run build     # Production build
```

## Архитектура

- `src/app/core` — auth, guards, interceptors, API services, Signal Store.
- `src/app/shared` — типы и расчетные функции.
- `src/app/features` — login, shell, dashboard, subscriptions.
- `mock-server` — mock данные и API endpoints.
- `docs` — анализ продукта и UX-концепция.

## Деплой

CI настроен в GitHub Actions: lint, unit tests, build, optional Vercel deploy. Для деплоя нужно добавить repository secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Публичный URL после деплоя: `https://angular-final-94l8.vercel.app/`.
