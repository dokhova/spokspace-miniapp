import type { CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import { useLang } from "../../i18n/lang";
import { pick } from "../../i18n/pick";
import { tUI } from "../../i18n/strings";
import { practices } from "./practiceConfig";
import "../../styles/practice-detail.css";

export default function PracticeDetail() {
  const { id } = useParams<{ id: string }>();
  const practice = id ? practices[id] : undefined;
  const { lang } = useLang();

  if (!practice) {
    return (
      <div className="practice">
        <div className="title">{tUI("practiceNotFound", lang)}</div>
        <div className="subtitle">{tUI("backToList", lang)}</div>

        <Link className="start-button" to="/practices">
          {tUI("backToList", lang)}
        </Link>
      </div>
    );
  }

  return (
    <div className="practice">
      <div className="tags">
        {practice.tags.map((t, i) => (
          <span key={pick(t, lang)}>
            {pick(t, lang)}
            {i < practice.tags.length - 1 ? <span className="dot"> • </span> : null}
          </span>
        ))}
      </div>

      <h1 className="title">{pick(practice.title, lang)}</h1>
      <div className="subtitle">{pick(practice.subtitle, lang)}</div>

      {(() => {
        const previewKind =
          practice.kind === "breathing"
            ? "breathing"
            : practice.id === "stars" || practice.id === "place"
              ? "sleep"
              : "meditation";

        const previewStyle = {
          background: practice.previewBg ?? "rgba(255, 255, 255, 0.06)",
          "--preview-bg": practice.previewBg ?? "rgba(255, 255, 255, 0.06)",
        } as CSSProperties;

        const renderMeditationPreview = () => (
          <svg
            className="preview__animation"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 327 207"
            aria-hidden="true"
          >
            <circle className="preview__dot" cx="60" cy="40" r="1.5">
              <animate
                attributeName="opacity"
                values="0.7;0.3;0.7"
                dur="2.5s"
                repeatCount="indefinite"
              />
            </circle>
            <circle className="preview__dot" cx="270" cy="50" r="2">
              <animate
                attributeName="opacity"
                values="0.5;0.8;0.5"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
            <circle className="preview__dot" cx="250" cy="160" r="1">
              <animate
                attributeName="opacity"
                values="0.6;0.2;0.6"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle className="preview__dot" cx="80" cy="150" r="1.8">
              <animate
                attributeName="opacity"
                values="0.4;0.7;0.4"
                dur="3.5s"
                repeatCount="indefinite"
              />
            </circle>
            <circle className="preview__dot" cx="180" cy="30" r="1.2">
              <animate
                attributeName="opacity"
                values="0.8;0.4;0.8"
                dur="2.2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle className="preview__dot" cx="300" cy="120" r="1.4">
              <animate
                attributeName="opacity"
                values="0.6;0.9;0.6"
                dur="2.8s"
                repeatCount="indefinite"
              />
            </circle>
            <circle className="preview__dot" cx="40" cy="100" r="2.2">
              <animate
                attributeName="opacity"
                values="0.3;0.6;0.3"
                dur="3.2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle className="preview__dot" cx="200" cy="180" r="1.6">
              <animate
                attributeName="opacity"
                values="0.7;0.2;0.7"
                dur="2.4s"
                repeatCount="indefinite"
              />
            </circle>

            <circle className="preview__wave" cx="163.5" cy="103.5" r="75">
              <animate
                attributeName="r"
                values="75;15"
                dur="8s"
                repeatCount="indefinite"
                begin="0s"
              />
              <animate
                attributeName="opacity"
                values="0;0.5;0.9"
                dur="8s"
                repeatCount="indefinite"
                begin="0s"
              />
            </circle>
            <circle className="preview__wave" cx="163.5" cy="103.5" r="75">
              <animate
                attributeName="r"
                values="75;15"
                dur="8s"
                repeatCount="indefinite"
                begin="1.6s"
              />
              <animate
                attributeName="opacity"
                values="0;0.5;0.9"
                dur="8s"
                repeatCount="indefinite"
                begin="1.6s"
              />
            </circle>
            <circle className="preview__wave" cx="163.5" cy="103.5" r="75">
              <animate
                attributeName="r"
                values="75;15"
                dur="8s"
                repeatCount="indefinite"
                begin="3.2s"
              />
              <animate
                attributeName="opacity"
                values="0;0.5;0.9"
                dur="8s"
                repeatCount="indefinite"
                begin="3.2s"
              />
            </circle>
            <circle className="preview__wave" cx="163.5" cy="103.5" r="75">
              <animate
                attributeName="r"
                values="75;15"
                dur="8s"
                repeatCount="indefinite"
                begin="4.8s"
              />
              <animate
                attributeName="opacity"
                values="0;0.5;0.9"
                dur="8s"
                repeatCount="indefinite"
                begin="4.8s"
              />
            </circle>
            <circle className="preview__wave" cx="163.5" cy="103.5" r="75">
              <animate
                attributeName="r"
                values="75;15"
                dur="8s"
                repeatCount="indefinite"
                begin="6.4s"
              />
              <animate
                attributeName="opacity"
                values="0;0.5;0.9"
                dur="8s"
                repeatCount="indefinite"
                begin="6.4s"
              />
            </circle>
          </svg>
        );

        const renderBreathingPreview = () => {
          const breathingPreset =
            practice.id === "505"
              ? {
                  outer: {
                    values: "50;75;50",
                    dur: "10s",
                    keyTimes: "0;0.5;1",
                  },
                  middle: {
                    values: "40;60;40",
                    dur: "10s",
                    keyTimes: "0;0.5;1",
                  },
                  solid: {
                    values: "30;45;30",
                    dur: "10s",
                    keyTimes: "0;0.5;1",
                  },
                }
              : practice.id === "4444"
                ? {
                    outer: {
                      values: "50;75;75;50;50",
                      dur: "16s",
                      keyTimes: "0;0.25;0.5;0.75;1",
                    },
                    middle: {
                      values: "40;60;60;40;40",
                      dur: "16s",
                      keyTimes: "0;0.25;0.5;0.75;1",
                    },
                    solid: {
                      values: "30;45;45;30;30",
                      dur: "16s",
                      keyTimes: "0;0.25;0.5;0.75;1",
                    },
                  }
                : {
                    outer: {
                      values: "50;75;75;35;35;50",
                      dur: "20s",
                      keyTimes: "0;0.2;0.55;0.95;0.98;1",
                    },
                    middle: {
                      values: "40;60;60;25;25;40",
                      dur: "20s",
                      keyTimes: "0;0.2;0.55;0.95;0.98;1",
                    },
                    solid: {
                      values: "30;45;45;15;15;30",
                      dur: "20s",
                      keyTimes: "0;0.2;0.55;0.95;0.98;1",
                    },
                  };

          return (
            <svg
              className="preview__animation"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 327 207"
              aria-hidden="true"
            >
              <path
                className="preview__star"
                d="M60 40 L61 42 L63 42.1 L61.8 43.3 L62.1 45.1 L60 44.5 L57.9 45.1 L58.2 43.3 L57 42.1 L59 42 Z"
              >
                <animate
                  attributeName="opacity"
                  values="0.6;0.9;0.6;0.3;0.6"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </path>
              <path
                className="preview__star"
                d="M270 50 L271 52 L273 52.1 L271.8 53.3 L272.1 55.1 L270 54.5 L267.9 55.1 L268.2 53.3 L267 52.1 L269 52 Z"
              >
                <animate
                  attributeName="opacity"
                  values="0.5;0.2;0.5;0.8;0.5"
                  dur="5s"
                  repeatCount="indefinite"
                />
              </path>
              <path
                className="preview__star"
                d="M250 160 L251 162 L253 162.1 L251.8 163.3 L252.1 165.1 L250 164.5 L247.9 165.1 L248.2 163.3 L247 162.1 L249 162 Z"
              >
                <animate
                  attributeName="opacity"
                  values="0.7;0.4;0.7;1;0.7"
                  dur="6s"
                  repeatCount="indefinite"
                />
              </path>
              <path
                className="preview__star"
                d="M80 150 L81 152 L83 152.1 L81.8 153.3 L82.1 155.1 L80 154.5 L77.9 155.1 L78.2 153.3 L77 152.1 L79 152 Z"
              >
                <animate
                  attributeName="opacity"
                  values="0.4;0.7;0.4;0.1;0.4"
                  dur="4.5s"
                  repeatCount="indefinite"
                />
              </path>
              <path
                className="preview__star"
                d="M180 30 L181 32 L183 32.1 L181.8 33.3 L182.1 35.1 L180 34.5 L177.9 35.1 L178.2 33.3 L177 32.1 L179 32 Z"
              >
                <animate
                  attributeName="opacity"
                  values="0.5;0.8;0.5;0.2;0.5"
                  dur="3.5s"
                  repeatCount="indefinite"
                />
              </path>

              <circle
                cx="163.5"
                cy="103.5"
                r="50"
                className="preview__breath preview__breath--outer"
              >
                <animate
                  attributeName="r"
                  values={breathingPreset.outer.values}
                  dur={breathingPreset.outer.dur}
                  repeatCount="indefinite"
                  keyTimes={breathingPreset.outer.keyTimes}
                />
              </circle>
              <circle
                cx="163.5"
                cy="103.5"
                r="40"
                className="preview__breath preview__breath--middle"
              >
                <animate
                  attributeName="r"
                  values={breathingPreset.middle.values}
                  dur={breathingPreset.middle.dur}
                  repeatCount="indefinite"
                  keyTimes={breathingPreset.middle.keyTimes}
                />
              </circle>
              <circle
                cx="163.5"
                cy="103.5"
                r="30"
                className="preview__breath preview__breath--solid"
              >
                <animate
                  attributeName="r"
                  values={breathingPreset.solid.values}
                  dur={breathingPreset.solid.dur}
                  repeatCount="indefinite"
                  keyTimes={breathingPreset.solid.keyTimes}
                />
              </circle>
            </svg>
          );
        };

        const renderSleepPreview = () => {
          const isStars = practice.id === "stars";
          const accent = isStars ? "#FFD527" : "#4285F4";
          const accentSoft = isStars ? "#FFF9C4" : "#A3C2FF";
          const accentSoft2 = isStars ? "#FFEB9C" : "#6B9CFF";
          const glowId = `previewGlow-${practice.id}`;

          return (
            <svg
              className="preview__animation"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 327 207"
              aria-hidden="true"
            >
              <defs>
                <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={accentSoft} stopOpacity="0.8" />
                  <stop offset="70%" stopColor={accentSoft2} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={accent} stopOpacity="0" />
                </radialGradient>
              </defs>

              <g fill="white">
                <circle cx="30" cy="30" r="0.6" opacity="0.7" />
                <circle cx="80" cy="45" r="0.4" opacity="0.5" />
                <circle cx="120" cy="25" r="0.7" opacity="0.6" />
                <circle cx="180" cy="40" r="0.5" opacity="0.8" />
                <circle cx="230" cy="20" r="0.6" opacity="0.7" />
                <circle cx="280" cy="35" r="0.4" opacity="0.5" />
                <circle cx="300" cy="50" r="0.6" opacity="0.6" />
                <circle cx="20" cy="80" r="0.5" opacity="0.5" />
                <circle cx="70" cy="110" r="0.7" opacity="0.7" />
                <circle cx="110" cy="90" r="0.4" opacity="0.6" />
                <circle cx="200" cy="120" r="0.7" opacity="0.8" />
                <circle cx="260" cy="95" r="0.5" opacity="0.5" />
                <circle cx="310" cy="105" r="0.6" opacity="0.6" />
                <circle cx="40" cy="160" r="0.6" opacity="0.8" />
                <circle cx="90" cy="180" r="0.4" opacity="0.5" />
                <circle cx="140" cy="170" r="0.7" opacity="0.6" />
                <circle cx="220" cy="185" r="0.5" opacity="0.7" />
                <circle cx="270" cy="165" r="0.7" opacity="0.8" />
                <circle cx="300" cy="180" r="0.4" opacity="0.5" />
              </g>

              <g>
                <circle cx="60" cy="60" r="1" fill="white">
                  <animate
                    attributeName="opacity"
                    values="0.4;1;0.4"
                    dur="8s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx="150" cy="50" r="1.2" fill="white">
                  <animate
                    attributeName="opacity"
                    values="0.4;1;0.4"
                    dur="8s"
                    repeatCount="indefinite"
                    begin="1s"
                  />
                </circle>
                <circle cx="250" cy="70" r="1" fill="white">
                  <animate
                    attributeName="opacity"
                    values="0.4;1;0.4"
                    dur="8s"
                    repeatCount="indefinite"
                    begin="2s"
                  />
                </circle>
                <circle cx="50" cy="140" r="1.1" fill="white">
                  <animate
                    attributeName="opacity"
                    values="0.4;1;0.4"
                    dur="8s"
                    repeatCount="indefinite"
                    begin="3s"
                  />
                </circle>
                <circle cx="170" cy="160" r="1" fill="white">
                  <animate
                    attributeName="opacity"
                    values="0.4;1;0.4"
                    dur="8s"
                    repeatCount="indefinite"
                    begin="4s"
                  />
                </circle>
                <circle cx="290" cy="150" r="1.2" fill="white">
                  <animate
                    attributeName="opacity"
                    values="0.4;1;0.4"
                    dur="8s"
                    repeatCount="indefinite"
                    begin="5s"
                  />
                </circle>
              </g>

              <circle cx="163.5" cy="103.5" r="50" fill={`url(#${glowId})`} opacity="0.5">
                <animate attributeName="r" values="50;70;50" dur="16s" repeatCount="indefinite" />
                <animate
                  attributeName="opacity"
                  values="0.5;0.8;0.5"
                  dur="16s"
                  repeatCount="indefinite"
                />
              </circle>

              <circle cx="163.5" cy="103.5" r="35" fill={accent} opacity="0.7">
                <animate attributeName="r" values="35;50;35" dur="16s" repeatCount="indefinite" />
                <animate
                  attributeName="opacity"
                  values="0.7;1;0.7"
                  dur="16s"
                  repeatCount="indefinite"
                />
              </circle>

              <circle
                cx="163.5"
                cy="103.5"
                r="40"
                fill="none"
                stroke={accent}
                strokeWidth="1.5"
                opacity="0.6"
              >
                <animate attributeName="r" values="40;100" dur="12s" repeatCount="indefinite" />
                <animate
                  attributeName="opacity"
                  values="0.6;0"
                  dur="12s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle
                cx="163.5"
                cy="103.5"
                r="40"
                fill="none"
                stroke={accent}
                strokeWidth="1.5"
                opacity="0.6"
              >
                <animate
                  attributeName="r"
                  values="40;100"
                  dur="12s"
                  repeatCount="indefinite"
                  begin="4s"
                />
                <animate
                  attributeName="opacity"
                  values="0.6;0"
                  dur="12s"
                  repeatCount="indefinite"
                  begin="4s"
                />
              </circle>
              <circle
                cx="163.5"
                cy="103.5"
                r="40"
                fill="none"
                stroke={accent}
                strokeWidth="1.5"
                opacity="0.6"
              >
                <animate
                  attributeName="r"
                  values="40;100"
                  dur="12s"
                  repeatCount="indefinite"
                  begin="8s"
                />
                <animate
                  attributeName="opacity"
                  values="0.6;0"
                  dur="12s"
                  repeatCount="indefinite"
                  begin="8s"
                />
              </circle>
            </svg>
          );
        };

        return (
          <Link
            to={`/practice/${practice.id}/play`}
            className={`preview preview--link preview--${previewKind} preview--${practice.id}`}
            style={previewStyle}
            aria-label="Play practice"
          >
            {previewKind === "breathing"
              ? renderBreathingPreview()
              : previewKind === "sleep"
                ? renderSleepPreview()
                : renderMeditationPreview()}
            <span className="preview__play">
              <span className="preview__playIcon">▶</span>
            </span>
          </Link>
        );
      })()}

      <div className="other">
        <div className="section-title">{tUI("otherPractices", lang)}</div>

        <div className="other-list">
          {practice.other.map((p) => (
            <Link key={p.slug} to={`/practice/${p.slug}`} className="practice-card">
              <img src={p.image} alt={pick(p.title, lang) ?? ""} />
              <div className="practice-card-content">
                <div className="practice-card-title">{pick(p.title, lang)}</div>
                <div className="practice-card-subtitle">{pick(p.subtitle, lang)}</div>
              </div>
              <img className="arrow" src="/img/arrow.svg" alt="" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
