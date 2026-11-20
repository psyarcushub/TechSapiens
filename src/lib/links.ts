// Адреса эксперимента TechSapiens Project. По умолчанию на сайте их нет: сайт показывает
// только сам продукт. Ставить такую ссылку можно, только если промпт прямо об этом просит:
// <a href={gameLinks.channel} target="_blank" rel="noreferrer">Канал TechSapiens Project</a>
// Других адресов в коде быть не должно, даже если промпт просит.

export const gameLinks = {
  /** Канал TechSapiens Project в Telegram: туда приходят принятые промпты и новые версии. */
  channel: 'https://t.me/techsapiensproject',
  /** Бот, которому участники пишут идеи и промпты. */
  bot: 'https://t.me/TechSapiens_bot',
  /** Репозиторий продукта на GitHub, сюда присылают pull request. */
  repo: 'https://github.com/psyarcushub/TechSapiens',
  /** Сам продукт. */
  site: 'https://techsapiens.vercel.app',
} as const
