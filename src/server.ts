/* eslint-disable new-cap */
import express, { Application, Request, Response, NextFunction } from 'express';
import logger from 'node-color-log';
import telegramBot from 'node-telegram-bot-api';

import commands from './api/bot/commands';
import { onTextChatbot, onTextContacto, onTextDice, onTextDocumento, onTextEcho, onTextEncuesta, onTextGatito, onTextGatito2, onTextHelp, onTextHola, onTextLocalizacion, onTextMensaje, onTextStart } from './api/bot/controller';
import { saveDoc, sendHelp } from './api/bot/helpers';
import router from './api/router';
import postgres, { connectToPostgres } from './database/connect';
// import axios from 'axios';

// Boot express
const app: Application = express();
const port = process.env.PORT || 3000;

connectToPostgres();

app.use('/', router);

// Start server
app.listen(port, () => logger.color('green').success(`\nServer is listening on port ${port}!`));

// Init Telegram Bot
const token = '5698606555:AAH2NvBeqzpU5c0MthSUtuRTooO7goHnL7o';
export const bot = new telegramBot(token, { polling: true });

bot.on('message', (msg) => {
    logger.color('green').info(`Message received from ${msg.from.username} -> ${msg.text}`);
});

// Listeners
bot.onText(/\/start/, msg => onTextStart(msg));
bot.onText(/\/hola/, msg => onTextHola(msg));
bot.onText(/\/help/, msg => onTextHelp(msg));
bot.onText(/\/chatbot/, msg => onTextChatbot(msg));
bot.onText(/\/localizacion/, msg => onTextLocalizacion(msg));
bot.onText(/\/echo (.+)/, (msg, match) => onTextEcho(msg, match));
bot.onText(/\/dice/, msg => onTextDice(msg));
bot.onText(/\/gatito/, msg => onTextGatito(msg));
bot.onText(/\/gatito2 (.+)/, (msg, match) => onTextGatito2(msg, match));
bot.onText(/\/contacto/, msg => onTextContacto(msg));
bot.onText(/\/encuesta/, msg => onTextEncuesta(msg));
bot.onText(/\/documento/, msg => onTextDocumento(msg));
bot.onText(/\/mensaje (.+)/, (msg, match) => onTextMensaje(msg, match));

bot.on('document', (doc) => {
    try {
        const chatId = doc.chat.id;
        if (doc.document) {
            saveDoc(doc.document.file_id, doc.date, doc.document.file_name);
        }

        bot.sendMessage(chatId, 'Document received!');
    } catch (error) {
        console.log('ERROR uploading document: ', error);
    }
});

bot.on('photo', (photo) => {
    if (photo.photo) {
        try {
            const chatId = photo.chat.id;
            const stream = bot.getFile(photo.photo[photo.photo.length - 1].file_id);
            // TODO: Guardar la imagen en server ?
            // stream.pipe(createWriteStream(`uploads/imgs/${photo.date}`));
            bot.sendMessage(chatId, 'Photo received!');
        } catch (error) {
            console.log('ERROR uploading image: ', error);
        }
    }
});

export default app;

// const server = http.createServer((req, res) => {
//     if (req.url === '/message' && req.method === 'POST') {
//         const msg = req.body;
//         console.log('*************** INSIDE ************ - POST RECEIVED: ', msg);
//         res.writeHead(200, { "Content-Type": "text/html" });
//         // res.write(`<h1>${msg}</h1>`);
//         // res.end(`<h1>${msg}</h1>`);
//         res.end(`<h1>funciona... a medias</h1>`);
//     } else {
//         let mensaje = "<h1>Tele-g-bot</h1>";
//         res.statusCode = 200;
//         res.setHeader("Content-Type", "text/html");
//         res.end(mensaje);
//     }
//     if (req.url === '/message') {
//         client.query(
//           'SELECT message FROM messages WHERE id = 1',
//           (err, data) => {
//             if (err) {
//               console.log('ERRRROOOOOR: ', err);
//               res.statusCode = 200;
//               res.setHeader('Content-Type', 'text/html');
//               res.end('ERROR: ', err);
//             } else {
//               console.log(
//                 'Seting msg from database: ',
//                 data.rows[0].message
//               );
//               res.statusCode = 200;
//               res.setHeader('Content-Type', 'text/html');
//               res.end(data.rows[0].message);
//             }
//             client.end();
//           }
//         );
//     }
// });
