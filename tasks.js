(function () {
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

  const orderLabState = {
    caseId: "idle",
    clickCount: 0,
    requestCount: 0,
    duplicateListener: false,
    currentToken: "",
    buttonHandlerA: null,
    buttonHandlerB: null,
  };

  function getOrderLabEls() {
    return {
      root: document.getElementById("orderLabRoot"),
      button: document.getElementById("orderButton"),
      status: document.getElementById("orderStatus"),
      caseLabel: document.getElementById("orderCaseLabel"),
    };
  }

  function setOrderLabStatus(text) {
    const els = getOrderLabEls();
    if (els.status) els.status.textContent = text;
  }

  function clearOrderListeners(button) {
    if (!button) return;
    if (orderLabState.buttonHandlerA) button.removeEventListener("click", orderLabState.buttonHandlerA);
    if (orderLabState.buttonHandlerB) button.removeEventListener("click", orderLabState.buttonHandlerB);
    orderLabState.buttonHandlerA = null;
    orderLabState.buttonHandlerB = null;
  }

  function emitOrderRequest(source) {
    orderLabState.requestCount += 1;
    const requestNo = orderLabState.requestCount;
    const url = `/api/order?case=${encodeURIComponent(orderLabState.caseId)}&req=${requestNo}&source=${encodeURIComponent(source)}`;
    setOrderLabStatus(`order click #${orderLabState.clickCount} -> request #${requestNo} (${source})`);
    return fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-order-click": String(orderLabState.clickCount),
      },
      body: JSON.stringify({
        caseId: orderLabState.caseId,
        requestNo,
        source,
      }),
      cache: "no-store",
    }).catch(() => setOrderLabStatus("Ошибка запроса в order lab"));
  }

  function setupOrderLab(caseId, config = {}) {
    const els = getOrderLabEls();
    if (!els.button) return;

    orderLabState.caseId = caseId;
    orderLabState.clickCount = 0;
    orderLabState.requestCount = 0;
    orderLabState.duplicateListener = Boolean(config.duplicateListener);
    orderLabState.currentToken = config.token || "";

    clearOrderListeners(els.button);

    if (els.root) {
      els.root.setAttribute("data-case", caseId);
      els.root.setAttribute("data-incident-token", orderLabState.currentToken);
      els.root.setAttribute("data-duplicate-listener", String(orderLabState.duplicateListener));
    }
    if (els.caseLabel) els.caseLabel.textContent = `case: ${caseId}`;
    setOrderLabStatus("Ожидание действия…");

    orderLabState.buttonHandlerA = () => {
      orderLabState.clickCount += 1;
      emitOrderRequest("primary");
    };
    els.button.addEventListener("click", orderLabState.buttonHandlerA);

    if (orderLabState.duplicateListener) {
      orderLabState.buttonHandlerB = () => {
        emitOrderRequest("secondary");
      };
      els.button.addEventListener("click", orderLabState.buttonHandlerB);
    }
  }

  function runMissionFetch(taskId) {
    const trace = "TR-93KD";
    const url =
      taskId === "NE-2"
        ? `/api/mission?task=${encodeURIComponent(taskId)}&trace=${encodeURIComponent(trace)}`
        : `/api/mission?task=${encodeURIComponent(taskId)}`;

    status(`fetch -> ${url}`);

    return fetch(url, {
      method: "GET",
      headers: {
        "x-client-id": "client-7x2",
      },
      cache: "no-store",
    })
      .then(async (r) => {
        await r.text();
        status(`fetch done -> ${url} (status ${r.status})`);
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
      tx.onerror = () => status("IndexedDB write failed");
    };
    req.onerror = () => status("IndexedDB open failed");
  }

  function seedIncidentStorage(caseId) {
    if (caseId === "L2-AP-1") localStorage.setItem("incident:last-order-id", "ORD-771");
    if (caseId === "L2-AP-2") sessionStorage.setItem("incident:retry-count", "4");
    if (caseId === "L2-AP-3") document.cookie = "incident_region=eu-west-3; Path=/; SameSite=Lax";
    if (caseId === "L2-AP-4") {
      const req = indexedDB.open("dt_incident", 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains("jobs")) db.createObjectStore("jobs", { keyPath: "id" });
      };
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction("jobs", "readwrite");
        tx.objectStore("jobs").put({ id: "job-9", reason: "double-submit" });
        tx.oncomplete = () => db.close();
      };
    }
    status(`Incident storage prepared: ${caseId}`);
  }

  window.IncidentDesk = {
    queue: ["order", "invoice", "shipment"],
    duplicateClicks() {
      return {
        culprit: orderLabState.duplicateListener ? "double_event_listener" : "single_handler",
        requestsAfterLastClick: orderLabState.requestCount,
        token: "L2-CO-1-TK",
      };
    },
    noisyLogs() {
      console.warn(`[incident] case=${orderLabState.caseId} requests=${orderLabState.requestCount}`);
      return "L2-CO-2-TK";
    },
    hotFix() {
      if (orderLabState.duplicateListener) return "L2-CO-3-TK";
      return "L2-CO-LOCKED";
    },
    dump() {
      return [
        { key: "caseId", value: orderLabState.caseId },
        { key: "duplicateListener", value: orderLabState.duplicateListener },
        { key: "requestCount", value: orderLabState.requestCount },
        { key: "token", value: "L2-CO-4-TK" },
      ];
    },
  };

  const level1Tasks = [
    { id: "EL-1", category: "Elements", title: "Найди скрытый бейдж", body: ["В песочнице справа есть элемент `#badge-secret`, но он скрыт стилями.", "Открой вкладку Elements и найди элемент по id.", "Посмотри атрибут `data-code` и введи его сюда."], answerLabel: "Введи значение data-code", setup: () => {}, validate: (a) => normalize(a) === "EL-3F7A" },
    { id: "EL-2", category: "Elements", title: "Токен в псевдо-элементе", body: ["У элемента `.theme-accent` токен спрятан в `::after`.", "Выбери `#accentChip` в Elements и посмотри, что показывает Styles/Computed.", "Найди значение `content` у `::after` и введи его."], answerLabel: "Введи токен из content", setup: () => document.getElementById("accentChip")?.scrollIntoView({ block: "center" }), validate: (a) => normalize(a) === "EL-AFTER-91K2" },
    { id: "EL-3", category: "Elements", title: "Открой drawer через атрибут", body: ["Элемент `#drawer` показывает тело только если `data-state=\"open\"`.", "В Elements найди `#drawer` и поменяй атрибут `data-state` на `open`.", "Затем прочитай токен внутри и введи его."], answerLabel: "Введи токен из drawer", setup: () => document.getElementById("drawer")?.scrollIntoView({ block: "center" }), validate: (a) => normalize(a) === "EL-OPEN-71M" },
    { id: "EL-4", category: "Elements", title: "HTML-комментарий", body: ["В песочнице есть HTML-комментарий с токеном.", "Найди комментарий в дереве DOM (Elements) и введи токен после `token:`."], answerLabel: "Введи токен из комментария", setup: () => document.getElementById("elementsSandbox")?.scrollIntoView({ block: "center" }), validate: (a) => normalize(a) === "EL-COMM-9Q2" },
    { id: "EL-5", category: "Elements", title: "Токен в атрибуте title", body: ["У блока `.hintBox` есть атрибут `title` с токеном.", "Найди `.hintBox` в Elements и введи значение `title`."], answerLabel: "Введи title", setup: () => document.querySelector(".hintBox")?.scrollIntoView({ block: "center" }), validate: (a) => normalize(a) === "EL-TIP-58Q" },
    { id: "CO-1", category: "Console", title: "Вызов функции: ping", body: ["Открой Console.", "Введи `Trainer.ping()` и выполни.", "Скопируй возвращенный токен и вставь сюда."], answerLabel: "Вставь токен из Trainer.ping()", setup: () => {}, validate: (a) => normalize(a) === "CO-PING-1A9" },
    { id: "CO-2", category: "Console", title: "Вызов функции с аргументами", body: ["В Console выполни `Trainer.sum(7, 11)`.", "Функция вернет объект вида `{ result, token }`.", "Введи `token`."], answerLabel: "Введи token из Trainer.sum", setup: () => {}, validate: (a) => normalize(a) === "CO-SUM-7B4" },
    { id: "CO-3", category: "Console", title: "Измени состояние и разблокируй", body: ["В Console установи `Trainer.state.level = 3`.", "Затем вызови `Trainer.unlock()`.", "Введи возвращенный токен."], answerLabel: "Вставь токен из unlock", setup: () => {}, validate: (a) => normalize(a) === "CO-UNLOCK-3LV" },
    { id: "CO-4", category: "Console", title: "Функция читает DOM", body: ["В Console вызови `Trainer.findSecret()`.", "Она найдет токен в DOM и вернет его.", "Вставь токен."], answerLabel: "Вставь токен из findSecret", setup: () => document.getElementById("badge-secret")?.setAttribute("data-code", "EL-3F7A"), validate: (a) => normalize(a) === "CO-DOM-5XQ" },
    { id: "CO-5", category: "Console", title: "Посмотри данные (table)", body: ["В Console выполни `Trainer.inventory()`.", "Посмотри таблицу/объект, найди поле `token` и введи его."], answerLabel: "Введи token из inventory", setup: () => {}, validate: (a) => normalize(a) === "CO-INV-2C8" },
    { id: "NE-1", category: "Network", title: "Ответный header", body: ["Нажми кнопку \"Сделать запрос (fetch)\" справа.", "Открой вкладку Network и выбери запрос на `/api/mission?task=NE-1`.", "В Response Headers найди `x-trainer-token` и введи его значение."], answerLabel: "Введи x-trainer-token", setup: () => runMissionFetch("NE-1"), validate: (a) => normalize(a) === "NE-HDR-44P" },
    { id: "NE-2", category: "Network", title: "Query params", body: ["Нажми \"Подготовить шаг\", чтобы сделать запрос.", "В Network открой Request URL и найди query param `trace`.", "Введи значение `trace`."], answerLabel: "Введи trace", setup: () => runMissionFetch("NE-2"), validate: (a) => normalize(a) === "TR-93KD" },
    { id: "NE-3", category: "Network", title: "Токен в JSON body", body: ["Нажми \"Подготовить шаг\", чтобы сделать запрос.", "В Network открой Response (Preview/Response) и найди `payload.token`.", "Введи токен."], answerLabel: "Введи payload.token", setup: () => runMissionFetch("NE-3"), validate: (a) => normalize(a) === "NE-BODY-7HF" },
    { id: "NE-4", category: "Network", title: "Ошибка и статус", body: ["Нажми \"Подготовить шаг\", чтобы сделать запрос.", "В Network найди запрос `/api/mission?task=NE-4`.", "Проверь HTTP status и в Response найди токен `error.token`.", "Введи токен."], answerLabel: "Введи error.token", setup: () => runMissionFetch("NE-4"), validate: (a) => normalize(a) === "NE-418-QQ1" },
    { id: "NE-5", category: "Network", title: "Request headers", body: ["Нажми \"Подготовить шаг\", чтобы сделать запрос.", "В Network открой Request Headers и найди `x-client-id`.", "Введи значение этого заголовка."], answerLabel: "Введи x-client-id", setup: () => runMissionFetch("NE-5"), validate: (a) => normalize(a) === "client-7x2" },
    { id: "ST-1", category: "Storage", title: "LocalStorage", body: ["Нажми кнопку \"Заполнить Storage\" справа.", "Открой вкладку Application -> Local Storage.", "Найди ключ `dt_name` и введи его значение."], answerLabel: "Введи значение dt_name", setup: () => seedStorage(), validate: (a) => normalize(a) === "neo" },
    { id: "ST-2", category: "Storage", title: "SessionStorage", body: ["Нажми \"Заполнить Storage\" справа (если не нажимал).", "Application -> Session Storage.", "Найди ключ `dt_session_code` и введи значение."], answerLabel: "Введи dt_session_code", setup: () => seedStorage(), validate: (a) => normalize(a) === "SESS-4J9" },
    { id: "ST-3", category: "Storage", title: "Cookies", body: ["Нажми \"Заполнить Storage\" справа (если не нажимал).", "Application -> Cookies -> текущий сайт.", "Найди cookie `dt_cookie` и введи ее значение."], answerLabel: "Введи dt_cookie", setup: () => seedStorage(), validate: (a) => normalize(a) === "COOKIE-2M5" },
    { id: "ST-4", category: "Storage", title: "IndexedDB", body: ["Нажми кнопку \"Создать IndexedDB запись\" справа.", "Application -> IndexedDB -> `dt_trainer` -> object store `notes`.", "Открой запись с `id = 1` и введи значение поля `token`."], answerLabel: "Введи token из IndexedDB notes[1]", setup: () => seedIndexedDb(), validate: (a) => normalize(a) === "IDB-1Z8" },
    { id: "ST-5", category: "Storage", title: "Измени storage вручную", body: ["Открой Application -> Local Storage и удали ключ `dt_name`.", "Затем нажми \"Подготовить шаг\".", "Если ключ удален, приложение положит в Session Storage токен `dt_cleared_token`.", "Найди `dt_cleared_token` в Session Storage и введи его значение."], answerLabel: "Введи dt_cleared_token", setup: () => { if (localStorage.getItem("dt_name") == null) sessionStorage.setItem("dt_cleared_token", "CLEARED-8V4"); }, validate: (a) => normalize(a) === "CLEARED-8V4" },
  ];

  const level2Tasks = [
    { id: "L2-EL-1", category: "Elements", title: "Двойной обработчик кнопки", body: ["Пользователь жалуется на дублирование заказа при клике по кнопке `Заказать`. В Elements у `#orderLabRoot` найди `data-duplicate-listener` и введи значение."], answerLabel: "Значение data-duplicate-listener", setup: () => setupOrderLab("L2-EL-1", { duplicateListener: true, token: "L2-EL-1-TK" }), validate: (a) => normalize(a) === "true" },
    { id: "L2-EL-2", category: "Elements", title: "Токен активного инцидента", body: ["Команда просит подтвердить номер инцидента. В Elements у `#orderLabRoot` найди `data-incident-token`."], answerLabel: "Токен инцидента", setup: () => setupOrderLab("L2-EL-2", { duplicateListener: true, token: "L2-EL-2-TK" }), validate: (a) => normalize(a) === "L2-EL-2-TK" },
    { id: "L2-EL-3", category: "Elements", title: "Проверка активного case", body: ["Перед разбором нужно проверить, какой кейс активен. В Elements у `#orderLabRoot` найди `data-case`."], answerLabel: "Case id", setup: () => setupOrderLab("L2-EL-3", { duplicateListener: false, token: "L2-EL-3-TK" }), validate: (a) => normalize(a) === "L2-EL-3" },
    { id: "L2-EL-4", category: "Elements", title: "Релизная пометка", body: ["Найди в DOM служебный комментарий с префиксом `incident:` и введи код после него."], answerLabel: "Код аварии", setup: () => setupOrderLab("L2-EL-4", { duplicateListener: true, token: "L2-EL-4-TK" }), validate: (a) => normalize(a) === "L2-COMM-884" },

    { id: "L2-NE-1", category: "Network", title: "Два запроса на один клик", body: ["Нажми `Заказать` один раз. В Network найди запросы `/api/order?case=L2-NE-1` и введи количество запросов."], answerLabel: "Количество запросов", setup: () => setupOrderLab("L2-NE-1", { duplicateListener: true, token: "L2-NE-1-TK" }), validate: (a) => normalize(a) === "2" },
    { id: "L2-NE-2", category: "Network", title: "Откуда пришел дубль", body: ["После одного клика на `Заказать` открой любой запрос `/api/order?case=L2-NE-2` и в Query String найди `source` дублирующего запроса."], answerLabel: "source", setup: () => setupOrderLab("L2-NE-2", { duplicateListener: true, token: "L2-NE-2-TK" }), validate: (a) => normalize(a) === "secondary" },
    { id: "L2-NE-3", category: "Network", title: "Токен из response headers", body: ["Нажми `Заказать`, открой запрос `/api/order?case=L2-NE-3` и в Response Headers найди `x-order-token`."], answerLabel: "x-order-token", setup: () => setupOrderLab("L2-NE-3", { duplicateListener: true, token: "L2-NE-H3" }), validate: (a) => normalize(a) === "L2-NE-H3" },
    { id: "L2-NE-4", category: "Network", title: "Конфликт идемпотентности", body: ["После клика по `Заказать` проверь статус второго запроса для `L2-NE-4` и введи HTTP status."], answerLabel: "HTTP status", setup: () => setupOrderLab("L2-NE-4", { duplicateListener: true, token: "L2-NE-E4" }), validate: (a) => normalize(a) === "409" },

    { id: "L2-AP-1", category: "Application", title: "Хвост прошлого заказа", body: ["В Application -> Local Storage найди ключ `incident:last-order-id` и введи значение."], answerLabel: "Значение ключа", setup: () => { setupOrderLab("L2-AP-1", { duplicateListener: false, token: "L2-AP-1-TK" }); seedIncidentStorage("L2-AP-1"); }, validate: (a) => normalize(a) === "ORD-771" },
    { id: "L2-AP-2", category: "Application", title: "Лимит ретраев", body: ["В Application -> Session Storage найди `incident:retry-count` и введи значение."], answerLabel: "retry-count", setup: () => { setupOrderLab("L2-AP-2", { duplicateListener: true, token: "L2-AP-2-TK" }); seedIncidentStorage("L2-AP-2"); }, validate: (a) => normalize(a) === "4" },
    { id: "L2-AP-3", category: "Application", title: "Проблемный регион", body: ["В Application -> Cookies найди `incident_region` и введи значение."], answerLabel: "incident_region", setup: () => { setupOrderLab("L2-AP-3", { duplicateListener: true, token: "L2-AP-3-TK" }); seedIncidentStorage("L2-AP-3"); }, validate: (a) => normalize(a) === "eu-west-3" },
    { id: "L2-AP-4", category: "Application", title: "Причина в offline-очереди", body: ["В IndexedDB (`dt_incident/jobs`) найди запись `job-9` и введи поле `reason`."], answerLabel: "reason", setup: () => { setupOrderLab("L2-AP-4", { duplicateListener: true, token: "L2-AP-4-TK" }); seedIncidentStorage("L2-AP-4"); }, validate: (a) => normalize(a) === "double-submit" },

    { id: "L2-CO-1", category: "Console", title: "Диагностика причины дублей", body: ["Вызови `IncidentDesk.duplicateClicks()` и введи `culprit`."], answerLabel: "culprit", setup: () => setupOrderLab("L2-CO-1", { duplicateListener: true, token: "L2-CO-1-TK" }), validate: (a) => normalize(a) === "double_event_listener" },
    { id: "L2-CO-2", category: "Console", title: "Лог инцидента", body: ["Вызови `IncidentDesk.noisyLogs()` и введи возвращенный token."], answerLabel: "token", setup: () => setupOrderLab("L2-CO-2", { duplicateListener: true, token: "L2-CO-2-TK" }), validate: (a) => normalize(a) === "L2-CO-2-TK" },
    { id: "L2-CO-3", category: "Console", title: "Проверка hotfix", body: ["Вызови `IncidentDesk.hotFix()` и введи ответ."], answerLabel: "hotFix()", setup: () => setupOrderLab("L2-CO-3", { duplicateListener: true, token: "L2-CO-3-TK" }), validate: (a) => normalize(a) === "L2-CO-3-TK" },
    { id: "L2-CO-4", category: "Console", title: "Dump состояния", body: ["Сделай `IncidentDesk.dump()` и введи `token` из результата."], answerLabel: "token", setup: () => setupOrderLab("L2-CO-4", { duplicateListener: false, token: "L2-CO-4-TK" }), validate: (a) => normalize(a) === "L2-CO-4-TK" },

    { id: "L2-EL-5", category: "Elements", title: "Количество обработчиков", body: ["Найди в Elements у `#orderLabRoot` атрибут `data-duplicate-listener` и введи его значение после подготовки кейса."], answerLabel: "data-duplicate-listener", setup: () => setupOrderLab("L2-EL-5", { duplicateListener: true, token: "L2-EL-5-TK" }), validate: (a) => normalize(a) === "true" },
    { id: "L2-NE-5", category: "Network", title: "Request header клика", body: ["Нажми `Заказать`, открой `/api/order?case=L2-NE-5` и введи значение `x-order-click` из Request Headers."], answerLabel: "x-order-click", setup: () => setupOrderLab("L2-NE-5", { duplicateListener: false, token: "L2-NE-5-TK" }), validate: (a) => normalize(a) === "1" },
    { id: "L2-AP-5", category: "Application", title: "Кейс в SessionStorage", body: ["Открой Application -> Session Storage и найди ключ `incident:active-case` после подготовки кейса."], answerLabel: "incident:active-case", setup: () => { setupOrderLab("L2-AP-5", { duplicateListener: true, token: "L2-AP-5-TK" }); sessionStorage.setItem("incident:active-case", "L2-AP-5"); }, validate: (a) => normalize(a) === "L2-AP-5" },
    { id: "L2-CO-5", category: "Console", title: "Сколько запросов ушло", body: ["Нажми `Заказать` один раз, затем вызови `IncidentDesk.dump()` и введи `requestCount`."], answerLabel: "requestCount", setup: () => setupOrderLab("L2-CO-5", { duplicateListener: true, token: "L2-CO-5-TK" }), validate: (a) => normalize(a) === "2" },
  ];

  window.__DT_TASK_COLLECTIONS__ = {
    level1: {
      id: "level1",
      label: "Тренажер 1 уровень",
      subtitle: "Базовые шаги и подсказки",
      intro: "Пошаговый режим с подсказками для отработки инструментов.",
      tasks: level1Tasks,
      hasHints: true,
    },
    level2: {
      id: "level2",
      label: "Тренажер 2 уровень",
      subtitle: "20 инцидентов без подсказок",
      intro: "Сценарии формата production-инцидентов. Нужно самостоятельно выбирать инструмент DevTools.",
      tasks: level2Tasks,
      hasHints: false,
    },
  };

  window.__DT_HELPERS__ = { runMissionFetch, seedStorage, seedIndexedDb, seedIncidentStorage };
})();
