
(function () {
  const tasks = [
    {
      id: "EL-1",
      category: "Elements",
      title: "Найди скрытый бейдж",
      body: [
        "В песочнице справа есть элемент `#badge-secret`, но он скрыт стилями.",
        "Открой вкладку Elements и найди элемент по id.",
        "Посмотри атрибут `data-code` и введи его сюда.",
      ],
      answerLabel: "Введи значение data-code",
      setup: () => {
      },
      validate: (answer) => normalize(answer) === "EL-3F7A",
    },
    {
      id: "EL-2",
      category: "Elements",
      title: "Токен в псевдо‑элементе",
      body: [
        "У элемента `.theme-accent` токен спрятан в `::after`.",
        "Выбери `#accentChip` в Elements и посмотри, что показывает панель Styles / Computed.",
        "Найди значение `content` у `::after` и введи его.",
      ],
      answerLabel: "Введи токен из content",
      setup: () => {
        document.getElementById("accentChip")?.scrollIntoView({ block: "center" });
      },
      validate: (answer) => normalize(answer) === "EL-AFTER-91K2",
    },
    {
      id: "EL-3",
      category: "Elements",
      title: "Открой drawer через атрибут",
      body: [
        "Элемент `#drawer` показывает тело только если `data-state=\"open\"`.",
        "В Elements найди `#drawer` и поменяй атрибут `data-state` на `open`.",
        "Затем прочитай токен внутри и введи его.",
      ],
      answerLabel: "Введи токен из drawer",
      setup: () => {
        document.getElementById("drawer")?.scrollIntoView({ block: "center" });
      },
      validate: (answer) => normalize(answer) === "EL-OPEN-71M",
    },
    {
      id: "EL-4",
      category: "Elements",
      title: "HTML‑комментарий",
      body: [
        "В песочнице есть HTML‑комментарий с токеном.",
        "Найди комментарий в дереве DOM (Elements) и введи токен после `token:`.",
      ],
      answerLabel: "Введи токен из комментария",
      setup: () => {
        document.getElementById("elementsSandbox")?.scrollIntoView({ block: "center" });
      },
      validate: (answer) => normalize(answer) === "EL-COMM-9Q2",
    },
    {
      id: "EL-5",
      category: "Elements",
      title: "Токен в атрибуте title",
      body: [
        "У блока `.hintBox` есть атрибут `title` с токеном.",
        "Найди `.hintBox` в Elements и введи значение `title`.",
      ],
      answerLabel: "Введи title",
      setup: () => {
        document.querySelector(".hintBox")?.scrollIntoView({ block: "center" });
      },
      validate: (answer) => normalize(answer) === "EL-TIP-58Q",
    },

    // Console (5)
    {
      id: "CO-1",
      category: "Console",
      title: "Вызов функции: ping",
      body: [
        "Открой Console.",
        "Введи `Trainer.ping()` и выполни.",
        "Скопируй возвращённый токен и вставь сюда.",
      ],
      answerLabel: "Вставь токен из Trainer.ping()",
      setup: () => {
      },
      validate: (answer) => normalize(answer) === "CO-PING-1A9",
    },
    {
      id: "CO-2",
      category: "Console",
      title: "Вызов функции с аргументами",
      body: [
        "В Console выполни `Trainer.sum(7, 11)`.",
        "Функция вернёт объект вида `{ result, token }`.",
        "Введи `token`.",
      ],
      answerLabel: "Введи token из Trainer.sum",
      setup: () => {
      },
      validate: (answer) => normalize(answer) === "CO-SUM-7B4",
    },
    {
      id: "CO-3",
      category: "Console",
      title: "Измени состояние и разблокируй",
      body: [
        "В Console установи `Trainer.state.level = 3`.",
        "Затем вызови `Trainer.unlock()`.",
        "Введи возвращённый токен.",
      ],
      answerLabel: "Вставь токен из unlock",
      setup: () => {
      },
      validate: (answer) => normalize(answer) === "CO-UNLOCK-3LV",
    },
    {
      id: "CO-4",
      category: "Console",
      title: "Функция читает DOM",
      body: [
        "В Console вызови `Trainer.findSecret()`.",
        "Она найдёт токен в DOM и вернёт его.",
        "Вставь токен.",
      ],
      answerLabel: "Вставь токен из findSecret",
      setup: () => {
        document.getElementById("badge-secret")?.setAttribute("data-code", "EL-3F7A");
      },
      validate: (answer) => normalize(answer) === "CO-DOM-5XQ",
    },
    {
      id: "CO-5",
      category: "Console",
      title: "Посмотри данные (table)",
      body: [
        "В Console выполни `Trainer.inventory()`.",
        "Посмотри таблицу/объект, найди поле `token` и введи его.",
      ],
      answerLabel: "Введи token из inventory",
      setup: () => {
      },
      validate: (answer) => normalize(answer) === "CO-INV-2C8",
    },

    // Network / Fetch (5)
    {
      id: "NE-1",
      category: "Network",
      title: "Ответный header",
      body: [
        "Нажми кнопку “Сделать запрос (fetch)” справа.",
        "Открой вкладку Network и выбери запрос на `/api/mission?task=NE-1`.",
        "В Response Headers найди `x-trainer-token` и введи его значение.",
      ],
      answerLabel: "Введи x-trainer-token",
      setup: () => runMissionFetch("NE-1"),
      validate: (answer) => normalize(answer) === "NE-HDR-44P",
    },
    {
      id: "NE-2",
      category: "Network",
      title: "Query params",
      body: [
        "Нажми “Подготовить шаг”, чтобы сделать запрос.",
        "В Network открой Request URL и найди query param `trace`.",
        "Введи значение `trace`.",
      ],
      answerLabel: "Введи trace",
      setup: () => runMissionFetch("NE-2"),
      validate: (answer) => normalize(answer) === "TR-93KD",
    },
    {
      id: "NE-3",
      category: "Network",
      title: "Токен в JSON body",
      body: [
        "Нажми “Подготовить шаг”, чтобы сделать запрос.",
        "В Network открой Response (Preview/Response) и найди `payload.token`.",
        "Введи токен.",
      ],
      answerLabel: "Введи payload.token",
      setup: () => runMissionFetch("NE-3"),
      validate: (answer) => normalize(answer) === "NE-BODY-7HF",
    },
    {
      id: "NE-4",
      category: "Network",
      title: "Ошибка и статус",
      body: [
        "Нажми “Подготовить шаг”, чтобы сделать запрос.",
        "В Network найди запрос `/api/mission?task=NE-4`.",
        "Проверь HTTP status (он необычный) и в Response найди токен `error.token`.",
        "Введи токен.",
      ],
      answerLabel: "Введи error.token",
      setup: () => runMissionFetch("NE-4"),
      validate: (answer) => normalize(answer) === "NE-418-QQ1",
    },
    {
      id: "NE-5",
      category: "Network",
      title: "Request headers",
      body: [
        "Нажми “Подготовить шаг”, чтобы сделать запрос.",
        "В Network открой Request Headers и найди `x-client-id`.",
        "Введи значение этого заголовка.",
      ],
      answerLabel: "Введи x-client-id",
      setup: () => runMissionFetch("NE-5"),
      validate: (answer) => normalize(answer) === "client-7x2",
    },

    // Storage (5)
    {
      id: "ST-1",
      category: "Storage",
      title: "LocalStorage",
      body: [
        "Нажми кнопку “Заполнить Storage” справа.",
        "Открой вкладку Application → Local Storage.",
        "Найди ключ `dt_name` и введи его значение.",
      ],
      answerLabel: "Введи значение dt_name",
      setup: () => seedStorage(),
      validate: (answer) => normalize(answer) === "neo",
    },
    {
      id: "ST-2",
      category: "Storage",
      title: "SessionStorage",
      body: [
        "Нажми “Заполнить Storage” справа (если не нажимал).",
        "Application → Session Storage.",
        "Найди ключ `dt_session_code` и введи значение.",
      ],
      answerLabel: "Введи dt_session_code",
      setup: () => seedStorage(),
      validate: (answer) => normalize(answer) === "SESS-4J9",
    },
    {
      id: "ST-3",
      category: "Storage",
      title: "Cookies",
      body: [
        "Нажми “Заполнить Storage” справа (если не нажимал).",
        "Application → Cookies → текущий сайт.",
        "Найди cookie `dt_cookie` и введи её значение.",
      ],
      answerLabel: "Введи dt_cookie",
      setup: () => seedStorage(),
      validate: (answer) => normalize(answer) === "COOKIE-2M5",
    },
    {
      id: "ST-4",
      category: "Storage",
      title: "IndexedDB",
      body: [
        "Нажми кнопку “Создать IndexedDB запись” справа.",
        "Application → IndexedDB → `dt_trainer` → object store `notes`.",
        "Открой запись с `id = 1` и введи значение поля `token`.",
      ],
      answerLabel: "Введи token из IndexedDB notes[1]",
      setup: () => seedIndexedDb(),
      validate: (answer) => normalize(answer) === "IDB-1Z8",
    },
    {
      id: "ST-5",
      category: "Storage",
      title: "Измени storage вручную",
      body: [
        "Открой Application → Local Storage и удали ключ `dt_name`.",
        "Затем нажми “Подготовить шаг”.",
        "Если ключ удалён, приложение положит в Session Storage токен `dt_cleared_token`.",
        "Найди `dt_cleared_token` в Session Storage и введи его значение.",
      ],
      answerLabel: "Введи dt_cleared_token",
      setup: () => {
        if (localStorage.getItem("dt_name") == null) {
          sessionStorage.setItem("dt_cleared_token", "CLEARED-8V4");
        }
      },
      validate: (answer) => normalize(answer) === "CLEARED-8V4",
    },
  ];

  function normalize(value) {
    return String(value ?? "")
      .trim()
      .replace(/^["'`]/, "")
      .replace(/["'`]$/, "")
      .trim();
  }

  function status(text) {
    const el = document.getElementById("statusLine");
    if (el) el.textContent = text;
  }

  function runMissionFetch(taskId) {
    const trace = "TR-93KD";
    const url =
      taskId === "NE-2"
        ? `/api/mission?task=${encodeURIComponent(taskId)}&trace=${encodeURIComponent(trace)}`
        : `/api/mission?task=${encodeURIComponent(taskId)}`;

    status(`fetch → ${url}`);

    return fetch(url, {
      method: "GET",
      headers: {
        "x-client-id": "client-7x2",
      },
      cache: "no-store",
    })
      .then(async (r) => {
        await r.text();
        status(`fetch done → ${url} (status ${r.status})`);
      })
      .catch((e) => status(`fetch error: ${String(e)}`));
  }

  function seedStorage() {
    localStorage.setItem("dt_name", "neo");
    sessionStorage.setItem("dt_session_code", "SESS-4J9");
    document.cookie = "dt_cookie=COOKIE-2M5; Path=/; SameSite=Lax";
    status("Storage seeded (local/session/cookie)");
  }

  function seedIndexedDb() {
    const req = indexedDB.open("dt_trainer", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("notes")) {
        db.createObjectStore("notes", { keyPath: "id" });
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction("notes", "readwrite");
      tx.objectStore("notes").put({ id: 1, token: "IDB-1Z8", note: "open me in devtools" });
      tx.oncomplete = () => {
        db.close();
        status("IndexedDB: dt_trainer/notes[1] written");
      };
      tx.onerror = () => {
        status("IndexedDB write failed");
      };
    };
    req.onerror = () => status("IndexedDB open failed");
  }

  window.__DT_TASKS__ = tasks;
  window.__DT_HELPERS__ = { runMissionFetch, seedStorage, seedIndexedDb };
})();

