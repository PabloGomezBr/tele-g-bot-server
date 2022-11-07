export const CLIENT_URL = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://tele-g-bot.up.railway.app';
