import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/home.css";
import { useLang } from "../i18n/lang";

type Emotion = "joyful" | "good" | "so-so" | "anxious" | "sad" | "bad";

type TelegramUser = {
  first_name?: string;
  last_name?: string;
  photo_url?: string;
};

type DisplayUser = {
  name: string;
  photoUrl?: string;
  avatarSeed: number;
  isGuest: boolean;
};

const EMOTIONS: Emotion[] = ["joyful", "good", "so-so", "anxious", "sad", "bad"];

const STORAGE_KEY = "spokspaceEmotions";
const GUEST_KEY = "spokspaceGuestProfile";

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function parseDateKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m, d);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getMonthNames(lang: "en" | "ru") {
  return lang === "ru"
    ? [
        "Январь",
        "Февраль",
        "Март",
        "Апрель",
        "Май",
        "Июнь",
        "Июль",
        "Август",
        "Сентябрь",
        "Октябрь",
        "Ноябрь",
        "Декабрь",
      ]
    : [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
}

function formatSelectedDate(date: Date, lang: "en" | "ru") {
  const dayNames =
    lang === "ru"
      ? ["ВОСКРЕСЕНЬЕ", "ПОНЕДЕЛЬНИК", "ВТОРНИК", "СРЕДА", "ЧЕТВЕРГ", "ПЯТНИЦА", "СУББОТА"]
      : ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

  const monthNames =
    lang === "ru"
      ? [
          "ЯНВАРЯ",
          "ФЕВРАЛЯ",
          "МАРТА",
          "АПРЕЛЯ",
          "МАЯ",
          "ИЮНЯ",
          "ИЮЛЯ",
          "АВГУСТА",
          "СЕНТЯБРЯ",
          "ОКТЯБРЯ",
          "НОЯБРЯ",
          "ДЕКАБРЯ",
        ]
      : [
          "JANUARY",
          "FEBRUARY",
          "MARCH",
          "APRIL",
          "MAY",
          "JUNE",
          "JULY",
          "AUGUST",
          "SEPTEMBER",
          "OCTOBER",
          "NOVEMBER",
          "DECEMBER",
        ];

  const dayName = dayNames[date.getDay()];
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  if (lang === "ru") {
    return `${dayName}, ${day} ${month} ${year} Г.`;
  }
  return `${dayName}, ${month} ${day}, ${year}`;
}

export default function Home() {
  const { lang } = useLang();

  const strings = useMemo(() => {
    return lang === "ru"
      ? {
          welcome: "Добро пожаловать!",
          feeling: "Как ты себя чувствуешь?",
          calmThoughts: "Успокоить мысли",
          reduceStress: "Снизить стресс",
          improveSleep: "Улучшить сон",
          meditation: "Медитация",
          breathing: "Дыхание",
          sleep: "Сон",
          emotions: {
            joyful: "Радостно",
            good: "Хорошо",
            "so-so": "Так себе",
            anxious: "Тревожно",
            sad: "Грустно",
            bad: "Плохо",
          } as Record<Emotion, string>,
          weekdays: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
        }
      : {
          welcome: "Welcome!",
          feeling: "How are you feeling?",
          calmThoughts: "Calm thoughts",
          reduceStress: "Reduce stress",
          improveSleep: "Improve sleep",
          meditation: "Meditation",
          breathing: "Breathing",
          sleep: "Sleep",
          emotions: {
            joyful: "Joyful",
            good: "Good",
            "so-so": "So-so",
            anxious: "Anxious",
            sad: "Sad",
            bad: "Bad",
          } as Record<Emotion, string>,
          weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        };
  }, [lang]);

  const [user, setUser] = useState<DisplayUser | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [emotions, setEmotions] = useState<Record<string, Emotion>>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    try {
      return JSON.parse(raw) as Record<string, Emotion>;
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready?.();
      tg.setHeaderColor?.("#212121");
      tg.setBackgroundColor?.("#212121");
      tg.expand?.();
      tg.enableClosingConfirmation?.();
      tg.BackButton?.hide?.();
      tg.MainButton?.hide?.();
      const tgUser = tg.initDataUnsafe?.user as TelegramUser | undefined;
      if (tgUser) {
        const name = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ");
        setUser({
          name: name || "User",
          photoUrl: tgUser.photo_url,
          avatarSeed: 0,
          isGuest: false,
        });
        return;
      }
    }

    const raw = localStorage.getItem(GUEST_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as DisplayUser;
        setUser(parsed);
        return;
      } catch {
        localStorage.removeItem(GUEST_KEY);
      }
    }

    const seed = Math.floor(Math.random() * 6);
    const guestProfile: DisplayUser = {
      name: "User",
      avatarSeed: seed,
      isGuest: true,
    };
    localStorage.setItem(GUEST_KEY, JSON.stringify(guestProfile));
    setUser(guestProfile);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(emotions));
  }, [emotions]);

  useEffect(() => {
    document.body.classList.toggle("modal-open", Boolean(selectedDateKey));
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [selectedDateKey]);

  const { displayDate, daysToShow } = useMemo(() => {
    const today = new Date();
    let displayDate = new Date();
    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    if (isExpanded) {
      displayDate = new Date(today.getFullYear(), today.getMonth() + currentMonthOffset, 1);
      const year = displayDate.getFullYear();
      const month = displayDate.getMonth();

      const firstDayOfMonth = new Date(year, month, 1);
      const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
      const startDate = new Date(firstDayOfMonth);
      startDate.setDate(startDate.getDate() - startOffset);

      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        days.push({ date, isCurrentMonth: date.getMonth() === month });
      }
    } else {
      displayDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + currentWeekOffset * 7,
      );
      const currentDayOfWeek = (displayDate.getDay() + 6) % 7;
      const mondayOfCurrentWeek = new Date(displayDate);
      mondayOfCurrentWeek.setDate(displayDate.getDate() - currentDayOfWeek);

      const mondayOfPreviousWeek = new Date(mondayOfCurrentWeek);
      mondayOfPreviousWeek.setDate(mondayOfCurrentWeek.getDate() - 7);

      for (let i = 0; i < 14; i++) {
        const date = new Date(mondayOfPreviousWeek);
        date.setDate(mondayOfPreviousWeek.getDate() + i);
        days.push({ date, isCurrentMonth: true });
      }
    }

    return { displayDate, daysToShow: days };
  }, [currentMonthOffset, currentWeekOffset, isExpanded]);

  const currentMonthLabel = useMemo(() => {
    const monthNames = getMonthNames(lang);
    return `${monthNames[displayDate.getMonth()]} ${displayDate.getFullYear()}`;
  }, [displayDate, lang]);

  const today = useMemo(() => new Date(), []);
  const endOfToday = useMemo(() => {
    const date = new Date();
    date.setHours(23, 59, 59, 999);
    return date;
  }, []);

  const selectedDateLabel = selectedDateKey
    ? formatSelectedDate(parseDateKey(selectedDateKey), lang)
    : "";

  function handlePrev() {
    if (isExpanded) {
      setCurrentMonthOffset((value) => value - 1);
    } else {
      setCurrentWeekOffset((value) => value - 1);
    }
  }

  function handleNext() {
    if (isExpanded) {
      setCurrentMonthOffset((value) => value + 1);
    } else {
      setCurrentWeekOffset((value) => value + 1);
    }
  }

  function handleToggleCalendar() {
    setIsExpanded((value) => !value);
  }

  function handleEmotionSelect(emotion: Emotion) {
    if (!selectedDateKey) return;
    setEmotions((prev) => {
      const next = { ...prev };
      if (next[selectedDateKey] === emotion) {
        delete next[selectedDateKey];
      } else {
        next[selectedDateKey] = emotion;
      }
      return next;
    });
    setSelectedDateKey(null);
  }

  const userName = user?.name ?? "User";
  const userInitial = user?.name?.charAt(0)?.toUpperCase() ?? "U";

  return (
    <div className="home">
      <div className="home-inner">
        <div className="today__logo">
          <Link to="/profile" className="today__user">
            <div
              className={`today__avatar${user?.isGuest ? ` today__avatar--seed-${user.avatarSeed}` : ""}`}
            >
              {user?.photoUrl ? (
                <img src={user.photoUrl} alt={userName} />
              ) : (
                <div className="today__avatar-placeholder">{userInitial}</div>
              )}
            </div>
            <div className="today__name">{userName}</div>
          </Link>
        </div>

        <div className="today__intro">
          <div className="today__welcome">{strings.welcome}</div>
          <div className="today__title">{strings.feeling}</div>
        </div>

        <div className="today__calendar">
          <div
            className={`today__calendar-card${isExpanded ? " today__calendar-card--expanded" : ""}`}
          >
            <div className="today__calendar-header">
              <button
                className="today__month-nav"
                type="button"
                onClick={handlePrev}
                aria-label="Previous"
              >
                ‹
              </button>
              <button className="today__month-display" type="button" onClick={handleToggleCalendar}>
                <div className="today__current-month">{currentMonthLabel}</div>
                <img
                  src="/img/arrow.svg"
                  className={`today__expand-icon${isExpanded ? " expanded" : ""}`}
                  alt=""
                />
              </button>
              <button
                className="today__month-nav"
                type="button"
                onClick={handleNext}
                aria-label="Next"
              >
                ›
              </button>
            </div>

            <div className="today__weekdays">
              {strings.weekdays.map((label) => (
                <div key={label} className="today__weekday">
                  {label}
                </div>
              ))}
            </div>

            <div className="today__days">
              {daysToShow.map((day, idx) => {
                if (isExpanded && !day.isCurrentMonth) {
                  return <div key={`empty-${idx}`} className="today__day empty" />;
                }

                const key = formatDateKey(day.date);
                const emotion = emotions[key];
                const isToday = isSameDay(day.date, today);
                const dateWithoutTime = new Date(day.date);
                dateWithoutTime.setHours(0, 0, 0, 0);
                const isFuture = dateWithoutTime > endOfToday;

                return (
                  <button
                    key={key}
                    type="button"
                    className={`today__day${isToday ? " today" : ""}${emotion ? ` has-emotion emotion-${emotion}` : ""}${isFuture ? " future" : ""}`}
                    onClick={() => {
                      if (!isFuture) setSelectedDateKey(key);
                    }}
                    aria-label={key}
                  >
                    <div className="today__day-emotion" />
                    <div className="today__day-number">{day.date.getDate()}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="today__cards">
          <Link to="/practice/pause" className="today__card">
            <img src="/img/mind.jpg" alt={strings.calmThoughts} />
            <div className="today__card-content">
              <div className="today__card-title">{strings.calmThoughts}</div>
              <div className="today__card-subtitle">{strings.meditation}</div>
            </div>
            <img className="today__card-arrow" src="/img/arrow.svg" alt="" />
          </Link>

          <Link to="/practice/478" className="today__card">
            <img src="/img/breathing.jpg" alt={strings.reduceStress} />
            <div className="today__card-content">
              <div className="today__card-title">{strings.reduceStress}</div>
              <div className="today__card-subtitle">{strings.breathing}</div>
            </div>
            <img className="today__card-arrow" src="/img/arrow.svg" alt="" />
          </Link>

          <Link to="/practice/stars" className="today__card">
            <img src="/img/sleep.jpg" alt={strings.improveSleep} />
            <div className="today__card-content">
              <div className="today__card-title">{strings.improveSleep}</div>
              <div className="today__card-subtitle">{strings.sleep}</div>
            </div>
            <img className="today__card-arrow" src="/img/arrow.svg" alt="" />
          </Link>
        </div>

        {selectedDateKey && (
          <div className="mood-overlay" role="dialog" aria-modal="true">
            <div className="mood-modal">
              <div className="mood-modal__header">
                <div className="mood-modal__title">{selectedDateLabel}</div>
                <button
                  className="mood-modal__close"
                  type="button"
                  onClick={() => setSelectedDateKey(null)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="mood-grid">
                {EMOTIONS.map((emotion) => (
                  <button
                    key={emotion}
                    type="button"
                    className="mood-card"
                    data-emotion={emotion}
                    onClick={() => handleEmotionSelect(emotion)}
                  >
                    <div className="mood-card__icon" />
                    <div className="mood-card__label">{strings.emotions[emotion]}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
