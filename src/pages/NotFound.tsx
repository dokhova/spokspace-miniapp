import { Link } from "react-router-dom";
import { useLang } from "../i18n/lang";
import "../styles/system.css";

export default function NotFound() {
  const { lang } = useLang();

  const copy =
    lang === "ru"
      ? {
          title: "Страница не найдена",
          text: "Похоже, здесь ничего нет.",
          back: "На главную",
        }
      : {
          title: "Page not found",
          text: "Looks like there's nothing here.",
          back: "Back to Home",
        };

  return (
    <div className="system-page">
      <h1 className="system-title">{copy.title}</h1>
      <p className="system-text">{copy.text}</p>
      <Link className="system-link" to="/today">
        {copy.back}
      </Link>
    </div>
  );
}
