/* eslint-disable new-cap */
import http from 'http';
import path from 'path';

import cors from 'cors';
import express, { Application, Request, Response, NextFunction } from 'express';
import logger from 'node-color-log';
import telegramBot from 'node-telegram-bot-api';
import { Server } from 'socket.io';

import router from './api/router';
import * as Controller from './bot/controller';
import { saveDoc, sendHelp } from './bot/helpers';
import { postgres } from './database/connect';
// import axios from 'axios';

export var isDatabaseConnected = false;

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config(); // For ENV vars

// Init express
const app: Application = express();
const port = process.env.PORT || 3001;

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    app.use(cors());
} else {
    app.use(cors());
    // const whileListCors = ['http://localhost:3000'];
    // app.use(cors({
    //     origin: whileListCors
    // }));
}

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../client/build')));
app.use('/api', router);

// Start server
const server = app.listen(port, async () => {
    logger.log('Trying to connect to database...');
    try {
        await postgres.connect();
        logger.color('green').log(`Connected successfully to database [${process.env.DATABASE_NAME}]\n`);
        isDatabaseConnected = true;
    } catch (error) {
        logger.color('red').log(`ERROR: Failed establishing connection to database [${process.env.DATABASE_NAME}]: `, error);
        logger.color('yellow').log('WARNING: Some features involving database won\'t work!\n');
    }
    logger.color('green').log(`Server is listening on port ${port}!`);
});

const io = new Server(server,
    {
        cors: {
            origin: '*',
            methods: '*'
        } });
io.on('connection', (socket) => {
    logger.log('Socket IO connected', socket);
});

// Init Telegram Bot
const token = process.env.TELEGRAM_TOKEN;
export const bot = new telegramBot(token, { polling: true });

bot.on('message', (msg) => {
    logger.color('green').info(`Message received from ${msg.from.username} -> ${msg.text}`);
});

// Listeners
bot.onText(/\/start/, msg => Controller.onTextStart(msg));
bot.onText(/\/saludos/, msg => Controller.onTextSaludos(msg));
bot.onText(/\/help/, msg => Controller.onTextHelp(msg));
bot.onText(/\/chatbot/, msg => Controller.onTextChatbot(msg));
bot.onText(/\/localizacion/, msg => Controller.onTextLocalizacion(msg));
bot.onText(/\/echo (.+)/, (msg, match) => Controller.onTextEcho(msg, match));
bot.onText(/\/dice/, msg => Controller.onTextDice(msg));
bot.onText(/\/gatito/, msg => Controller.onTextGatito(msg));
bot.onText(/\/gatito2 (.+)/, (msg, match) => Controller.onTextGatito2(msg, match));
bot.onText(/\/contacto/, msg => Controller.onTextContacto(msg));
bot.onText(/\/encuesta/, msg => Controller.onTextEncuesta(msg));
bot.onText(/\/documento/, msg => Controller.onTextDocumento(msg));
bot.onText(/\/mensaje (.+)/, (msg, match) => Controller.onTextMensaje(msg, match));

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

export { io, app };

// const server = http.createServer((req, res) => {
//     if (req.url === '/message' && req.method === 'POST') {
//         const msg = req.body;
//         console.log('*************** INSIDE ************ - POST RECEIVED: ', msg);
//         res.writeHead(200, { "Content-Type": "text/html" });
//         // res.write(`<h1>${msg}</h1>`);
//         // res.end(`<h1>${msg}</h1>`);
//         res.end(`<h1>funciona... a medias</h1>`);
//     } else {
//         let mensaje = "<h1>Tele-G-Bot</h1>";
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
