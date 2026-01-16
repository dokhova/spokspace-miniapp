import type { Localized } from "../../i18n/pick";

export type PracticeCard = {
  slug: string;
  title: Localized;
  subtitle: Localized;
  image: string;
};

export type PracticeAudio = {
  ru: string;
  en: string;
};

export type BreathingAudio = {
  default: string;
};

export type BreathingConfig = {
  inhale: number;
  hold: number;
  exhale: number;
  hold2?: number;
  cycles: number;
};

export type BasePractice = {
  id: string;
  slug: string;
  tags: Localized[];
  title: Localized;
  subtitle: Localized;
  cardTitle?: Localized;
  cardSubtitle?: Localized;
  previewBg?: string;
  playerBackground?: string;
  finishedText?: Localized;
  praiseText?: Localized;
  other: PracticeCard[];
};

export type MeditationPractice = BasePractice & {
  kind: "meditation";
  audio: PracticeAudio;
};

export type BreathingPractice = BasePractice & {
  kind: "breathing";
  audio: BreathingAudio;
  breathing: BreathingConfig;
};

export type Practice = MeditationPractice | BreathingPractice;

export const practices: Record<string, Practice> = {
  pond: {
    id: "pond",
    slug: "pond",
    kind: "meditation",
    audio: {
      ru: "/audio/practices/pond/ru.mp3",
      en: "/audio/practices/pond/en.mp3",
    },
    tags: [
      { en: "MEDITATION", ru: "МЕДИТАЦИЯ" },
      { en: "THOUGHTS", ru: "МЫСЛИ" },
      { en: "2-3 MIN", ru: "2-3 МИН" },
    ],
    title: { en: "Leaves in the pond", ru: "Листья в пруду" },
    subtitle: {
      en: "Watch your thoughts like leaves on water — notice and let go",
      ru: "Наблюдайте за мыслями, как за листьями на воде — замечайте и отпускайте",
    },
    cardTitle: { en: "Leaves in the pond", ru: "Листья в пруду" },
    cardSubtitle: { en: "Working with thoughts", ru: "Работа с мыслями" },
    previewBg: "var(--green)",
    playerBackground: "var(--green)",
    finishedText: { en: "Meditation finished", ru: "Медитация закончилась" },
    praiseText: { en: "Great work!", ru: "Отличная работа!" },
    other: [
      {
        slug: "pause",
        title: { en: "Mindful pauses", ru: "Осознанные паузы" },
        subtitle: { en: "Attention switching", ru: "Переключение внимания" },
        image: "/img/pause.jpg",
      },
      {
        slug: "body",
        title: { en: "Body as anchor", ru: "Тело как якорь" },
        subtitle: { en: "Feeling of support", ru: "Ощущение опоры" },
        image: "/img/body.jpg",
      },
    ],
  },

  body: {
    id: "body",
    slug: "body",
    kind: "meditation",
    audio: {
      ru: "/audio/practices/body/ru.mp3",
      en: "/audio/practices/body/en.mp3",
    },
    tags: [
      { en: "MEDITATION", ru: "МЕДИТАЦИЯ" },
      { en: "ANCHOR", ru: "ОПОРА" },
      { en: "4-5 MIN", ru: "4-5 МИН" },
    ],
    title: { en: "Body as anchor", ru: "Тело как якорь" },
    subtitle: {
      en: "Focus on bodily sensations to find your grounding",
      ru: "Сфокусируйтесь на телесных ощущениях, чтобы обрести опору",
    },
    cardTitle: { en: "Body as anchor", ru: "Тело как якорь" },
    cardSubtitle: { en: "Feeling of support", ru: "Ощущение опоры" },
    previewBg: "var(--blue)",
    playerBackground: "var(--blue)",
    finishedText: { en: "Meditation finished", ru: "Медитация закончилась" },
    praiseText: { en: "Great work!", ru: "Отличная работа!" },
    other: [
      {
        slug: "pond",
        title: { en: "Leaves in the pond", ru: "Листья в пруду" },
        subtitle: { en: "Working with thoughts", ru: "Работа с мыслями" },
        image: "/img/pond.jpg",
      },
      {
        slug: "pause",
        title: { en: "Mindful pauses", ru: "Осознанные паузы" },
        subtitle: { en: "Attention switching", ru: "Переключение внимания" },
        image: "/img/pause.jpg",
      },
    ],
  },

  pause: {
    id: "pause",
    slug: "pause",
    kind: "meditation",
    audio: {
      ru: "/audio/practices/pause/ru.mp3",
      en: "/audio/practices/pause/en.mp3",
    },
    tags: [
      { en: "MEDITATION", ru: "МЕДИТАЦИЯ" },
      { en: "FOCUS", ru: "ФОКУС" },
      { en: "5 MIN", ru: "5 МИН" },
    ],
    title: { en: "Mindful pauses", ru: "Осознанные паузы" },
    subtitle: {
      en: "Stop for a moment to bring attention back to the present moment",
      ru: "Остановитесь на мгновение, чтобы вернуть внимание в настоящий момент",
    },
    cardTitle: { en: "Mindful pauses", ru: "Осознанные паузы" },
    cardSubtitle: { en: "Attention switching", ru: "Переключение внимания" },
    previewBg: "var(--yellow)",
    playerBackground: "var(--yellow)",
    finishedText: { en: "Meditation finished", ru: "Медитация закончилась" },
    praiseText: { en: "Great work!", ru: "Отличная работа!" },
    other: [
      {
        slug: "body",
        title: { en: "Body as anchor", ru: "Тело как якорь" },
        subtitle: { en: "Feeling of support", ru: "Ощущение опоры" },
        image: "/img/body.jpg",
      },
      {
        slug: "pond",
        title: { en: "Leaves in the pond", ru: "Листья в пруду" },
        subtitle: { en: "Working with thoughts", ru: "Работа с мыслями" },
        image: "/img/pond.jpg",
      },
    ],
  },

  "478": {
    id: "478",
    slug: "478",
    kind: "breathing",
    audio: {
      default: "/audio/practices/breathing/478.mp3",
    },
    breathing: {
      inhale: 4,
      hold: 7,
      exhale: 8,
      hold2: 0,
      cycles: 5,
    },
    tags: [
      { en: "BREATHING", ru: "ДЫХАНИЕ" },
      { en: "CALMING", ru: "СПОКОЙСТВИЕ" },
      { en: "2-3 MIN", ru: "2-3 МИН" },
    ],
    title: { en: "Method 4-7-8", ru: "Метод 4-7-8" },
    subtitle: {
      en: "Calm your mind and body with slowed breathing",
      ru: "Успокойте ум и тело с помощью замедленного дыхания",
    },
    cardTitle: { en: "Method 4-7-8", ru: "Метод 4-7-8" },
    cardSubtitle: { en: "Slowed breathing", ru: "Замедление дыхания" },
    previewBg: "var(--green)",
    playerBackground: "var(--green)",
    finishedText: { en: "Practice finished", ru: "Практика закончилась" },
    praiseText: { en: "Great work!", ru: "Отличная работа!" },
    other: [
      {
        slug: "505",
        title: { en: "Method 5-0-5", ru: "Метод 5-0-5" },
        subtitle: { en: "Breathing regulation", ru: "Регулирование дыхания" },
        image: "/img/505.jpg",
      },
      {
        slug: "4444",
        title: { en: "Method 4-4-4-4", ru: "Метод 4-4-4-4" },
        subtitle: { en: "Rhythm alignment", ru: "Выравнивание ритма" },
        image: "/img/4444.jpg",
      },
    ],
  },

  "505": {
    id: "505",
    slug: "505",
    kind: "breathing",
    audio: {
      default: "/audio/practices/breathing/505.mp3",
    },
    breathing: {
      inhale: 5,
      hold: 0,
      exhale: 5,
      hold2: 0,
      cycles: 5,
    },
    tags: [
      { en: "BREATHING", ru: "ДЫХАНИЕ" },
      { en: "RHYTHM", ru: "РИТМ" },
      { en: "1 MIN", ru: "1 МИН" },
    ],
    title: { en: "Method 5-0-5", ru: "Метод 5-0-5" },
    subtitle: {
      en: "Balance your breathing for inner equilibrium",
      ru: "Сбалансируйте дыхание для внутреннего равновесия",
    },
    cardTitle: { en: "Method 5-0-5", ru: "Метод 5-0-5" },
    cardSubtitle: { en: "Breathing regulation", ru: "Регулирование дыхания" },
    previewBg: "var(--yellow)",
    playerBackground: "var(--yellow)",
    finishedText: { en: "Practice finished", ru: "Практика закончилась" },
    praiseText: { en: "Great work!", ru: "Отличная работа!" },
    other: [
      {
        slug: "4444",
        title: { en: "Method 4-4-4-4", ru: "Метод 4-4-4-4" },
        subtitle: { en: "Rhythm alignment", ru: "Выравнивание ритма" },
        image: "/img/4444.jpg",
      },
      {
        slug: "478",
        title: { en: "Method 4-7-8", ru: "Метод 4-7-8" },
        subtitle: { en: "Slowed breathing", ru: "Замедление дыхания" },
        image: "/img/478.jpg",
      },
    ],
  },

  "4444": {
    id: "4444",
    slug: "4444",
    kind: "breathing",
    audio: {
      default: "/audio/practices/breathing/4444.mp3",
    },
    breathing: {
      inhale: 4,
      hold: 4,
      exhale: 4,
      hold2: 4,
      cycles: 5,
    },
    tags: [
      { en: "BREATHING", ru: "ДЫХАНИЕ" },
      { en: "BALANCE", ru: "БАЛАНС" },
      { en: "2 MIN", ru: "2 МИН" },
    ],
    title: { en: "Method 4-4-4-4", ru: "Метод 4-4-4-4" },
    subtitle: {
      en: "Synchronize your breathing with equal intervals",
      ru: "Синхронизируйте дыхание, следуя равным интервалам",
    },
    cardTitle: { en: "Method 4-4-4-4", ru: "Метод 4-4-4-4" },
    cardSubtitle: { en: "Rhythm alignment", ru: "Выравнивание ритма" },
    previewBg: "var(--blue)",
    playerBackground: "var(--blue)",
    finishedText: { en: "Practice finished", ru: "Практика закончилась" },
    praiseText: { en: "Great work!", ru: "Отличная работа!" },
    other: [
      {
        slug: "478",
        title: { en: "Method 4-7-8", ru: "Метод 4-7-8" },
        subtitle: { en: "Slowed breathing", ru: "Замедление дыхания" },
        image: "/img/478.jpg",
      },
      {
        slug: "505",
        title: { en: "Method 5-0-5", ru: "Метод 5-0-5" },
        subtitle: { en: "Breathing regulation", ru: "Регулирование дыхания" },
        image: "/img/505.jpg",
      },
    ],
  },

  stars: {
    id: "stars",
    slug: "stars",
    kind: "meditation",
    audio: {
      ru: "/audio/practices/stars/ru.mp3",
      en: "/audio/practices/stars/en.mp3",
    },
    tags: [
      { en: "SLEEP", ru: "СОН" },
      { en: "STORY", ru: "ИСТОРИЯ" },
      { en: "5 MIN", ru: "5 МИН" },
    ],
    title: { en: "Language of the Stars", ru: "Язык звезд" },
    subtitle: {
      en: "Immerse yourself in an imaginary night sky for relaxation before sleep",
      ru: "Погрузитесь в воображаемое ночное небо для расслабления перед сном",
    },
    cardTitle: { en: "Language of the Stars", ru: "Язык звезд" },
    cardSubtitle: { en: "Sleep preparation", ru: "Подготовка ко сну" },
    previewBg: "#0a1029",
    playerBackground: "#0b1024",
    finishedText: { en: "Meditation finished", ru: "Медитация закончилась" },
    praiseText: { en: "Great work!", ru: "Отличная работа!" },
    other: [
      {
        slug: "place",
        title: { en: "Cozy Place", ru: "Уютное место" },
        subtitle: { en: "Creating peace", ru: "Создание покоя" },
        image: "/img/place.jpg",
      },
    ],
  },

  place: {
    id: "place",
    slug: "place",
    kind: "meditation",
    audio: {
      ru: "/audio/practices/place/ru.mp3",
      en: "/audio/practices/place/en.mp3",
    },
    tags: [
      { en: "SLEEP", ru: "СОН" },
      { en: "PEACE", ru: "ПОКОЙ" },
      { en: "5 MIN", ru: "5 МИН" },
    ],
    title: { en: "Cozy Place", ru: "Уютное место" },
    subtitle: {
      en: "Relax your body, feeling pleasant warmth and heaviness",
      ru: "Расслабьте тело, ощущая приятное тепло и тяжесть",
    },
    cardTitle: { en: "Cozy Place", ru: "Уютное место" },
    cardSubtitle: { en: "Creating peace", ru: "Создание покоя" },
    previewBg: "#0a1029",
    playerBackground: "#0b1024",
    finishedText: { en: "Meditation finished", ru: "Медитация закончилась" },
    praiseText: { en: "Great work!", ru: "Отличная работа!" },
    other: [
      {
        slug: "stars",
        title: { en: "Language of the Stars", ru: "Язык звезд" },
        subtitle: { en: "Sleep preparation", ru: "Подготовка ко сну" },
        image: "/img/stars.jpg",
      },
    ],
  },
};
