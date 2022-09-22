const http = require("http");
var express = require("express");
var app = express();
const port = process.env.PORT || 3000;
const axios = require("axios");

const server = http.createServer((req, res) => {
    if (req.url === '/message' && req.method === 'POST') {
        const { msg } = req.body;
        console.log('*************** INSIDE ************ - POST RECEIVED: ', req.body);
        res.writeHead(200, { "Content-Type": "text/html" });
        // res.write(`<h1>${msg}</h1>`);
        res.end(`<h1>${msg}</h1>`);
    } else {
        let mensaje = "<h1>Tele-g-bot</h1>";
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");
        res.end(mensaje);
    }
});

server.listen(port, () => {
    console.log(`Server running at port ` + port);
});

app.post("/message", function (req, res) {
    const msg = req.body;
    console.log('*************** ALONE ************ - POST RECEIVED: ', msg);
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(`<h1>${msg}</h1>`);
    res.end(`<h1>${msg}</h1>`);
});

/****************************************/

const telegramBot = require("node-telegram-bot-api");
const { createWriteStream } = require("fs");

const token = "5698606555:AAH2NvBeqzpU5c0MthSUtuRTooO7goHnL7o";

const bot = new telegramBot(token, { polling: true });

const commands = [
    {
        command: "help",
        description: "Te mostraré el listado de comandos disponibles.",
    },
    { command: "chatbot", description: "Me presentaré." },
    {
        command: "contacto",
        description: "Te enviaré los datos de contacto de Fake Contact.",
    },
    {
        command: "localizacion",
        description:
            "Te señalaré la ciudad de residencia de mi programador en un mapa.",
    },
    {
        command: "echo",
        description:
            "Responderé el mensaje que pongas a continuación del comando.",
    },
    { command: "saludos", description: "Te saludaré, usando tu nombre." },
    { command: "dice", description: "Lanzaré un dado." },
    { command: "encuesta", description: "Crearé una encuesta muy original." },
    {
        command: "gatito",
        description: "Te enviaré la foto de un gatito aleatorio.",
    },
    {
        command: "gatito2",
        description: "Foto random de gatito repitiendo tu mensaje!",
    },
    { command: "mensaje", description: "Cambia el mensaje de la web" },
];

function sendHelp(msg) {
    const chatId = msg.chat.id;
    const commandsStr = commands.reduce((accum, value) => {
        return `${accum}\n- /${value.command}: ${value.description}`;
    }, "Estos son los comandos disponibles:");

    bot.sendMessage(chatId, commandsStr, { parse_mode: "HTML" });
}

function saveDoc(file_id, date, name) {
    const stream = bot.getFileStream(file_id);
    stream.pipe(createWriteStream(`uploads/docs/${date}_${name}`));
}

bot.on("message", (msg) => {
    console.log(msg);
});

bot.on("document", (doc) => {
    try {
        const chatId = doc.chat.id;
        saveDoc(doc.document.file_id, doc.date, doc.document.file_name);

        bot.sendMessage(chatId, "Document received!");
    } catch (error) {
        console.log("ERROR uploading document: ", error);
    }
});

bot.on("photo", (photo) => {
    try {
        const chatId = photo.chat.id;
        const stream = bot.getFile(photo.photo[photo.photo.length - 1].file_id);
        stream.pipe(createWriteStream(`uploads/imgs/${photo.date}`));

        bot.sendMessage(chatId, "Photo received!");
    } catch (error) {
        console.log("ERROR uploading image: ", error);
    }
});

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;

    await bot.setMyCommands(commands);

    bot.sendMessage(
        chatId,
        `Hola ${msg.from.first_name}, ¿en qué puedo ayudarte?`
    );
    sendHelp(msg);
});

bot.onText(/\/help/, (msg) => {
    sendHelp(msg);
});

bot.onText(/\/chatbot/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await bot.getMe();
    console.log(user);

    bot.sendMessage(chatId, `Mi nombre es <b>${user.first_name}</b>.`, {
        parse_mode: "HTML",
    });
});

bot.onText(/\/localizacion/, async (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, "Aquí reside mi programador.");
    bot.sendLocation(chatId, 41.390205, 2.154007);
});

bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1];

    bot.sendMessage(chatId, resp);
});

bot.onText(/\/saludos/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, `¡Hola <b>${msg.from.first_name}</b>!`, {
        parse_mode: "HTML",
    });
});

bot.onText(/\/dice/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendDice(chatId);
});

bot.onText(/\/gatito/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendChatAction(chatId, "upload_photo");
    const firstNumber = Math.floor(Math.random() * 10);
    const secondNumber = Math.floor(Math.random() * 10);

    try {
        bot.sendPhoto(
            chatId,
            `https://placekitten.com/${firstNumber}/${secondNumber}`
        );
    } catch (error) {
        bot.sendMessage(chatId, "Lo siento... el gatito a muerto :(");
        console.log("ERROR EN GATITO: ", error);
    }
});

bot.onText(/\/gatito2 (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const phrase = match[1];
    bot.sendChatAction(chatId, "upload_photo");

    bot.sendPhoto(chatId, `https://cataas.com/cat/says/${phrase}`);
});

bot.onText(/\/contacto/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendContact(chatId, "684537618", "Fake", { last_name: "Contact" });
});

bot.onText(/\/encuesta/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendPoll(chatId, "¿Pregunta super interesante?", ["Sí", "No"]);
});

bot.onText(/\/documento/, function (msg) {
    const startMessage = "¿Qué tipo de documento?";
    const keyboard = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "Gasto de empleado",
                        callback_data: "newGastoEmpleado",
                    },
                    { text: "Recibo de compra", callback_data: "newRecibo" },
                    {
                        text: "Presupuesto de proveedor",
                        callback_data: "newPresupuesto",
                    },
                ],
            ],
        },
    };
    bot.sendMessage(msg.chat.id, startMessage, keyboard);
});

bot.onText(/\/mensaje (.+)/, (command, message) => {
    const chatId = command.chat.id;
    const resp = message[1];

    // bot.sendMessage(chatId, 'El comando no está listo todavía...');
    // bot.sendMessage(chatId, `De momento te dejo aquí el <b><a href="https://web-production-9e1b.up.railway.app/">servidor</a></b>`, {
    // 	parse_mode: "HTML",
    // });

    axios
        .post("https://web-production-9e1b.up.railway.app/message", {
            msg: resp,
        })
        .then((res) => {
            console.log(`statusCode: ${res.statusCode}`);
            console.log(res);
            bot.sendMessage(chatId, `¡MENSAJE PUBLICADO EN EL <b><a href="https://web-production-9e1b.up.railway.app/">SERVIDOR</a>!</b>`, {
                parse_mode: "HTML",
            });
        })
        .catch((error) => {
            console.error('ERROR POST: ', error);
            bot.sendMessage(chatId, 'El comando no está listo todavía...');
            bot.sendMessage(chatId, `De momento te dejo aquí el <b><a href="https://web-production-9e1b.up.railway.app/">servidor</a></b>`, {
                parse_mode: "HTML",
            });
        });

    // server.post("/messages", function (req, res) {
    // 	const result = new Message.findOneAndUpdate({}, { title: resp }).exec();
    // 	contact.save(function (err) {
    // 		if (err) {
    // 			bot.sendMessage(chatId, 'Algo ha ido mal...');
    // 		} else {
    // 			bot.sendMessage(chatId, result + ' enviado al server!');
    // 		}
    // 	});
    // });
});

// bot.on('callback_query', (query) => {
//     const id = query.message.chat.id;
//     switch (query.data) {
//         case 'newGastoEmpleado':
//             bot.sendMessage(id, 'Introduce el nombre del archivo.');
//             bot.on('message', nameMsg => {
//                 bot.sendMessage(id, `A continuación, introduce el nombre del proyecto.`);
//                 bot.on('message', projectMsg => {
//                     bot.sendMessage(id, 'Finalmente, sube la foto o archivo.');
//                     bot.on('document', doc => {
//                         saveDoc(doc.document.file_id, doc.date, nameMsg.text || doc.document.file_name);

//                         bot.sendMessage(chatId, `Documento guardado para el proyecto ${projectMsg.text}.`);
//                     })
//                 });
//             });
//             break;
//         case 'newRecibo':
//             bot.sendMessage(id, 'Introduce el nombre del archivo');
//             break;
//         case 'newPresupuesto':
//             bot.sendMessage(id, 'Introduce el nombre del archivo');
//             break;
//     } });
