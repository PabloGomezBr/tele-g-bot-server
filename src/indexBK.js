const TelegramBot = require("node-telegram-bot-api");

// replace the value below with the Telegram token you receive from @BotFather
const token = "5698606555:AAH2NvBeqzpU5c0MthSUtuRTooO7goHnL7o";

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"

    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId, resp);
});

bot.onText(/\/hola/, (msg, match) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'HOLA!! Soy un bot :D');
  }
);

bot.onText(/\/clara/, (msg, match) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'HOLA!! TE QUIEROOOOOO!! :3');
  }
);

// Listen for any kind of message. There are different kinds of
// messages.
bot.on("message", (msg) => {
    const chatId = msg.chat.id;

    // send a message to the chat acknowledging receipt of their message
    // bot.sendMessage(chatId, 'Received your message');
    console.log(chatId);
});
