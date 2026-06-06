(function () {
  "use strict";

  var MIN_OFFSET = -1000;
  var MAX_OFFSET = 1000;

  var state = {
    offset: 0,
  };

  function $(id) {
    return document.getElementById(id);
  }

  var elDay = $("lunar-day");
  var elPhaseShort = $("lunar-phase");
  var elPhaseName = $("phase-name");
  var elStart = $("start-time");
  var elEnd = $("end-time");
  var elDate = $("current-date");
  var elContextLabel = $("day-context-label");
  var elPrev = $("prev-day");
  var elNext = $("next-day");
  var elHero = $("hero");
  var elMoonShape = document.getElementById("moon-shape");
  var elHaircut = $("haircut-description");
  var elHaircutCard = $("haircut-card");

  // Haircut recommendations by lunar day (1–30), Russian text as provided
  var haircutDescriptions = {
    1: "1-ый лунный день — стрижка волос ведёт к сокращению жизни.",
    2: "2-ой лунный день — стрижка волос привлечёт к вам ссоры и тяжбы.",
    3: "3-ий лунный день — стрижка волос приведёт к ущербу для организма и может привлечь растраты.",
    4: "4-ый лунный день — стрижка принесёт дискомфорт, тоску, страх потери близких. Возможны болезни горла и полости рта.",
    5: "5-ый лунный день — стрижка волос приведёт к увеличению собственности, вы станете немного богаче.",
    6: "6-ой лунный день — стричь волосы нежелательно: привлечёте простуду, ухудшится обоняние, будете выглядеть и чувствовать себя больным.",
    7: "7-ой лунный день — стрижка привлечёт ссоры, конфликты с начальством или любимым человеком. Сжигающий день по тибетскому календарю — стрижка серьёзно ухудшит здоровье.",
    8: "8-ой лунный день — стрижка привлечёт долголетие, хорошее здоровье и сделает вашу жизнь достойной в глазах окружающих (в ближайшие месяцы).",
    9: "9-ый лунный день — стрижка волос привлекает болезни.",
    10: "10-ый лунный день — сжигающий день, рекомендуется воздержаться от стрижки, чтобы не привлечь болезни.",
    11: "11-ый лунный день — стрижка принесёт остроту чувств, увеличит способности к предвидению и проницательность ума.",
    12: "12-ый лунный день — стричь волосы нельзя: привлекаются несчастья, травмы, повышается вероятность угрозы для жизни.",
    13: "13-ый лунный день — желательно стричься: стрижка принесёт счастье, пользу и красивый внешний вид.",
    14: "14-ый лунный день — стрижка привлечёт улучшение деятельности, финансового положения, увеличение собственности и благорасположение начальства.",
    15: "15-ый лунный день — безопаснее воздержаться от стрижки: возможны нарушения психики, повышение давления, головные боли, чувство страха.",
    16: "16-ый лунный день — лучше от стрижки воздержаться: возникнут несчастья, ошибки. Проявятся негативные привычки, возрастёт тяга к алкоголю. Стрижка может привлечь измену и ухудшение здоровья.",
    17: "17-ый лунный день — в результате стрижки появятся препятствия в делах, возникнут болезни. Высока вероятность травмы. Пострадает психика.",
    18: "18-ый лунный день — стрижка приведёт к потере собственности, кражам, болезням домашних животных. Сжигающий день — стрижка принесёт серьёзное ухудшение здоровья.",
    19: "19-ый лунный день — следует обратиться к парикмахеру: стрижка волос продляет жизнь.",
    20: "20-ый лунный день — стричь волосы нежелательно, возникнет «отвращение» к жизни.",
    21: "21-ый лунный день — желательно стричь волосы: привлечёте красоту и благополучие.",
    22: "22-ой лунный день — стрижка привлечёт возможность приобретения собственности, но возможен набор лишнего веса.",
    23: "23-ий лунный день — стрижка принесёт красивый цвет лица, улучшит финансовое состояние.",
    24: "24-ый лунный день — очень плохой день для стрижки: могут появиться болезни. Хотите быть здоровыми — воздержитесь.",
    25: "25-ый лунный день — стрижка увеличит глазное давление, приведёт к ухудшению зрения, обострению глазных болезней.",
    26: "26-ой лунный день — в результате стрижки или создания прически вы привлечёте к себе радость и счастье.",
    27: "27-ой лунный день — в результате стрижки или создания прически вы привлечёте к себе радость и счастье.",
    28: "28-ой лунный день — в результате стрижки возрастёт очарование внешнего облика, вы будете нравиться людям.",
    29: "29-ый лунный день — в результате стрижки теряется энергия человека, «можно ум состричь».",
    30: "30-ый лунный день — стрижка может привлечь угрозу встречи с несчастьем, врагом и даже смерть. Также существует вероятность привлечения авто-аварии.",
  };

  var favorableDays = [5, 8, 11, 13, 14, 19, 21, 22, 23, 26, 27, 28];

  function updateMoonShape(key) {
    if (!elMoonShape) return;
    elMoonShape.classList.remove(
      "moon-shape--crescent",
      "moon-shape--half",
      "moon-shape--full",
      "moon-shape--waning"
    );
    var className = "moon-shape--" + (key || "full");
    elMoonShape.classList.add(className);
  }

  function applyFadeSwap(root) {
    if (!root) return;

    var nodes = root.querySelectorAll
      ? root.querySelectorAll(".fade-swap")
      : [];

    nodes.forEach(function (node) {
      node.classList.remove("fade-swap--visible");
      void node.offsetWidth;
      requestAnimationFrame(function () {
        node.classList.add("fade-swap--visible");
      });
    });
  }

  function getContextLabel(offset) {
    if (offset === 0) return "Сегодня";
    if (offset === -1) return "Вчера";
    if (offset === 1) return "Завтра";
    if (offset < 0) return "−" + (-offset);
    return "+" + offset;
  }

  function updateView() {
    var offset = state.offset;

    var info =
      window.BroMoonLunar && typeof window.BroMoonLunar.getOffsetInfo === "function"
        ? window.BroMoonLunar.getOffsetInfo(offset)
        : null;

    if (!info) {
      return;
    }

    var dateLabel =
      window.BroMoonLunar && typeof window.BroMoonLunar.formatDateRu === "function"
        ? window.BroMoonLunar.formatDateRu(info.date)
        : "";

    var startStr = "";
    var endStr = "";

    if (
      window.BroMoonLunar &&
      typeof window.BroMoonLunar.formatTimeRu === "function" &&
      typeof window.BroMoonLunar.formatDateRu === "function"
    ) {
      var startTime = window.BroMoonLunar.formatTimeRu(info.startDateTime);
      var startDate = window.BroMoonLunar.formatDateRu(info.startDateTime);
      var endTime = window.BroMoonLunar.formatTimeRu(info.endDateTime);
      var endDate = window.BroMoonLunar.formatDateRu(info.endDateTime);

      startStr = startTime && startDate ? startTime + " " + startDate : startTime;
      endStr = endTime && endDate ? endTime + " " + endDate : endTime;
    }

    var weekday =
      info && info.timeZone
        ? new Intl.DateTimeFormat("ru-RU", {
            weekday: "short",
            timeZone: info.timeZone,
          }).format(info.date)
        : "";

    if (elDate) {
      elDate.textContent = weekday
        ? dateLabel + ", " + weekday
        : dateLabel;
    }
    if (elDay) elDay.textContent = info.lunarDay != null ? String(info.lunarDay) : "—";
    if (elPhaseShort)
      elPhaseShort.textContent =
        info.lunarDay != null ? "Лунный день " + info.lunarDay : "Лунный день";
    if (elPhaseName) elPhaseName.textContent = info.phaseNameRu || "—";
    if (elStart) elStart.textContent = startStr || "—";
    if (elEnd) elEnd.textContent = endStr || "—";
    if (elContextLabel) elContextLabel.textContent = getContextLabel(offset);

    if (elHero && elHero.parentElement) {
      if (offset === 0) {
        elHero.parentElement.classList.add("is-today");
      } else {
        elHero.parentElement.classList.remove("is-today");
      }
    }

    updateMoonShape(info.phaseKey);

    // Haircut recommendation: text from lunar day, color from favorability
    var lunarDay = info.lunarDay;
    var haircutText =
      lunarDay != null && haircutDescriptions[lunarDay]
        ? haircutDescriptions[lunarDay]
        : "—";
    if (elHaircut) elHaircut.textContent = haircutText;
    if (elHaircutCard) {
      elHaircutCard.classList.remove("haircut-card--favorable", "haircut-card--unfavorable");
      if (lunarDay != null) {
        if (favorableDays.indexOf(lunarDay) !== -1) {
          elHaircutCard.classList.add("haircut-card--favorable");
        } else {
          elHaircutCard.classList.add("haircut-card--unfavorable");
        }
      }
    }

    applyFadeSwap(document);

    if (elPrev) elPrev.disabled = offset <= MIN_OFFSET;
    if (elNext) elNext.disabled = offset >= MAX_OFFSET;
  }

  function changeOffset(delta) {
    var next = state.offset + delta;
    if (next < MIN_OFFSET) next = MIN_OFFSET;
    if (next > MAX_OFFSET) next = MAX_OFFSET;
    if (next === state.offset) return;
    state.offset = next;
    updateView();
  }

  function initFadeSwap() {
    var elements = [
      elDay,
      elPhaseShort,
      elPhaseName,
      elStart,
      elEnd,
      elContextLabel,
      elHaircut,
    ].filter(Boolean);

    elements.forEach(function (node) {
      node.classList.add("fade-swap");
      requestAnimationFrame(function () {
        node.classList.add("fade-swap--visible");
      });
    });
  }

  function initEvents() {
    if (elPrev) {
      elPrev.addEventListener("click", function () {
        changeOffset(-1);
      });
    }
    if (elNext) {
      elNext.addEventListener("click", function () {
        changeOffset(1);
      });
    }
  }

  function init() {
    initFadeSwap();
    initEvents();
    updateView();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

    // ============================================
  // Блок сверки с mirkosmosa.ru
  // ============================================
  
  // URL вашего Cloudflare Worker
  const VERIFY_WORKER_URL = 'https://bromoon.batyr1580.workers.dev';
  
  let verifyLoading = false;
  
  const verifyTodayEl = document.getElementById('verify-today');
  const verifyTomorrowEl = document.getElementById('verify-tomorrow');
  const verifyStatusEl = document.getElementById('verify-status');
  const verifyRefreshBtn = document.getElementById('verify-refresh');
  
  async function loadVerifyData() {
    if (verifyLoading) return;
    verifyLoading = true;
    
    if (verifyTodayEl) verifyTodayEl.textContent = 'Загрузка...';
    if (verifyTomorrowEl) verifyTomorrowEl.textContent = 'Загрузка...';
    if (verifyStatusEl) {
      verifyStatusEl.textContent = '⏳ Запрос...';
      verifyStatusEl.className = 'verify-item__value verify-item__value--loading';
    }
    
    try {
      const response = await fetch(VERIFY_WORKER_URL);
      const data = await response.json();
      
      if (data.success) {
        if (verifyTodayEl) {
          verifyTodayEl.textContent = data.today || '—';
          verifyTodayEl.className = 'verify-item__value';
        }
        if (verifyTomorrowEl) {
          verifyTomorrowEl.textContent = data.tomorrow || '—';
          verifyTomorrowEl.className = 'verify-item__value';
        }
        if (verifyStatusEl) {
          const timestamp = data.timestamp ? new Date(data.timestamp).toLocaleTimeString('ru-RU') : '';
          verifyStatusEl.textContent = `✅ Успешно ${timestamp ? 'в ' + timestamp : ''}`;
          verifyStatusEl.className = 'verify-item__value verify-item__value--success';
        }
      } else {
        throw new Error(data.error || 'Неизвестная ошибка');
      }
    } catch (error) {
      console.error('Ошибка загрузки данных с verify worker:', error);
      if (verifyTodayEl) verifyTodayEl.textContent = '❌ Ошибка';
      if (verifyTomorrowEl) verifyTomorrowEl.textContent = '❌ Недоступно';
      if (verifyStatusEl) {
        verifyStatusEl.textContent = `⚠️ ${error.message || 'Ошибка соединения'}`;
        verifyStatusEl.className = 'verify-item__value verify-item__value--error';
      }
    } finally {
      verifyLoading = false;
    }
  }
  
  // Загружаем данные при старте (с небольшой задержкой, чтобы не мешать основному)
  if (verifyTodayEl && verifyTomorrowEl) {
    setTimeout(loadVerifyData, 500);
    
    // Обновляем раз в 10 минут
    setInterval(loadVerifyData, 10 * 60 * 1000);
  }
  
  // Кнопка обновления
  if (verifyRefreshBtn) {
    verifyRefreshBtn.addEventListener('click', function(e) {
      e.preventDefault();
      loadVerifyData();
    });
  }
})();

