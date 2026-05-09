/* global window, document */

(function () {
  const COLLECTIONS = window.__DT_TASK_COLLECTIONS__ || {};
  const HELPERS = window.__DT_HELPERS__ || {};

  const els = {
    taskKicker: document.getElementById("taskKicker"),
    taskTitle: document.getElementById("taskTitle"),
    theoryLink: document.getElementById("theoryLink"),
    taskBody: document.getElementById("taskBody"),
    progressText: document.getElementById("progressText"),
    progressFill: document.getElementById("progressFill"),
    answerInput: document.getElementById("answerInput"),
    checkAnswer: document.getElementById("checkAnswer"),
    taskSetup: document.getElementById("taskSetup"),
    taskFeedback: document.getElementById("taskFeedback"),
    resetProgress: document.getElementById("resetProgress"),
    swPill: document.getElementById("swPill"),
    runFetch: document.getElementById("runFetch"),
    seedStorage: document.getElementById("seedStorage"),
    seedIndexedDb: document.getElementById("seedIndexedDb"),
    sandboxToggle: document.getElementById("sandboxToggle"),
    brandSubtitle: document.getElementById("brandSubtitle"),
    changeMode: document.getElementById("changeMode"),
    side: document.querySelector(".side"),
  };

  const STORAGE_KEY_BASE = "devtoolsTrainer.progress";

  const state = {
    mode: null,
    index: 0,
  };

  // Console API (base level)
  window.Trainer = {
    state: { level: 1 },
    ping() {
      return "CO-PING-1A9";
    },
    sum(a, b) {
      const result = Number(a) + Number(b);
      return { result, token: "CO-SUM-7B4" };
    },
    unlock() {
      if (window.Trainer.state.level === 3) return "CO-UNLOCK-3LV";
      return "CO-LOCKED";
    },
    findSecret() {
      const el = document.getElementById("badge-secret");
      const ok = Boolean(el && el.getAttribute("data-code"));
      return ok ? "CO-DOM-5XQ" : "CO-NO-DOM";
    },
    inventory() {
      return [
        { item: "wrench", qty: 1, token: "CO-INV-2C8" },
        { item: "wire", qty: 3, token: "..." },
      ];
    },
  };

  function normalize(value) {
    return String(value ?? "")
      .trim()
      .replace(/^["'`]/, "")
      .replace(/["'`]$/, "")
      .trim();
  }

  function getActiveCollection() {
    return state.mode ? COLLECTIONS[state.mode] : null;
  }

  function getTasks() {
    return getActiveCollection()?.tasks || [];
  }

  function getStorageKey(mode) {
    return `${STORAGE_KEY_BASE}.${mode}.v1`;
  }

  function loadProgress(mode) {
    state.index = 0;
    try {
      const raw = localStorage.getItem(getStorageKey(mode));
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const tasks = COLLECTIONS[mode]?.tasks || [];
      if (typeof parsed?.index === "number" && parsed.index >= 0 && parsed.index < tasks.length) {
        state.index = parsed.index;
      }
    } catch {
      state.index = 0;
    }
  }

  function saveProgress() {
    if (!state.mode) return;
    localStorage.setItem(getStorageKey(state.mode), JSON.stringify({ index: state.index }));
  }

  function setFeedback(kind, text) {
    els.taskFeedback.classList.remove("feedback--good", "feedback--bad");
    if (kind === "good") els.taskFeedback.classList.add("feedback--good");
    if (kind === "bad") els.taskFeedback.classList.add("feedback--bad");
    els.taskFeedback.textContent = text || "";
  }

  function disableTaskControls(disabled) {
    els.answerInput.disabled = disabled;
    els.checkAnswer.disabled = disabled;
    els.taskSetup.disabled = disabled;
  }

  function renderModePicker() {
    els.taskKicker.textContent = "Выбор режима";
    els.taskTitle.textContent = "С какого уровня начинаем?";
    if (els.brandSubtitle) {
      els.brandSubtitle.textContent = "Выбери один из режимов в карточке ниже";
    }
    if (els.theoryLink) els.theoryLink.href = "./theory.html#devtools";

    els.taskBody.innerHTML = `
      <p>На этом экране можно выбрать формат обучения.</p>
      <div class="modePicker">
        <div class="modeCard">
          <h3>Тренажер 1 уровень</h3>
          <p>Базовые 20 заданий с подсказками и пошаговыми формулировками.</p>
          <button class="btn btn--primary" type="button" data-mode="level1">Запустить уровень 1</button>
        </div>
        <div class="modeCard">
          <h3>Тренажер 2 уровень</h3>
          <p>20 задач в формате инцидентов, без явных подсказок по шагам.</p>
          <button class="btn btn--primary" type="button" data-mode="level2">Запустить уровень 2</button>
        </div>
      </div>
    `;

    els.progressText.textContent = "-/-";
    els.progressFill.style.width = "0%";
    els.answerInput.value = "";
    els.taskSetup.style.display = "";
    disableTaskControls(true);
    setFeedback("", "");

    els.taskBody.querySelectorAll("button[data-mode]").forEach((btn) => {
      btn.addEventListener("click", () => selectMode(btn.getAttribute("data-mode")));
    });
  }

  function updateTheoryLink(category) {
    if (!els.theoryLink) return;
    const map = {
      Elements: "elements",
      Console: "console",
      Network: "network",
      Storage: "application",
      Application: "application",
      Device: "devtools",
    };
    const hash = map[String(category)] || "devtools";
    els.theoryLink.href = `./theory.html#${hash}`;
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderBody(task, hasHints) {
    const lines = Array.isArray(task.body) ? task.body : [];
    if (!hasHints) {
      return `<p>${escapeHtml(lines[0] || "Проанализируй кейс в DevTools и введи ответ.").replace(/`([^`]+)`/g, "<code>$1</code>")}</p>`;
    }
    const items = lines.map((t) => `<li>${escapeHtml(t).replace(/`([^`]+)`/g, "<code>$1</code>")}</li>`).join("");
    return `<p>Сделай шаги в DevTools и введи ответ.</p><ul>${items}</ul>`;
  }

  function updateProgress() {
    const tasks = getTasks();
    const total = tasks.length;
    const current = Math.min(state.index + 1, total);
    els.progressText.textContent = `${current}/${total}`;
    const pct = total === 0 ? 0 : Math.round((state.index / total) * 100);
    els.progressFill.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  }

  function render() {
    const collection = getActiveCollection();
    if (!collection) {
      renderModePicker();
      return;
    }

    const tasks = getTasks();
    const task = tasks[state.index];

    if (!task) {
      els.taskKicker.textContent = `${collection.label} • завершено`;
      els.taskTitle.textContent = "Ты прошел все задания выбранного режима";
      if (els.theoryLink) els.theoryLink.href = "./theory.html#devtools";
      els.taskBody.innerHTML =
        '<div class="callout">Можно пройти режим заново или переключиться на другой уровень.</div>';
      els.answerInput.value = "";
      els.taskSetup.style.display = collection.hasHints ? "" : "none";
      disableTaskControls(true);
      setFeedback("good", "Финиш. Отличная работа.");
      updateProgress();
      return;
    }

    els.taskKicker.textContent = `${task.category} • ${task.id}`;
    els.taskTitle.textContent = task.title;
    if (els.brandSubtitle) {
      els.brandSubtitle.textContent = `${collection.label} • ${collection.subtitle}`;
    }
    updateTheoryLink(task.category);
    els.taskBody.innerHTML = renderBody(task, collection.hasHints);
    if (!collection.hasHints && typeof task.setup === "function") {
      try {
        task.setup();
      } catch {
      }
    }
    els.answerInput.value = "";
    disableTaskControls(false);
    els.taskSetup.style.display = collection.hasHints ? "" : "none";
    els.taskSetup.disabled = !collection.hasHints || typeof task.setup !== "function";
    els.answerInput.placeholder = task.answerLabel || "Введи ответ...";
    setFeedback("", "");
    updateProgress();
  }

  function selectMode(mode) {
    if (!COLLECTIONS[mode]) return;
    state.mode = mode;
    loadProgress(mode);
    render();
  }

  function check() {
    const task = getTasks()[state.index];
    if (!task) return;
    const answer = els.answerInput.value;
    let ok = false;
    try {
      ok = Boolean(task.validate?.(answer));
    } catch {
      ok = false;
    }

    if (!ok) {
      setFeedback("bad", "Пока нет. Проверь DevTools еще раз и попробуй снова.");
      return;
    }

    setFeedback("good", "Верно. Открываю следующее задание...");
    state.index += 1;
    saveProgress();
    setTimeout(render, 380);
  }

  async function registerSw() {
    if (!("serviceWorker" in navigator)) {
      els.swPill.textContent = "Service Worker: не поддерживается";
      return;
    }
    try {
      const reg = await navigator.serviceWorker.register("./sw.js", { scope: "./" });
      els.swPill.textContent = reg.active ? "Service Worker: активен" : "Service Worker: установлен";
    } catch {
      els.swPill.textContent = "Service Worker: ошибка регистрации";
    }
  }

  function wireUi() {
    els.checkAnswer.addEventListener("click", check);
    els.answerInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") check();
    });

    els.taskSetup.addEventListener("click", () => {
      const task = getTasks()[state.index];
      try {
        task?.setup?.();
      } catch {
      }
      setFeedback("", "Кейс подготовлен. Проверь DevTools.");
    });

    els.changeMode.addEventListener("click", () => {
      state.mode = null;
      state.index = 0;
      render();
      setFeedback("", "Выбери нужный режим.");
    });

    els.resetProgress.addEventListener("click", () => {
      Object.keys(COLLECTIONS).forEach((mode) => localStorage.removeItem(getStorageKey(mode)));
      state.index = 0;
      if (state.mode) {
        render();
      } else {
        renderModePicker();
      }
      setFeedback("", "Прогресс сброшен.");
    });

    els.runFetch.addEventListener("click", () => HELPERS.runMissionFetch?.("NE-1"));
    els.seedStorage.addEventListener("click", () => HELPERS.seedStorage?.());
    els.seedIndexedDb.addEventListener("click", () => HELPERS.seedIndexedDb?.());

    els.sandboxToggle.addEventListener("click", () => {
      const el = document.getElementById("badge-secret");
      if (!el) return;
      const isHidden = getComputedStyle(el).display === "none";
      el.style.display = isHidden ? "inline-flex" : "none";
    });
  }

  wireUi();
  renderModePicker();
  registerSw();
})();
