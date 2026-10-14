import type { Topic, TopicId } from '@/types'

export const TOPICS: Topic[] = [
  { id: 'greetings', title: 'Приветствия', description: 'Здороваться, благодарить, прощаться', icon: 'Hand', emblem: '好' },
  { id: 'pronouns', title: 'Местоимения', description: 'Я, ты, он, мы, это, то', icon: 'Users', emblem: '我' },
  { id: 'numbers', title: 'Числа и счёт', description: 'От 1 до 10, деньги, счётные слова', icon: 'Hash', emblem: '三' },
  { id: 'time', title: 'Время', description: 'Сегодня, завтра, часы, недели, месяцы', icon: 'Clock', emblem: '天' },
  { id: 'family', title: 'Семья', description: 'Мама, папа, сын, дочь, друг', icon: 'Heart', emblem: '家' },
  { id: 'people', title: 'Люди и профессии', description: 'Учитель, студент, врач, господин', icon: 'UserRound', emblem: '人' },
  { id: 'food', title: 'Еда и напитки', description: 'Рис, чай, вода, фрукты, ресторан', icon: 'Utensils', emblem: '吃' },
  { id: 'places', title: 'Места и дорога', description: 'Школа, магазин, больница, направления', icon: 'MapPin', emblem: '店' },
  { id: 'things', title: 'Вещи', description: 'Книга, компьютер, одежда, стол', icon: 'Package', emblem: '书' },
  { id: 'verbs', title: 'Глаголы', description: 'Есть, пить, идти, смотреть, работать', icon: 'Zap', emblem: '去' },
  { id: 'adjectives', title: 'Прилагательные', description: 'Большой, маленький, красивый, холодный', icon: 'Sparkles', emblem: '大' },
  { id: 'grammar', title: 'Грамматика', description: 'Частицы, наречия, служебные слова', icon: 'Puzzle', emblem: '的' },
  { id: 'questions', title: 'Вопросы', description: 'Что, кто, где, сколько, как', icon: 'HelpCircle', emblem: '吗' },
  { id: 'business', title: 'Деловой китайский', description: 'Цена, контракт, поставка, WeChat', icon: 'Briefcase', emblem: '钱' },
]

export const TOPIC_BY_ID: Record<TopicId, Topic> = Object.fromEntries(
  TOPICS.map((t) => [t.id, t]),
) as Record<TopicId, Topic>
