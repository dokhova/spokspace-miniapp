import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLang } from "../i18n/lang";
import { tUI } from "../i18n/strings";
import "../styles/layout.css";

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { lang, setLang } = useLang();
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator === "undefined") return true;
    return navigator.onLine;
  });

  const isHome = location.pathname === "/" || location.pathname === "/today";
  const isTodayTab = location.pathname === "/" || location.pathname === "/today";
  const isPracticesTab = location.pathname === "/practices";
  const isGameTab = location.pathname === "/game";
  const showMetrics = typeof window !== "undefined" && window.location.search.includes("debug=1");

  // Назад показываем не на главных табах
  const isRootTab = location.pathname === "/" || location.pathname === "/today";

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [location.pathname]);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const offlineText =
    lang === "ru"
      ? "Нет соединения. Некоторые функции могут не работать."
      : "You're offline. Some features may not work.";

  return (
    <div className="app">
      <div className="top-controls">
        <a
          href="https://t.me/tribute/app?startapp=dzeA"
          target="_blank"
          rel="noreferrer"
          className="donate-btn"
          aria-label="Donate"
        >
          <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
            <path
              d="M10.4046 16.8532C10.1831 16.9452 9.81694 16.9452 9.59542 16.8532C6.9839 15.7891 1 12.0065 1 5.58667C1 3.0543 3.01633 1 5.5 1C7.62141 1 9.38073 2.3787 10 4.17511C10.6193 2.3787 12.3786 1 14.5 1C16.9837 1 19 3.0543 19 5.58667C19 12.0065 13.0161 15.7891 10.4046 16.8532Z"
              fill="url(#donate-gradient)"
              stroke="url(#donate-gradient)"
              strokeWidth="0.5"
            />
            <defs>
              <linearGradient
                id="donate-gradient"
                x1="1"
                y1="1"
                x2="19"
                y2="17"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#FFD527" />
                <stop offset="0.7" stopColor="#34A853" />
              </linearGradient>
            </defs>
          </svg>
        </a>
        <div className="language-switcher">
          <button
            className={`lang-btn ${lang === "en" ? "active" : ""}`}
            onClick={() => setLang("en")}
            type="button"
          >
            EN
          </button>
          <button
            className={`lang-btn ${lang === "ru" ? "active" : ""}`}
            onClick={() => setLang("ru")}
            type="button"
          >
            RU
          </button>
        </div>
        {showMetrics && (
          <a className="metrics-link" href="#/metrics">
            Metrics
          </a>
        )}
      </div>

      {!isOnline && <div className="offline-banner">{offlineText}</div>}

      {!isHome && (
        <header className="header">
          <button
            className="back-button"
            onClick={() => navigate(-1)}
            style={{ visibility: isRootTab ? "hidden" : "visible" }}
            aria-label="Back"
          >
            <svg className="back-arrow" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div style={{ width: 40, height: 32 }} />
        </header>
      )}

      <main className={`page ${isHome ? "page--home" : ""}`}>
        <Outlet />
      </main>

      <nav className="tab-bar">
        <a className={`tab ${isTodayTab ? "active" : ""}`} href="#/today">
          <img src={isTodayTab ? "/img/home-active.svg" : "/img/home.svg"} alt="" />
          <div>{tUI("today", lang)}</div>
        </a>

        <a className={`tab ${isPracticesTab ? "active" : ""}`} href="#/practices">
          <img src={isPracticesTab ? "/img/practices-active.svg" : "/img/practices.svg"} alt="" />
          <div>{tUI("practices", lang)}</div>
        </a>

        <a className={`tab ${isGameTab ? "active" : ""}`} href="#/game">
          <img src={isGameTab ? "/img/game-active.svg" : "/img/game.svg"} alt="" />
          <div>{tUI("game", lang)}</div>
        </a>
      </nav>
    </div>
  );
}
