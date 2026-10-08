# MAX-чат на GREEN-API

Простой веб-чат для отправки и получения текстовых сообщений в MAX через [GREEN-API](https://green-api.com/max).

## Локальный запуск

Нужны Node.js `^20.19.0` или `>=22.12.0` и npm.

Архитектура: FSD (`app` / `pages` / `widgets` / `features` / `entities` / `shared`), axios + TanStack Query (mutations), long-poll уведомлений — отдельный hook. Запросы к GREEN-API идут через same-origin proxy `/green-api`:
- локально — Vite middleware / `server.mjs`
- Vercel — `middleware.ts` (прокси `/green-api`) + fallback `api/proxy.ts` / `vercel.json`

```bash
npm install
npm run dev
```

Откройте адрес из терминала (обычно `http://localhost:5173`).

Прод локально после сборки:

```bash
npm run build
npm start
```

1. Возьмите `idInstance` и `apiTokenInstance` в [личном кабинете GREEN-API](https://console.green-api.com/).
2. Инстанс должен быть авторизован в MAX / Telegram / whatsapp.
3. Введите данные на экране входа.
4. Укажите номер получателя (например `79991234567`) и создайте чат.
5. Отправьте текстовое сообщение и дождитесь ответа в этом же окне.

`apiUrl` собирается автоматически как `https://{первые 4 цифры idInstance}.api.green-api.com`.
