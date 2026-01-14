import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/profile.css";
import { useLang } from "../i18n/lang";

type EmotionToggle = {
  emotionCalendar: boolean;
};

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

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const TOGGLE_KEY = "spokspaceProfileNotifications";
const GUEST_KEY = "spokspaceGuestProfile";

export default function Profile() {
  const { lang } = useLang();
  const navigate = useNavigate();

  const strings = useMemo(() => {
    return lang === "ru"
      ? {
          support: "Поддержка",
          supportSubtitle: "Связаться с поддержкой",
          notifications: "Оповещения",
          notificationsSubtitle: "Настроить напоминания",
          terms: "Условия использования",
          termsSubtitle: "Прочитать правила",
          addToHome: "Добавить на главный экран",
          modalTitle: "Оповещения",
          emotionCalendar: "Календарь эмоций",
          stubNote: "Пока это заглушка: сохранение идёт локально.",
        }
      : {
          support: "Support",
          supportSubtitle: "Contact support",
          notifications: "Notifications",
          notificationsSubtitle: "Configure reminders",
          terms: "Terms of use",
          termsSubtitle: "Read the rules",
          addToHome: "Add to home screen",
          modalTitle: "Notifications",
          emotionCalendar: "Emotion calendar",
          stubNote: "Stub for now: saved locally.",
        };
  }, [lang]);

  const [user, setUser] = useState<DisplayUser | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [toggles, setToggles] = useState<EmotionToggle>(() => {
    const raw = localStorage.getItem(TOGGLE_KEY);
    if (!raw) return { emotionCalendar: false };
    try {
      return JSON.parse(raw) as EmotionToggle;
    } catch {
      return { emotionCalendar: false };
    }
  });

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      const tgUser = tg.initDataUnsafe?.user as TelegramUser | undefined;
      if (tgUser) {
        const name = [tgUser.first_name, tgUser.last_name]
          .filter(Boolean)
          .join(" ");
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
    localStorage.setItem(TOGGLE_KEY, JSON.stringify(toggles));
  }, [toggles]);

  useEffect(() => {
    document.body.classList.toggle("overlay-open", showNotifications);
    return () => {
      document.body.classList.remove("overlay-open");
    };
  }, [showNotifications]);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function toggleEmotion() {
    setToggles((prev) => ({
      ...prev,
      emotionCalendar: !prev.emotionCalendar,
    }));
  }

  async function handleInstall() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  function handleSupport() {
    window.open("https://t.me/spoksupport_bot", "_blank", "noopener,noreferrer");
  }

  function handleTerms() {
    navigate("/privacy");
  }

  const userName = user?.name ?? "User";
  const userInitial = user?.name?.charAt(0)?.toUpperCase() ?? "U";

  return (
    <div className="profile">
      <div className="profile__user">
        <div
          className={`profile__avatar${
            user?.isGuest ? ` profile__avatar--seed-${user.avatarSeed}` : ""
          }`}
        >
          {user?.photoUrl ? (
            <img src={user.photoUrl} alt={userName} />
          ) : (
            <div className="profile__avatar-fallback">{userInitial}</div>
          )}
        </div>
        <div className="profile__name">{userName}</div>
      </div>

      <button type="button" className="profile__nav" onClick={handleSupport}>
        <div className="profile__nav-content">
          <div className="profile__nav-title">{strings.support}</div>
          <div className="profile__nav-subtitle">
            {strings.supportSubtitle}
          </div>
        </div>
        <span className="profile__nav-arrow">›</span>
      </button>

      <button
        type="button"
        className="profile__nav"
        onClick={() => setShowNotifications(true)}
      >
        <div className="profile__nav-content">
          <div className="profile__nav-title">{strings.notifications}</div>
          <div className="profile__nav-subtitle">
            {strings.notificationsSubtitle}
          </div>
        </div>
        <span className="profile__nav-arrow">›</span>
      </button>

      <button
        type="button"
        className={`profile__install${installPrompt ? " show" : ""}`}
        onClick={handleInstall}
      >
        {strings.addToHome}
      </button>

      <button type="button" className="profile__nav" onClick={handleTerms}>
        <div className="profile__nav-content">
          <div className="profile__nav-title">{strings.terms}</div>
          <div className="profile__nav-subtitle">{strings.termsSubtitle}</div>
        </div>
        <span className="profile__nav-arrow">›</span>
      </button>

      {showNotifications && (
        <div className="profile__overlay" role="dialog" aria-modal="true">
          <div className="profile__modal">
            <div className="profile__modal-header">
              <div className="profile__modal-title">{strings.modalTitle}</div>
              <button
                className="profile__modal-close"
                type="button"
                onClick={() => setShowNotifications(false)}
              >
                ✕
              </button>
            </div>
            <button
              type="button"
              className="profile__toggle-row"
              onClick={toggleEmotion}
            >
              <span>{strings.emotionCalendar}</span>
              <span
                className={`profile__toggle${
                  toggles.emotionCalendar ? " on" : ""
                }`}
              />
            </button>
            <div className="profile__note">{strings.stubNote}</div>
          </div>
        </div>
      )}
    </div>
  );
}
