import { createWriteStream } from 'fs';

import telegramBot from 'node-telegram-bot-api';

import { bot } from '../server';
import commands from './commands';

export function sendHelp(msg: telegramBot.Message) {
    const chatId = msg.chat.id;
    const commandsStr = commands.reduce((accum, value) => {
        return `${accum}\n- /${value.command}: ${value.description}`;
    }, 'Estos son los comandos disponibles:');

    bot.sendMessage(chatId, commandsStr, { parse_mode: 'HTML' });
}

export function saveDoc(fileId: string, date: number, name: string | undefined) {
    const stream = bot.getFileStream(fileId);
    stream.pipe(createWriteStream(`uploads/docs/${date}_${name}`));
}
