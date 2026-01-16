import { Link } from "react-router-dom";
import { useLang } from "../i18n/lang";
import { pick } from "../i18n/pick";
import { tUI } from "../i18n/strings";
import { practices } from "./practices/practiceConfig";
import "../styles/practices.css";

export default function Practices() {
  const { lang } = useLang();

  return (
    <div className="practices">
      <div className="section">
        <div className="section-title" data-translate="meditation_title">
          {tUI("meditation", lang)}
        </div>
        <div className="cards">
          <Link to="/practice/pond" className="card">
            <img
              src="/img/pond.jpg"
              alt={pick(practices.pond.cardTitle ?? practices.pond.title, lang)}
            />
            <div className="card-content">
              <div className="card-title" data-translate="pond_title">
                {pick(practices.pond.cardTitle ?? practices.pond.title, lang)}
              </div>
              <div className="card-subtitle" data-translate="pond_subtitle">
                {pick(practices.pond.cardSubtitle ?? practices.pond.subtitle, lang)}
              </div>
            </div>
            <img className="arrow" src="/img/arrow.svg" alt="arrow" />
          </Link>

          <Link to="/practice/pause" className="card">
            <img
              src="/img/pause.jpg"
              alt={pick(practices.pause.cardTitle ?? practices.pause.title, lang)}
            />
            <div className="card-content">
              <div className="card-title" data-translate="pause_title">
                {pick(practices.pause.cardTitle ?? practices.pause.title, lang)}
              </div>
              <div className="card-subtitle" data-translate="pause_subtitle">
                {pick(practices.pause.cardSubtitle ?? practices.pause.subtitle, lang)}
              </div>
            </div>
            <img className="arrow" src="/img/arrow.svg" alt="arrow" />
          </Link>

          <Link to="/practice/body" className="card">
            <img
              src="/img/body.jpg"
              alt={pick(practices.body.cardTitle ?? practices.body.title, lang)}
            />
            <div className="card-content">
              <div className="card-title" data-translate="body_title">
                {pick(practices.body.cardTitle ?? practices.body.title, lang)}
              </div>
              <div className="card-subtitle" data-translate="body_subtitle">
                {pick(practices.body.cardSubtitle ?? practices.body.subtitle, lang)}
              </div>
            </div>
            <img className="arrow" src="/img/arrow.svg" alt="arrow" />
          </Link>
        </div>
      </div>

      <div className="section">
        <div className="section-title" data-translate="breathing_title">
          {tUI("breathing", lang)}
        </div>
        <div className="cards">
          <Link to="/practice/478" className="card">
            <img
              src="/img/478.jpg"
              alt={pick(practices["478"].cardTitle ?? practices["478"].title, lang)}
            />
            <div className="card-content">
              <div className="card-title" data-translate="breathing_478_title">
                {pick(practices["478"].cardTitle ?? practices["478"].title, lang)}
              </div>
              <div className="card-subtitle" data-translate="breathing_478_subtitle">
                {pick(practices["478"].cardSubtitle ?? practices["478"].subtitle, lang)}
              </div>
            </div>
            <img className="arrow" src="/img/arrow.svg" alt="arrow" />
          </Link>

          <Link to="/practice/505" className="card">
            <img
              src="/img/505.jpg"
              alt={pick(practices["505"].cardTitle ?? practices["505"].title, lang)}
            />
            <div className="card-content">
              <div className="card-title" data-translate="breathing_505_title">
                {pick(practices["505"].cardTitle ?? practices["505"].title, lang)}
              </div>
              <div className="card-subtitle" data-translate="breathing_505_subtitle">
                {pick(practices["505"].cardSubtitle ?? practices["505"].subtitle, lang)}
              </div>
            </div>
            <img className="arrow" src="/img/arrow.svg" alt="arrow" />
          </Link>

          <Link to="/practice/4444" className="card">
            <img
              src="/img/4444.jpg"
              alt={pick(practices["4444"].cardTitle ?? practices["4444"].title, lang)}
            />
            <div className="card-content">
              <div className="card-title" data-translate="breathing_4444_title">
                {pick(practices["4444"].cardTitle ?? practices["4444"].title, lang)}
              </div>
              <div className="card-subtitle" data-translate="breathing_4444_subtitle">
                {pick(practices["4444"].cardSubtitle ?? practices["4444"].subtitle, lang)}
              </div>
            </div>
            <img className="arrow" src="/img/arrow.svg" alt="arrow" />
          </Link>
        </div>
      </div>

      <div className="section">
        <div className="section-title" data-translate="sleep_title">
          {tUI("sleep", lang)}
        </div>
        <div className="cards">
          <Link to="/practice/stars" className="card">
            <img
              src="/img/stars.jpg"
              alt={pick(practices.stars.cardTitle ?? practices.stars.title, lang)}
            />
            <div className="card-content">
              <div className="card-title" data-translate="stars_title">
                {pick(practices.stars.cardTitle ?? practices.stars.title, lang)}
              </div>
              <div className="card-subtitle" data-translate="stars_subtitle">
                {pick(practices.stars.cardSubtitle ?? practices.stars.subtitle, lang)}
              </div>
            </div>
            <img className="arrow" src="/img/arrow.svg" alt="arrow" />
          </Link>

          <Link to="/practice/place" className="card">
            <img
              src="/img/place.jpg"
              alt={pick(practices.place.cardTitle ?? practices.place.title, lang)}
            />
            <div className="card-content">
              <div className="card-title" data-translate="place_title">
                {pick(practices.place.cardTitle ?? practices.place.title, lang)}
              </div>
              <div className="card-subtitle" data-translate="place_subtitle">
                {pick(practices.place.cardSubtitle ?? practices.place.subtitle, lang)}
              </div>
            </div>
            <img className="arrow" src="/img/arrow.svg" alt="arrow" />
          </Link>
        </div>
      </div>
    </div>
  );
}
