import { useMemo } from "react";
import type { ReactNode } from "react";
import "../styles/privacy.css";
import { useLang } from "../i18n/lang";

type Section = {
  title: string;
  paragraphs?: Array<string | ReactNode>;
  subsections?: Array<{
    title: string;
    paragraphs?: Array<string | ReactNode>;
    list?: string[];
  }>;
  list?: string[];
};

type PrivacyContent = {
  title: string;
  updated: string;
  sections: Section[];
  contact: {
    title: string;
    email: string;
    telegram: string;
  };
};

export default function Privacy() {
  const { lang } = useLang();

  const content = useMemo<PrivacyContent>(() => {
    if (lang === "ru") {
      return {
        title: "Условия использования",
        updated: "Обновлено: 23 июля 2025 года",
        sections: [
          {
            title: "1. Общие положения",
            paragraphs: [
              "Используя мини-приложение Spokspace (далее — «Приложение», «мы»), вы (далее — «Пользователь») соглашаетесь с настоящими условиями. Если вы не согласны с ними — пожалуйста, прекратите использование Приложения.",
              "Приложение Spokspace работает внутри Telegram и не является продуктом Telegram, Apple, Google или TON Foundation. Эти компании не связаны с нами и не поддерживают наш продукт.",
              "Приложение предназначено для пользователей от 13 лет. Если вам меньше 18 лет, используйте приложение с согласия родителей.",
            ],
          },
          {
            title: "2. Описание сервиса",
            paragraphs: [
              <>
                Spokspace — это <span className="highlight-text">некоммерческое мини-приложение</span> внутри Telegram, предлагающее пользователям простые практики дыхания, осознанности и саморегуляции, а также календарь отслеживания настроения. Мы не используем рекламу и не продаём данные.
              </>,
              "Приложение включает добровольные функции пожертвований через Telegram Stars и криптовалюту TON для поддержки разработки и обслуживания проекта.",
            ],
          },
          {
            title: "3. Какие данные мы получаем",
            subsections: [
              {
                title: "Пользовательские данные",
                paragraphs: [
                  "Через Telegram WebApp API приложение может получить:",
                  "Эти данные используются для отображения интерфейса и персонализации пользовательского опыта. Мы не передаем персональные данные третьим лицам в коммерческих целях.",
                ],
                list: [
                  "Имя и фамилию пользователя Telegram",
                  "Username",
                  "Фото профиля (если доступно)",
                  "Telegram ID",
                  "Языковые предпочтения",
                  "Информацию о часовом поясе",
                ],
              },
              {
                title: "Эмоциональные данные",
                paragraphs: [
                  "Для функции календаря настроений мы собираем и храним:",
                  "Эти эмоциональные данные хранятся анонимно и используются исключительно для предоставления функций календаря и улучшения пользовательского опыта.",
                ],
                list: [
                  "Отметки эмоций в календаре настроений",
                  "Даты и время создания записей о настроении",
                  "Статистику использования календаря эмоций",
                ],
              },
              {
                title: "Данные для улучшения сервиса",
                paragraphs: [
                  "Для развития и персонализации сервиса мы можем сохранять информацию о взаимодействии с приложением, включающую:",
                  "Эти данные используются исключительно для улучшения пользовательского опыта и не передаются третьим лицам в коммерческих целях.",
                ],
                list: [
                  "Частоту использования различных практик",
                  "Время взаимодействия с приложением",
                  "Предпочтения в выборе контента",
                  "Технические данные для обеспечения работы сервиса",
                ],
              },
              {
                title: "Данные аналитики",
                paragraphs: [
                  "Мы используем аналитические сервисы для понимания поведения пользователей и улучшения приложения:",
                ],
                list: [
                  "Google Analytics 4 для аналитики веб-использования",
                  "Telegram Analytics SDK для метрик, специфичных для Telegram",
                  "Анонимные паттерны использования и взаимодействия с функциями",
                ],
              },
              {
                title: "Платежные данные",
                paragraphs: [
                  "Для функций пожертвований мы можем обрабатывать:",
                  "Обработка платежей осуществляется Telegram и сетью TON. Мы не храним чувствительную финансовую информацию.",
                ],
                list: [
                  "Подтверждения транзакций Telegram Stars",
                  "Адреса TON кошельков (при использовании TON Connect)",
                  "Временные метки и суммы транзакций",
                ],
              },
            ],
          },
          {
            title: "4. Хранение и использование данных",
            paragraphs: [
              "Мы храним минимально необходимый объем данных для обеспечения работы приложения и улучшения пользовательского опыта. Все данные обрабатываются с соблюдением принципов конфиденциальности.",
              "Данные могут храниться в защищенных облачных сервисах для обеспечения стабильной работы приложения. После прекращения использования сервиса данные могут быть удалены по запросу пользователя.",
              "Если в будущем появятся новые функции сбора данных, пользователи будут об этом уведомлены отдельно.",
            ],
            subsections: [
              {
                title: "Технические детали хранения",
                list: [
                  "Данные календаря эмоций хранятся в Google Sheets через Google Apps Script",
                  "Генерируются стабильные ID пользователей без привязки к личности",
                  "Локальное хранилище браузера используется для немедленного доступа к данным",
                  "Синхронизация данных происходит в фоне без блокировки пользовательского интерфейса",
                  "Пользователь может запросить полное удаление своих данных в любое время",
                ],
              },
              {
                title: "Система уведомлений",
                list: [
                  "Настройки уведомлений хранятся в Google Sheets",
                  "ID чатов Telegram используются только для доставки уведомлений",
                  "Пользователи могут отключить уведомления в любое время",
                ],
              },
            ],
          },
          {
            title: "5. Безопасность",
            paragraphs: [
              "Все действия происходят в пределах Telegram, с использованием официального WebApp SDK. Мы не обрабатываем чувствительные персональные данные самостоятельно.",
            ],
            subsections: [
              {
                title: "Технические меры безопасности",
                list: [
                  "Данные передаются по защищенному HTTPS соединению",
                  "Google Apps Script обрабатывает данные на серверной стороне",
                  "Данные хранятся в соответствии со стандартами Google Cloud Security",
                  "Применяется шифрование данных при передаче и хранении",
                  "TON Connect SDK обеспечивает безопасные криптовалютные транзакции",
                ],
              },
              {
                title: "Автоматизированная обработка",
                paragraphs: [
                  "Мы не принимаем автоматизированных решений на основе ваших данных. Данные эмоций используются только для персонализации интерфейса. Никакого профилирования или анализа личности не проводится.",
                ],
              },
              {
                title: "Интеграции с третьими сторонами",
                paragraphs: [
                  "Приложение интегрируется со следующими доверенными сервисами:",
                ],
                list: [
                  "Telegram Bot API для уведомлений",
                  "Google Analytics и Telegram Analytics для аналитических данных",
                  "Блокчейн TON для криптовалютных транзакций",
                ],
              },
            ],
          },
          {
            title: "6. Медицинский дисклеймер и информация о здоровье",
            subsections: [
              {
                title: "Не медицинское лечение",
                paragraphs: [
                  <>
                    Дыхательные упражнения, медитативные практики и техники осознанности, представленные в этом приложении, <span className="highlight-text">не являются медицинским лечением, терапией или медицинскими услугами</span>. Это общие оздоровительные практики для расслабления и управления стрессом.
                  </>,
                ],
              },
              {
                title: "Необходима медицинская консультация",
                paragraphs: [
                  "Перед использованием дыхательных или медитативных практик, особенно при наличии каких-либо медицинских состояний, пожалуйста, проконсультируйтесь с квалифицированными медицинскими специалистами. Это особенно важно, если у вас есть:",
                ],
                list: [
                  "Респираторные заболевания (астма, ХОБЛ и др.)",
                  "Сердечно-сосудистые заболевания",
                  "Психические расстройства",
                  "Беременность или другие медицинские состояния",
                  "История панических атак или тревожных расстройств",
                ],
              },
              {
                title: "Экстренные ситуации",
                paragraphs: [
                  <>
                    Если во время выполнения практик вы испытываете дискомфорт, головокружение, одышку или другие тревожные симптомы, <span className="highlight-text">немедленно прекратите</span> и при необходимости обратитесь за медицинской помощью.
                  </>,
                ],
              },
              {
                title: "Отсутствие медицинских советов",
                paragraphs: [
                  "Приложение не предоставляет медицинских советов, диагностики или лечения. Практики не предназначены для замены профессиональной медицинской помощи или лечения психического здоровья.",
                ],
              },
            ],
          },
          {
            title: "7. Общий отказ от ответственности",
            paragraphs: [
              "Приложение предоставляется «как есть». Мы не гарантируем безошибочную или непрерывную работу. Использование практик из приложения осуществляется на собственный риск и ответственность пользователя.",
              "Функции пожертвований являются добровольными и не предоставляют особых привилегий или гарантий качества сервиса.",
              "Мы отказываемся от всей ответственности за любые травмы, вред или неблагоприятные последствия, которые могут возникнуть в результате использования дыхательных упражнений, медитативных практик или другого контента в приложении.",
            ],
          },
          {
            title: "8. Изменения условий",
            paragraphs: [
              "Мы оставляем за собой право обновлять эту политику. Дата последнего обновления указывается в начале документа.",
              "Пользователи будут уведомлены о значительных изменениях через приложение или уведомления Telegram.",
            ],
          },
          {
            title: "9. GDPR и пользователи ЕС",
            paragraphs: ["Для пользователей из Европейского Союза:"],
            list: [
              "Обработка данных основана на вашем согласии и законных интересах",
              "Вы можете отозвать согласие в любое время",
              "Применяются права субъектов данных согласно GDPR",
              "Период хранения данных не превышает необходимости",
            ],
          },
          {
            title: "10. Права пользователей",
            paragraphs: [
              "Вы имеете право:",
              "Для реализации этих прав свяжитесь с нами по указанным контактам.",
            ],
            list: [
              "Просматривать все ваши данные в приложении",
              "Запросить удаление всех ваших данных",
              "Получить копию ваших данных в читаемом формате",
              "Прекратить сбор данных, удалив приложение",
              "Отключить или изменить настройки уведомлений",
              "Возразить против сбора аналитических данных",
            ],
          },
          {
            title: "11. Контакты",
            paragraphs: [
              "Если у вас есть вопросы или запрос на удаление данных, пожалуйста, свяжитесь с нами:",
            ],
          },
        ] as Section[],
        contact: {
          title: "Связаться с нами",
          email: "Email: info@spokspace.com",
          telegram: "Telegram: @spoksupport_bot",
        },
      };
    }

    return {
      title: "Terms of Use",
      updated: "Updated: July 23, 2025",
      sections: [
        {
          title: "1. General Provisions",
          paragraphs: [
            "By using the Spokspace mini-app (hereinafter — \"Application\", \"we\"), you (hereinafter — \"User\") agree to these terms. If you do not agree with them — please stop using the Application.",
            "The Spokspace application works within Telegram and is not a product of Telegram, Apple, Google or TON Foundation. These companies are not affiliated with us and do not support our product.",
            "The application is intended for users aged 13 and over. If you are under 18, please use the application with parental consent.",
          ],
        },
        {
          title: "2. Service Description",
          paragraphs: [
            <>
              Spokspace is a <span className="highlight-text">non-commercial mini-application</span> within Telegram, offering users simple practices of breathing, mindfulness and self-regulation, as well as a mood tracking calendar. We do not use advertising and do not sell data.
            </>,
            "The application includes voluntary donation features through Telegram Stars and TON cryptocurrency to support the project's development and maintenance.",
          ],
        },
        {
          title: "3. What Data We Collect",
          subsections: [
            {
              title: "User Data",
              paragraphs: [
                "Through Telegram WebApp API the application may receive:",
                "This data is used to display the interface and personalize the user experience. We do not transfer personal data to third parties for commercial purposes.",
              ],
              list: [
                "Telegram user first and last name",
                "Username",
                "Profile photo (if available)",
                "Telegram ID",
                "Language preference",
                "Timezone information",
              ],
            },
            {
              title: "Emotional Data",
              paragraphs: [
                "For the mood calendar feature, we collect and store:",
                "This emotional data is stored anonymously and used solely to provide calendar functionality and improve user experience.",
              ],
              list: [
                "Emotion marks in the mood calendar",
                "Dates and times of mood entries",
                "Usage statistics of the emotion calendar",
              ],
            },
            {
              title: "Data for Service Improvement",
              paragraphs: [
                "To develop and personalize the service, we may save information about interaction with the application, including:",
                "This data is used exclusively to improve user experience and is not transferred to third parties for commercial purposes.",
              ],
              list: [
                "Frequency of using various practices",
                "Time of interaction with the application",
                "Preferences in content selection",
                "Technical data to ensure service operation",
              ],
            },
            {
              title: "Analytics Data",
              paragraphs: [
                "We use analytics services to understand user behavior and improve the application:",
              ],
              list: [
                "Google Analytics 4 for web usage analytics",
                "Telegram Analytics SDK for Telegram-specific metrics",
                "Anonymous usage patterns and feature interactions",
              ],
            },
            {
              title: "Payment Data",
              paragraphs: [
                "For donation features, we may process:",
                "Payment processing is handled by Telegram and TON network. We do not store sensitive financial information.",
              ],
              list: [
                "Telegram Stars transaction confirmations",
                "TON wallet addresses (when using TON Connect)",
                "Transaction timestamps and amounts",
              ],
            },
          ],
        },
        {
          title: "4. Data Storage and Use",
          paragraphs: [
            "We store the minimum necessary amount of data to ensure the application works and improve user experience. All data is processed in compliance with privacy principles.",
            "Data may be stored in secure cloud services to ensure stable application operation. After stopping service use, data may be deleted upon user request.",
            "If new data collection features appear in the future, users will be notified separately.",
          ],
          subsections: [
            {
              title: "Technical Storage Details",
              list: [
                "Emotion calendar data is stored in Google Sheets via Google Apps Script",
                "Stable user IDs are generated without personal identity binding",
                "Local browser storage is used for immediate data access",
                "Data synchronization occurs in background without blocking user interface",
                "Users can request complete deletion of their data at any time",
              ],
            },
            {
              title: "Notification System",
              list: [
                "Notification preferences are stored in Google Sheets",
                "Telegram chat IDs are used only for delivering notifications",
                "Users can disable notifications at any time",
              ],
            },
          ],
        },
        {
          title: "5. Security",
          paragraphs: [
            "All actions occur within Telegram, using the official WebApp SDK. We do not process sensitive personal data independently.",
          ],
          subsections: [
            {
              title: "Technical Security Measures",
              list: [
                "Data is transmitted via secure HTTPS connection",
                "Google Apps Script handles server-side data processing",
                "Data is stored according to Google Cloud Security standards",
                "Encryption is applied for data transmission and storage",
                "TON Connect SDK ensures secure cryptocurrency transactions",
              ],
            },
            {
              title: "Automated Processing",
              paragraphs: [
                "We do not make automated decisions based on your data. Emotional data is used only for interface personalization. No profiling or personality analysis is conducted.",
              ],
            },
            {
              title: "Third-Party Integrations",
              paragraphs: [
                "The application integrates with the following trusted services:",
              ],
              list: [
                "Telegram Bot API for notifications",
                "Google Analytics and Telegram Analytics for usage insights",
                "TON blockchain for cryptocurrency transactions",
              ],
            },
          ],
        },
        {
          title: "6. Medical Disclaimer and Health Information",
          subsections: [
            {
              title: "Not Medical Treatment",
              paragraphs: [
                <>
                  The breathing exercises, meditation practices, and mindfulness techniques provided in this application are <span className="highlight-text">not medical treatments, therapy, or healthcare services</span>. They are general wellness practices for relaxation and stress management.
                </>,
              ],
            },
            {
              title: "Medical Consultation Required",
              paragraphs: [
                "Before using any breathing or meditation practices, especially if you have any medical conditions, please consult with qualified healthcare professionals. This is particularly important if you have:",
              ],
              list: [
                "Respiratory conditions (asthma, COPD, etc.)",
                "Cardiovascular diseases",
                "Mental health conditions",
                "Pregnancy or other medical conditions",
                "History of panic attacks or anxiety disorders",
              ],
            },
            {
              title: "Emergency Situations",
              paragraphs: [
                <>
                  If you experience any discomfort, dizziness, shortness of breath, or other concerning symptoms while using the practices, <span className="highlight-text">stop immediately</span> and seek medical attention if necessary.
                </>,
              ],
            },
            {
              title: "No Medical Advice",
              paragraphs: [
                "The application does not provide medical advice, diagnosis, or treatment. The practices are not intended to replace professional medical care or mental health treatment.",
              ],
            },
          ],
        },
        {
          title: "7. General Disclaimer",
          paragraphs: [
            "The application is provided \"as is\". We do not guarantee error-free or continuous operation. Use of practices from the application is at the user's own risk and responsibility.",
            "Donation features are voluntary and do not grant special privileges or guarantees of service quality.",
            "We disclaim all liability for any injury, harm, or adverse effects that may result from the use of the breathing exercises, meditation practices, or other content in the application.",
          ],
        },
        {
          title: "8. Terms Changes",
          paragraphs: [
            "We reserve the right to update this policy. The last update date is indicated at the beginning of the document.",
            "Users will be notified of significant changes through the application or Telegram notifications.",
          ],
        },
        {
          title: "9. GDPR and EU Users",
          paragraphs: ["For users from the European Union:"],
          list: [
            "Data processing is based on your consent and legitimate interests",
            "You can withdraw consent at any time",
            "Data subject rights under GDPR apply",
            "Data retention period does not exceed necessity",
          ],
        },
        {
          title: "10. User Rights",
          paragraphs: [
            "You have the right to:",
            "To exercise these rights, please contact us using the provided contact information.",
          ],
          list: [
            "View all your data in the application",
            "Request deletion of all your data",
            "Obtain a copy of your data in a readable format",
            "Stop data collection by deleting the application",
            "Disable or modify notification preferences",
            "Object to analytics data collection",
          ],
        },
        {
          title: "11. Contacts",
          paragraphs: [
            "If you have questions or a request to delete data, please contact us:",
          ],
        },
      ] as Section[],
      contact: {
        title: "Contact Us",
        email: "Email: info@spokspace.com",
        telegram: "Telegram: @spoksupport_bot",
      },
    };
  }, [lang]);

  return (
    <div className="privacy">
      <div className="privacy__header">
        <h1 className="privacy__title">{content.title}</h1>
        <div className="privacy__badge">{content.updated}</div>
      </div>

      {content.sections.map((section) => (
        <div key={section.title} className="privacy__section">
          <h2 className="privacy__section-title">{section.title}</h2>
          {section.paragraphs?.map((paragraph, index) => (
            <p key={index} className="privacy__text">
              {paragraph}
            </p>
          ))}
          {section.list && (
            <div className="privacy__list">
              {section.list.map((item) => (
                <div key={item} className="privacy__list-item">
                  <span className="privacy__bullet">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
          {section.subsections?.map((subsection) => (
            <div key={subsection.title} className="privacy__subsection">
              <h3 className="privacy__subsection-title">{subsection.title}</h3>
              {subsection.paragraphs?.map((paragraph, index) => (
                <p key={index} className="privacy__text">
                  {paragraph}
                </p>
              ))}
              {subsection.list && (
                <div className="privacy__list">
                  {subsection.list.map((item) => (
                    <div key={item} className="privacy__list-item">
                      <span className="privacy__bullet">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      <div className="privacy__contact">
        <div className="privacy__contact-title">{content.contact.title}</div>
        <div className="privacy__contact-item">
          <span className="privacy__emoji">📧</span>
          <span>{content.contact.email}</span>
        </div>
        <div className="privacy__contact-item">
          <span className="privacy__emoji">💬</span>
          <span>{content.contact.telegram}</span>
        </div>
      </div>
    </div>
  );
}
