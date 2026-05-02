## DevTools Trainer (без бэкенда)

Статическое веб‑приложение для тренировки навыков работы с DevTools:

- Elements (5 заданий)
- Console (5 заданий)
- Network / Fetch (5 заданий)
- Storage (5 заданий: Local, Session, Cookies, IndexedDB)

## Запуск

Важно: для корректной работы `fetch` и Service Worker откройте через **локальный статический сервер** (не через `file://`).

### Вариант 1 (Python)

```bash
python -m http.server 5173
```

Откройте в браузере `http://localhost:5173`.

### Вариант 2 (Node)

```bash
npx serve -l 5173 .
```

## Сброс прогресса

В приложении есть кнопка “Сбросить прогресс”, а также можно очистить `localStorage`.

