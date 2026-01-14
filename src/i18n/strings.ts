export type Lang = "en" | "ru";

export const ui = {
  start: { en: "Start", ru: "Старт" },
  pause: { en: "Pause", ru: "Пауза" },
  continue: { en: "Continue", ru: "Продолжить" },
  preparing: { en: "Preparing...", ru: "Готовимся..." },
  inProgress: { en: "In progress...", ru: "В процессе..." },
  paused: { en: "Paused", ru: "На паузе" },
  otherPractices: { en: "Other practices", ru: "Другие практики" },
  practiceNotFound: { en: "Practice not found", ru: "Практика не найдена" },
  backToList: { en: "Back to list", ru: "К списку" },
  cycle: { en: "Cycle", ru: "Цикл" },
  of: { en: "of", ru: "из" },
  meditation: { en: "Meditation", ru: "Медитация" },
  breathing: { en: "Breathing", ru: "Дыхание" },
  sleep: { en: "Sleep", ru: "Сон" },
  today: { en: "Today", ru: "Сегодня" },
  practices: { en: "Practices", ru: "Практики" },
  game: { en: "Game", ru: "Игра" },
  inhale: { en: "Inhale", ru: "Вдох" },
  exhale: { en: "Exhale", ru: "Выдох" },
  hold: { en: "Hold", ru: "Пауза" },
  practiceFinished: { en: "Practice finished", ru: "Практика закончилась" },
  greatJob: { en: "Great work!", ru: "Отличная работа!" },
} as const;

export type UiKey = keyof typeof ui;

export function tUI(key: UiKey, lang: Lang) {
  return ui[key][lang];
}
