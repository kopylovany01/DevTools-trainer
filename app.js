/* global window, document */

(function () {
  const TASKS = Array.isArray(window.__DT_TASKS__) ? window.__DT_TASKS__ : [];
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
  };

  const STORAGE_KEY = "devtoolsTrainer.progress.v1";

  const state = {
    index: 0,
  };

  // Console API
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
        { item: "wire", qty: 3, token: "…" },
      ];
    },
  };

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (typeof parsed?.index === "number" && parsed.index >= 0 && parsed.index < TASKS.length) {
        state.index = parsed.index;
      }
    } catch {
    }
  }

  function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ index: state.index }));
  }

  function setFeedback(kind, text) {
    els.taskFeedback.classList.remove("feedback--good", "feedback--bad");
    if (kind === "good") els.taskFeedback.classList.add("feedback--good");
    if (kind === "bad") els.taskFeedback.classList.add("feedback--bad");
    els.taskFeedback.textContent = text || "";
  }

  function render() {
    const task = TASKS[state.index];
    if (!task) {
      els.taskKicker.textContent = "Готово";
      els.taskTitle.textContent = "Ты прошёл все задания";
      if (els.theoryLink) els.theoryLink.href = "./theory.html#devtools";
      els.taskBody.innerHTML =
        '<div class="callout">Можно сбросить прогресс и пройти ещё раз. А ещё попробуй пройти, не используя подсказки.</div>';
      els.answerInput.disabled = true;
      els.checkAnswer.disabled = true;
      els.taskSetup.disabled = true;
      setFeedback("good", "Финиш. Отличная работа.");
      updateProgress();
      return;
    }

    els.taskKicker.textContent = `${task.category} • ${task.id}`;
    els.taskTitle.textContent = task.title;
    updateTheoryLink(task.category);
    els.taskBody.innerHTML = renderBody(task);
    els.answerInput.value = "";
    els.answerInput.disabled = false;
    els.checkAnswer.disabled = false;
    els.taskSetup.disabled = typeof task.setup !== "function";
    els.answerInput.placeholder = task.answerLabel || "Введи ответ…";
    setFeedback("", "");
    updateProgress();
  }

  function updateTheoryLink(category) {
    if (!els.theoryLink) return;
    const map = {
      Elements: "elements",
      Console: "console",
      Network: "network",
      Storage: "application",
    };
    const hash = map[String(category)] || "devtools";
    els.theoryLink.href = `./theory.html#${hash}`;
  }

  function renderBody(task) {
    const lines = Array.isArray(task.body) ? task.body : [];
    const items = lines.map((t) => `<li>${escapeHtml(t).replace(/`([^`]+)`/g, "<code>$1</code>")}</li>`).join("");
    return `<p>Сделай шаги в DevTools и введи ответ.</p><ul>${items}</ul>`;
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function updateProgress() {
    const total = TASKS.length;
    const current = Math.min(state.index + 1, total);
    els.progressText.textContent = `${current}/${total}`;
    const pct = total === 0 ? 0 : Math.round((state.index / total) * 100);
    els.progressFill.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  }

  function check() {
    const task = TASKS[state.index];
    if (!task) return;
    const answer = els.answerInput.value;
    let ok = false;
    try {
      ok = Boolean(task.validate?.(answer));
    } catch {
      ok = false;
    }

    if (!ok) {
      setFeedback("bad", "Пока нет. Проверь DevTools ещё раз и попробуй снова.");
      return;
    }

    setFeedback("good", "Верно. Открываю следующее задание…");
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
      const task = TASKS[state.index];
      try {
        task?.setup?.();
      } catch {
      }
      setFeedback("", "Шаг подготовлен. Теперь смотри DevTools.");
    });

    els.resetProgress.addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEY);
      state.index = 0;
      render();
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

  loadProgress();
  wireUi();
  render();
  registerSw();
})();

