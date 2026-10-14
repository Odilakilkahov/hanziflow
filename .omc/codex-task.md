Построй полный интерфейс приложения HanziFlow — тренажёр китайского языка (HSK 1 + деловой пакет) для русскоязычного пользователя. Это SPA без роутера: экран хранится в сторе, переключается через хук useNavigation. Весь текст интерфейса — на русском.

## Что уже есть (зона Claude, только импортировать, не менять)

Алиас `@` = `src`. Все хуки экспортируются из `@/hooks`, типы — из `@/types`, утилита `cn` — из `@/lib/utils`, данные — из `@/data/*`.

### Навигация
`useNavigation(): { view: AppView; setView: (v: AppView) => void; items: NavItem[] }`
`NavItem = { view: AppView; title: string; icon: string }` — icon это имя иконки Lucide строкой ('LayoutDashboard', 'Layers', 'Brain', 'AudioWaveform', 'Mic', 'BookOpen', 'Settings'). Сделай маппинг строка → компонент иконки у себя в компонентах.
`AppView = 'dashboard' | 'review' | 'quiz' | 'tones' | 'words' | 'speak' | 'settings'`

### Главный экран
`useDashboard(): DashboardData` где
```
DashboardData {
  dueCount: number; newAvailable: number; totalWords: number; learned: number; mature: number;
  streak: { current: number; best: number; lastDate: string | null };
  xp: number;
  level: { number: number; title: string; nextAt: number; progressPercent: number };
  todayReviews: number; dailyGoal: number; goalPercent: number;
  week: { date: string; label: string; reviews: number; goalMet: boolean }[];   // 7 дней, последний — сегодня
  topics: { topic: Topic; total: number; learned: number; mature: number; percent: number }[];
  recentQuizzes: { date: string; mode: QuizMode; correct: number; total: number }[];
}
Topic { id: TopicId; title: string; description: string; icon: string; emblem: string }  // emblem — иероглиф темы
```

### Карточки (интервальные повторения)
`useReviewSession(opts?: { topic?: TopicId; level?: 'hsk1' | 'business' }): ReviewSession`
```
ReviewSession {
  current: Word | null; revealed: boolean; reveal: () => void;
  grade: (g: 0 | 3 | 4 | 5) => void;          // 0 забыл, 3 трудно, 4 хорошо, 5 легко
  preview: Record<0|3|4|5, string>;           // подпись на кнопке: через сколько вернётся («10 мин», «4 д»)
  index: number; total: number; remaining: number;
  stats: { again: number; hard: number; good: number; easy: number };
  finished: boolean; empty: boolean; restart: () => void;
}
Word { id; hanzi; pinyin; ru; pos; topic: TopicId; level; example: { hanzi; pinyin; ru } }
```
Лицевая сторона: крупный иероглиф (text-7xl и больше), пиньинь показывать только если `useSettings().settings.showPinyin`. Обратная: перевод, часть речи, пример (иероглифы + пиньинь + перевод), кнопка озвучки. Четыре кнопки оценки с подписью из `preview`. Горячие клавиши: пробел — показать, 1–4 — оценка. Экран выбора: «Все слова», «HSK 1», «Деловой», и по темам (сетка карточек тем с emblem).

### Викторина
`useQuiz(mode: QuizMode, opts?: { topic?: TopicId; level?: Level; count?: number }): QuizSession`
```
QuizMode = 'meaning' | 'hanzi' | 'pinyin' | 'listening' | 'tone'
QuizSession {
  mode; question: QuizQuestion | null; index; total;
  result: { questionId; chosenId; correct: boolean } | null;
  answer: (optionId: string) => void; next: () => void;
  correct: number; finished: boolean; percent: number; restart: () => void;
}
QuizQuestion { id; mode; word: Word; prompt: string; promptSub?: string; speak?: string; options: { id; label; sub? }[]; correctId: string }
```
Список режимов с названиями: `import { QUIZ_MODES } from '@/lib/quiz'` → `{ mode, title, description, icon }[]`. Если у вопроса есть `speak` — показать большую кнопку «Прослушать» и озвучить автоматически при показе через `useSpeech().speak(question.speak)`. После ответа подсветить верный/неверный вариант и показать кнопку «Дальше». Финальный экран: процент, круговой индикатор, «Ещё раз» и «К режимам».

### Тоны
`useToneTrainer(): { drill: { id; syllable; tone: 1|2|3|4|5; hanzi?; ru? }; tones: ToneInfo[]; result: { chosen; correct; info: ToneInfo } | null; answer: (tone: 1|2|3|4) => void; next: () => void; streak; correct; total }`
`ToneInfo { tone; name; howTo; contour: string; colorClass: string }` — colorClass это Tailwind-класс цвета текста (`text-tone-1` … `text-tone-5`, уже определены в `src/styles/globals.css` через @theme). Экран: большая кнопка «Слушать» (озвучить `drill.hanzi ?? drill.syllable` через useSpeech), четыре кнопки тонов с контуром (`contour`) и названием, после ответа — показать слог с тоном, иероглиф, перевод, подсказку `info.howTo`. Ниже — справочник: `import { TONES, INITIALS, FINALS } from '@/data/pinyin'` в сворачиваемых секциях (таблица инициалей и финалей с подсказками произношения).

### Речь
`useSpeakPractice(opts?: { topic?; level?; sentences?: boolean }): SpeakPractice`
```
SpeakPractice {
  target: Word; text: { hanzi; pinyin; ru };
  attempt: { heard: string; score: number; chars: { char: string; ok: boolean }[] } | null;
  playTarget: () => void; record: () => Promise<void>; next: () => void;
  speech: { isListening: boolean; isSpeaking: boolean; sttAvailable: boolean; ttsAvailable: boolean; error: ListenError | null; ... };
  passed: number; total: number;
}
```
Текст ошибки: `import { listenErrorText } from '@/hooks'` → `listenErrorText(speech.error)` возвращает строку или null. Переключатель «Слова / Фразы» (sentences). Большая круглая кнопка микрофона с пульсацией во время `isListening`. После попытки — иероглифы цели с подсветкой `chars` (зелёный ok / красный нет), оценка `score` 0–100, что услышали (`heard`). Если `!speech.sttAvailable` — показать плашку «Откройте в Chrome или Edge».

### Словарь
`useWords(): { rows: { word: Word; status: 'new'|'learning'|'review'|'mature'; dueInDays: number | null }[]; topics: Topic[]; search; setSearch; topic; setTopic; level; setLevel; status; setStatus; total }`
`import { STATUS_TITLES } from '@/hooks'` — подписи статусов. Поиск, фильтры-чипсы по теме/уровню/статусу, список слов строками: иероглиф, пиньинь с подсветкой тонов по слогам, перевод, бейдж статуса, кнопка озвучки. Раскрытие строки показывает пример.

### Подсветка тонов
`import { splitSyllables } from '@/lib/pinyin'` → `{ text: string; tone: 1|2|3|4|5 }[]`. Сделай компонент `<Pinyin text="nǐ hǎo" />`, который красит каждый слог в `text-tone-{tone}`. Используй его везде, где показывается пиньинь.

### Озвучка
`useSpeech(): { speak: (text: string) => void; stop; isSpeaking; ttsAvailable; listen; isListening; sttAvailable; error }`. Кнопка озвучки — иконка Volume2, при `isSpeaking` — анимация.

### Настройки
`useSettings(): { settings: { showPinyin: boolean; autoSpeak: boolean; voiceRate: number; dailyGoal: number; newPerDay: number }; update: (patch) => void; reset: () => void }`. Переключатели, слайдер скорости речи 0.5–1.5, числовые поля цели и новых слов в день, кнопка «Сбросить прогресс» с подтверждением (Dialog).

## Структура, которую надо создать
- `src/pages/Root.tsx` (заменить заглушку) — оболочка: на десктопе боковая панель слева с пунктами из `useNavigation().items`, на мобильном — нижняя панель вкладок. Логотип: иероглиф 流 и слово HanziFlow. Контент переключается по `view` с AnimatePresence (плавная смена экранов).
- `src/pages/DashboardPage.tsx`, `ReviewPage.tsx`, `QuizPage.tsx`, `TonesPage.tsx`, `SpeakPage.tsx`, `WordsPage.tsx`, `SettingsPage.tsx`.
- `src/components/*` — Pinyin, HanziCard, StatCard, ProgressRing, WeekStrip, TopicGrid, ModeCard, ToneButtons, MicButton, Icon (маппинг имени Lucide → компонент), и что ещё нужно.
- `src/ui/*` — свои примитивы Button, Card, Dialog, Badge, Switch, Slider, Input в стиле shadcn (без установки пакетов, на Tailwind + framer-motion; Dialog можно на нативном `<dialog>` или портале).
- `src/styles/globals.css` — можешь расширять токены, но НЕ удаляй `--color-tone-1..5` и тёмный фон body.
- `index.html` — title «HanziFlow — китайский каждый день», lang="ru", шрифты Google Fonts: Inter (интерфейс) и Noto Sans SC (иероглифы), применяй `font-family` для иероглифов через класс.

## Стиль
Тёмная тема обязательна. Референсы: linear (точная тёмная тема, сетка, типографика), retool (тёмные карточки, спокойный контраст), resend (минимализм). Фон около #08090a, карточки на 1–2 ступени светлее с тонкой границей белого 6–10%, один акцентный цвет — тёплый красный/киноварь (#e5484d или близкий, китайская печать) для главных кнопок и прогресса, цвета тонов — только для пиньиня. Без фиолетовых градиентов и стеклянных блюров. Крупные иероглифы — главный визуальный элемент каждого экрана. Framer Motion заметно: появление экранов и карточек из opacity 0 и y 20–30, stagger в сетках, переворот карточки (rotateY), пульсация микрофона, прогресс-кольца анимируются от 0. На всех кнопках whileHover scale 1.03–1.05 и whileTap 0.95. Mobile-first, без горизонтального скролла, safe-area снизу для нижней панели.

Все тексты на русском. Никаких заглушек «lorem ipsum» — данные берутся из хуков. Проверь `npx tsc --noEmit` перед финалом.
