import logger from 'node-color-log';
import TelegramBot from 'node-telegram-bot-api';

import { postgres } from '../database/connect';
import { bot, isDatabaseConnected } from '../server';
import commands from './commands';
import { saveDoc, sendHelp } from './helpers';

export async function onTextStart(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    await bot.setMyCommands(commands);
    bot.sendMessage(
        chatId,
        `Hola ${msg.from?.first_name}, ¿en qué puedo ayudarte?`
    );
    sendHelp(msg);
}

export function onTextHelp(msg: TelegramBot.Message) {
    sendHelp(msg);
}

export function onTextSaludos(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    if (isDatabaseConnected) {
        bot.sendMessage(chatId, `¡Hola <b>${msg.from.first_name}</b>!`, { parse_mode: 'HTML' });
    } else {
        bot.sendMessage(chatId, `¡Hola <b>${msg.from.first_name}</b>!`, { parse_mode: 'HTML' });
        bot.sendMessage(chatId, 'Lamentablemente no hay base de datos :(');
    }
}

export async function onTextChatbot(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const user = await bot.getMe();
    logger.log(user);

    bot.sendMessage(chatId, `Mi nombre es <b>${user.first_name}</b>.`, {
        parse_mode: 'HTML'
    });
}

export function onTextLocalizacion(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Aquí reside mi programador.');
    bot.sendLocation(chatId, 41.390205, 2.154007);
}

export function onTextEcho(msg: TelegramBot.Message, text: RegExpExecArray) {
    const chatId = msg.chat.id;
    const resp = text ? text[1] : 'User';
    bot.sendMessage(chatId, resp);
}

export function onTextDice(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    bot.sendDice(chatId);
}

export function onTextGatito(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    bot.sendChatAction(chatId, 'upload_photo');
    const firstNumber = Math.floor(Math.random() * 10);
    const secondNumber = Math.floor(Math.random() * 10);

    try {
        bot.sendPhoto(
            chatId,
            `https://placekitten.com/${firstNumber}/${secondNumber}`
        );
    } catch (error) {
        bot.sendMessage(chatId, 'Lo siento... el gatito a muerto :(');
        logger.color('red').error('ERROR EN GATITO: ', error);
    }
}

export function onTextGatito2(msg: TelegramBot.Message, text: RegExpExecArray) {
    const chatId = msg.chat.id;
    const phrase = text[1];
    bot.sendChatAction(chatId, 'upload_photo');

    bot.sendPhoto(chatId, `https://cataas.com/cat/says/${phrase}`);
}

export function onTextContacto(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    bot.sendContact(chatId, '684537618', 'Fake', { last_name: 'Contact' });
}

export function onTextEncuesta(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    bot.sendPoll(chatId, '¿Pregunta super interesante?', ['Sí', 'No']);
}

export function onTextDocumento(msg: TelegramBot.Message) {
    const startMessage = '¿Qué tipo de documento?';
    const keyboard = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Gasto de empleado',
                        callback_data: 'newGastoEmpleado'
                    },
                    { text: 'Recibo de compra', callback_data: 'newRecibo' },
                    {
                        text: 'Presupuesto de proveedor',
                        callback_data: 'newPresupuesto'
                    }
                ]
            ]
        }
    };
    bot.sendMessage(msg.chat.id, startMessage, keyboard);
}

export async function onTextMensaje(msg: TelegramBot.Message, text: RegExpExecArray) {
    const chatId = msg.chat.id;
    const resp = text[1];

    try {
        await postgres.query(`UPDATE messages SET message = '${resp}' WHERE id = 1`);
        bot.sendMessage(
            chatId,
            '¡MENSAJE PUBLICADO EN EL <b><a href="https://tele-g-bot.up.railway.app">SERVIDOR</a>!</b>',
            {
                parse_mode: 'HTML'
            }
        );
    } catch (error) {
        bot.sendMessage(
            chatId,
            'Algo ha ido mal...\nDe momento te dejo aquí el <b><a href="https://tele-g-bot.up.railway.app">servidor</a></b>',
            {
                parse_mode: 'HTML'
            }
        );
        logger.color('red').log('Error writting in database: ', error);
    }
    // postgres.query(
    //     `UPDATE messages SET message = '${resp}' WHERE id = 1`,
    //     (err: any, { rows } : { rows: any}) => {
    //         if (err) {
    //             console.log(err);
    //             bot.sendMessage(
    //                 chatId,
    //                 'Algo ha ido mal y estoy trabajando en ello...'
    //             );
    //             bot.sendMessage(
    //                 chatId,
    //                 'De momento te dejo aquí el <b><a href="https://tele-g-bot.up.railway.app">servidor</a></b>',
    //                 {
    //                     parse_mode: 'HTML'
    //                 }
    //             );
    //         } else {
    //             bot.sendMessage(
    //                 chatId,
    //                 '¡MENSAJE PUBLICADO EN EL <b><a href="https://tele-g-bot.up.railway.app">SERVIDOR</a>!</b>',
    //                 {
    //                     parse_mode: 'HTML'
    //                 }
    //             );
    //         }
    //         postgres.end();
    //     }
    // );
}

// axios
//     .post("https://tele-g-bot.up.railway.appmessage", { resp })
//     .then((res) => {
//         console.log(`statusCode: ${res.statusCode}`);
//         console.log(res);
//         bot.sendMessage(chatId, `¡MENSAJE PUBLICADO EN EL <b><a href="https://tele-g-bot.up.railway.app">SERVIDOR</a>!</b>`, {
//             parse_mode: "HTML",
//         });
//     })
//     .catch((error) => {
//         console.error('ERROR POST: ', error);
//         bot.sendMessage(chatId, 'El comando no está listo todavía...');
//         bot.sendMessage(chatId, `De momento te dejo aquí el <b><a href="https://tele-g-bot.up.railway.app">servidor</a></b>`, {
//             parse_mode: "HTML",
//         });
//     });

// server.post("/messages", function (req, res) {
// const result = new Message.findOneAndUpdate({}, { title: resp }).exec();
// contact.save(function (err) {
// if (err) {
// bot.sendMessage(chatId, 'Algo ha ido mal...');
// } else {
// bot.sendMessage(chatId, result + ' enviado al server!');
// }
// });
// });
//     });
// }
