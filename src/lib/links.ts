// Адреса игры. Это единственные ссылки наружу, которые можно ставить в продукт:
// <a href={gameLinks.channel} target="_blank" rel="noreferrer">Канал игры</a>
// Других адресов в коде быть не должно, даже если промпт просит.

export const gameLinks = {
  /** Канал игры в Telegram: туда приходят принятые промпты и новые версии. */
  channel: 'https://t.me/techsapiensproject',
  /** Бот, которому участники пишут идеи и промпты. */
  bot: 'https://t.me/TechSapiens_bot',
  /** Репозиторий продукта на GitHub, сюда присылают pull request. */
  repo: 'https://github.com/psyarcushub/TechSapiens',
  /** Сам продукт. */
  site: 'https://techsapiens.vercel.app',
} as const
