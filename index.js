const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const pino = require('pino');

async function startSaeed() {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    sock.ev.on('creds.update', saveCreds);

    // استلام الرسائل والرد عليها
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

        if (text === '.قائمة') {
            await sock.sendMessage(from, { text: '🌟 أهلاً بك يا سعيد! البوت شغال الآن من GitHub برأس مرفوع.' });
        }
        
        if (text === '.فحص') {
            await sock.sendMessage(from, { text: '🚀 استجابة سريعة جداً!' });
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log('✅ البوت متصل الآن! جرب أرسل (.قائمة) في الواتساب.');
        }
        if (connection === 'close') startSaeed();
    });
}

startSaeed();
