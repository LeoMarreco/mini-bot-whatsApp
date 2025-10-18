const { Client, LocalAuth } = require("whatsapp-web.js");
const express = require("express");
const qrcode = require("qrcode-terminal");
const { saveMessage, initDb } = require("./db");


const app = express();
const port = 3000;
let qrCodeImage = null;


// Inicializa o cliente WhatsApp com autenticação local
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
});

// Evento disparado quando o QR Code é gerado
client.on("qr", (qr) => {
    qrcode.generate(qr,{small: true});
    qrCodeImage = qr;
    console.log("QR recebido.")
});


// Quando o cliente está pronto
client.on("ready", () => {
    console.log("Cliente WhatsApp pronto!");
    qrCodeImage = null
});


// Quando autenticado
client.on("auth_failure", (msg) => {
    console.error("Falha na autenticação:", msg);
});


// Quando recebe uma mensagem
// client.on("message", async (message) => {
//     console.log(`Mensagem recebida de ${message.from}: ${message.body}`);
    
//     try {
//         await saveMessage(message.from, message.body);
    
//     } catch (err) {
//         console.error("Erro ao salvar mensagem:", err);
//     }
// });

client.on("message", async (message) => {
    console.log(`Mensagem recebida de ${message.from}: ${message.body}`);

    try {
        // Salva a mensagem no banco de dados
        await saveMessage(message.from, message.body);

        // 🧠 Resposta automática "#ping" → "pong!"
        if (message.body.trim().toLowerCase() === "#ping") {
            await message.reply("pong!");
            console.log("Resposta automática enviada: pong!");
        }

    } catch (err) {
        console.error("Erro ao salvar ou responder mensagem:", err);
    }
});


// Inicializa o banco e o cliente
(async () => {
    try {
        await initDb();
        console.log("Banco de dados inicializado.");
        client.initialize();
    
    } catch (err) {
        console.error("Erro ao inicializar:", err);
    }
})();


// Rota para visualizar o QR Code (formato texto)
app.get("/qr", (req, res) => {
    if (qrCodeImage) {
        res.send(`<h2>Escaneie o QR Code no WhatsApp</h2><pre>${qrCodeImage}</pre>`)
    
    } else {
        res.send("Cliente já autenticado ou QR não disponível.");
    }
});


// Inicia o servidor Express
app.listen(port, () => {
    console.log(`Servidor Express rodando em http://localhost:${port}`);
});