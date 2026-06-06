(function (global) {
  "use strict";

  var UFA_TZ = "Asia/Yekaterinburg";
  var UFA_LAT = 54.4847;
  var UFA_LON = 55.8825;
  var DAY_MS = 24 * 60 * 60 * 1000;
  var MINUTE_MS = 60 * 1000;
  var MAX_RANGE_DAYS = 35;
  var SYNODIC_MONTH_DAYS = 29.530588853;

  function formatDateRu(date) {
    return new Intl.DateTimeFormat("ru-RU", {
      timeZone: UFA_TZ,
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  }

  function formatTimeRu(date) {
    return new Intl.DateTimeFormat("ru-RU", {
      timeZone: UFA_TZ,
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  function mapPhaseToRu(fraction, phase) {
    if (fraction == null || isNaN(fraction)) {
      return "Луна";
    }

    if (fraction < 0.02) {
      return "Новолуние";
    }

    if (fraction > 0.98) {
      return "Полнолуние";
    }

    if (fraction >= 0.48 && fraction <= 0.52 && typeof phase === "number") {
      if (phase < 0.5) {
        return "Первая четверть";
      }
      if (phase > 0.5) {
        return "Последняя четверть";
      }
    }

    if (typeof phase === "number") {
      if (phase > 0 && phase < 0.5) {
        return "Растущая луна";
      }
      if (phase > 0.5 && phase < 1) {
        return "Убывающая луна";
      }
    }

    return "Луна";
  }

  function getMoonShapeKeyFromFraction(fraction) {
    if (fraction == null || isNaN(fraction)) {
      return "full";
    }
    if (fraction < 0.02) {
      return "crescent";
    }
    if (fraction < 0.48) {
      return "crescent";
    }
    if (fraction <= 0.52) {
      return "half";
    }
    if (fraction < 0.98) {
      return "waning";
    }
    return "full";
  }

  function getMoonIlluminationSafe(date) {
    if (
      !global.SunCalc ||
      typeof global.SunCalc.getMoonIllumination !== "function"
    ) {
      return null;
    }
    return global.SunCalc.getMoonIllumination(date);
  }

  var NEW_MOON_SEARCH_DAYS = 70;
  var NEW_MOON_FRACTION_THRESHOLD = 0.02;

  function findLastNewMoon(aroundDate) {
    if (!(aroundDate instanceof Date) || isNaN(aroundDate.getTime())) {
      return aroundDate;
    }
    var illum = getMoonIlluminationSafe(aroundDate);
    if (!illum) {
      return aroundDate;
    }

    var candidateDay = null;
    var targetTime = aroundDate.getTime();

    for (var i = 0; i <= NEW_MOON_SEARCH_DAYS; i++) {
      var day = new Date(targetTime - i * DAY_MS);
      var dayIllum = getMoonIlluminationSafe(day);
      if (!dayIllum) {
        continue;
      }
      if (dayIllum.fraction < NEW_MOON_FRACTION_THRESHOLD) {
        candidateDay = day;
        break;
      }
    }

    if (!candidateDay) {
      var phase = typeof illum.phase === "number" ? illum.phase : 0;
      var ageDays = phase * SYNODIC_MONTH_DAYS;
      var rough = new Date(targetTime - ageDays * DAY_MS);
      candidateDay = rough;
    }

    var left = new Date(candidateDay.getTime() - DAY_MS);
    var right = new Date(candidateDay.getTime() + DAY_MS);
    if (right.getTime() > aroundDate.getTime()) {
      right = new Date(aroundDate.getTime());
    }

    for (var j = 0; j < 40; j++) {
      var span = right.getTime() - left.getTime();
      if (span <= MINUTE_MS) {
        break;
      }
      var mid1 = new Date(left.getTime() + span / 3);
      var mid2 = new Date(right.getTime() - span / 3);
      var f1Ill = getMoonIlluminationSafe(mid1);
      var f2Ill = getMoonIlluminationSafe(mid2);
      var f1 = f1Ill ? f1Ill.fraction : 1;
      var f2 = f2Ill ? f2Ill.fraction : 1;

      if (f1 < f2) {
        right = mid2;
      } else {
        left = mid1;
      }
    }

    var result = new Date((left.getTime() + right.getTime()) / 2);
    if (result.getTime() > aroundDate.getTime()) {
      return aroundDate;
    }
    return result;
  }

  function findNextNewMoon(aroundDate) {
    if (!(aroundDate instanceof Date) || isNaN(aroundDate.getTime())) {
      return aroundDate;
    }
    var illum = getMoonIlluminationSafe(aroundDate);
    if (!illum) {
      return aroundDate;
    }

    var phase = typeof illum.phase === "number" ? illum.phase : 0;
    var daysToNext = (1 - phase) * SYNODIC_MONTH_DAYS;
    var rough = new Date(aroundDate.getTime() + daysToNext * DAY_MS);

    var left = new Date(rough.getTime() - 2 * DAY_MS);
    if (left.getTime() < aroundDate.getTime()) {
      left = new Date(aroundDate.getTime());
    }
    var right = new Date(rough.getTime() + 2 * DAY_MS);

    for (var i = 0; i < 40; i++) {
      var span = right.getTime() - left.getTime();
      if (span <= MINUTE_MS) {
        break;
      }
      var mid1 = new Date(left.getTime() + span / 3);
      var mid2 = new Date(right.getTime() - span / 3);
      var f1Ill = getMoonIlluminationSafe(mid1);
      var f2Ill = getMoonIlluminationSafe(mid2);
      var f1 = f1Ill ? f1Ill.fraction : 1;
      var f2 = f2Ill ? f2Ill.fraction : 1;

      if (f1 < f2) {
        right = mid2;
      } else {
        left = mid1;
      }
    }

    return new Date((left.getTime() + right.getTime()) / 2);
  }

  function findMoonRiseBefore(date) {
    if (
      !global.SunCalc ||
      typeof global.SunCalc.getMoonTimes !== "function"
    ) {
      return null;
    }

    var targetTime = date.getTime();
    for (var i = 0; i <= MAX_RANGE_DAYS; i++) {
      var day = new Date(targetTime - i * DAY_MS);
      var times = global.SunCalc.getMoonTimes(day, UFA_LAT, UFA_LON, true);
      if (times.alwaysUp || times.alwaysDown) {
        continue;
      }
      if (times.rise && !isNaN(times.rise.getTime())) {
        var riseTime = times.rise.getTime();
        if (riseTime < targetTime) {
          return new Date(riseTime);
        }
      }
    }
    return null;
  }

  function findMoonRiseAfter(date) {
    if (
      !global.SunCalc ||
      typeof global.SunCalc.getMoonTimes !== "function"
    ) {
      return null;
    }

    var targetTime = date.getTime();
    for (var i = 0; i <= MAX_RANGE_DAYS; i++) {
      var day = new Date(targetTime + i * DAY_MS);
      var times = global.SunCalc.getMoonTimes(day, UFA_LAT, UFA_LON, true);
      if (times.alwaysUp || times.alwaysDown) {
        continue;
      }
      if (times.rise && !isNaN(times.rise.getTime())) {
        var riseTime = times.rise.getTime();
        if (riseTime > targetTime) {
          return new Date(riseTime);
        }
      }
    }
    return null;
  }

  function getLunarDayNumberForMoment(moment) {
    if (!(moment instanceof Date) || isNaN(moment.getTime())) {
      return null;
    }
    if (!global.SunCalc) {
      return null;
    }

    var lastNew = findLastNewMoon(moment);
    if (!(lastNew instanceof Date) || isNaN(lastNew.getTime())) {
      return null;
    }

    var startDay = new Date(lastNew.getTime());
    startDay.setHours(0, 0, 0, 0);
    var limitTime = moment.getTime();
    var lastNewTime = lastNew.getTime();
    var rises = 0;

    for (var i = 0; i <= MAX_RANGE_DAYS; i++) {
      var day = new Date(startDay.getTime() + i * DAY_MS);
      if (day.getTime() > limitTime + DAY_MS) {
        break;
      }
      var times = global.SunCalc.getMoonTimes(day, UFA_LAT, UFA_LON, true);
      if (times.alwaysUp || times.alwaysDown) {
        continue;
      }
      if (times.rise && !isNaN(times.rise.getTime())) {
        var rt = times.rise.getTime();
        if (rt > lastNewTime && rt <= limitTime) {
          rises++;
        }
      }
    }

    if (rises === 0) {
      return 1; // first lunar day (from new moon until first moonrise)
    }
    return rises + 1; // subsequent days: after N moonrises we are in day N+1
  }

  /**
   * Returns lunar day info for the given offset from the current moment.
   * offset 0 = current lunar day (ongoing now)
   * offset -1 = previous lunar day, -2 = two days back, etc.
   * offset +1 = next lunar day, +2 = two days ahead, etc.
   * Boundaries are defined by moonrise times (Ufa).
   */
  function getLunarInfoForOffset(offset) {
    var now = new Date();

    if (!global.SunCalc) {
      return {
        date: now,
        dateLabel: formatDateRu(now),
        lunarDay: null,
        lunarMonth: null,
        phaseNameRu: "Недоступно",
        phaseKey: "full",
        yueXiang: "",
        startDateTime: now,
        endDateTime: new Date(now.getTime() + DAY_MS),
        latitude: UFA_LAT,
        longitude: UFA_LON,
        timeZone: UFA_TZ,
      };
    }

    var currentStart = findMoonRiseBefore(now);
    var currentEnd = findMoonRiseAfter(now);
    if (!currentStart) currentStart = now;
    if (!currentEnd) currentEnd = new Date(now.getTime() + DAY_MS);

    var start;
    var end;
    var dayNumber;
    var displayDate;

    if (offset === 0) {
      start = currentStart;
      end = currentEnd;
      dayNumber = getLunarDayNumberForMoment(now);
      displayDate = now;
    } else if (offset < 0) {
      var steps = -offset;
      var boundary = currentStart;
      for (var i = 0; i < steps && boundary; i++) {
        boundary = findMoonRiseBefore(boundary);
      }
      if (!boundary) boundary = currentStart;
      start = boundary;
      end = steps === 1 ? currentStart : findMoonRiseAfter(boundary);
      if (!end) end = new Date(start.getTime() + DAY_MS);
      dayNumber = getLunarDayNumberForMoment(start);
      displayDate = start;
    } else {
      var steps = offset;
      var boundary = currentEnd;
      for (var i = 0; i < steps && boundary; i++) {
        boundary = findMoonRiseAfter(boundary);
      }
      if (!boundary) boundary = currentEnd;
      start = steps === 1 ? currentEnd : findMoonRiseBefore(boundary);
      if (!start) start = boundary;
      end = boundary;
      dayNumber = getLunarDayNumberForMoment(start);
      displayDate = start;
    }

    var midMoment = new Date((start.getTime() + end.getTime()) / 2);
    var illum = getMoonIlluminationSafe(midMoment);
    var fraction = illum ? illum.fraction : null;
    var phase = illum ? illum.phase : null;
    var phaseNameRu = mapPhaseToRu(fraction, phase);
    var phaseKey = getMoonShapeKeyFromFraction(fraction);

    return {
      date: displayDate,
      dateLabel: formatDateRu(displayDate),
      lunarDay: dayNumber != null ? dayNumber : null,
      lunarMonth: null,
      phaseNameRu: phaseNameRu,
      phaseKey: phaseKey,
      yueXiang: "",
      startDateTime: start,
      endDateTime: end,
      latitude: UFA_LAT,
      longitude: UFA_LON,
      timeZone: UFA_TZ,
    };
  }

  function getTodayInfo() {
    return getLunarInfoForOffset(0);
  }

  function getOffsetInfo(offset) {
    return getLunarInfoForOffset(offset);
  }

  global.BroMoonLunar = {
    getTodayInfo: getTodayInfo,
    getOffsetInfo: getOffsetInfo,
    formatDateRu: formatDateRu,
    formatTimeRu: formatTimeRu,
  };
})(typeof window !== "undefined" ? window : this);

