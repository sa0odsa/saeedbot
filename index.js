const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    disconnectReason 
} = require('@whiskeysockets/baileys');
const pino = require('pino');

async function startSaeedBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./session');

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: true,
        browser: ["Saeed Bot", "Chrome", "1.0.0"]
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const messageType = Object.keys(msg.message)[0];
        const body = messageType === 'conversation' ? msg.message.conversation : 
                     messageType === 'extendedTextMessage' ? msg.message.extendedTextMessage.text : '';

        const from = msg.key.remoteJid;

        // --- قسم الأوامر ---
        if (body === '.قائمة' || body === '.اوامر') {
            const menuText = `
🌟 *أهلاً بك في بوت سعيد الذبحاني* 🌟

🤖 *الأوامر المتاحة حالياً:*
1️⃣ *.اوامر* : لعرض هذه القائمة.
2️⃣ *.فحص* : للتأكد من سرعة البوت.
3️⃣ *.وقت* : لمعرفة التاريخ والوقت الحالي.

⚠️ _سيتم إضافة ميزات التحميل قريباً!_
            `;
            await sock.sendMessage(from, { text: menuText });
        }

        if (body === '.فحص') {
            await sock.sendMessage(from, { text: '🚀 البوت يعمل بأقصى سرعة على سيرفرات GitHub!' });
        }

        if (body === '.وقت') {
            const now = new Date().toLocaleString('ar-YE');
            await sock.sendMessage(from, { text: `📅 الوقت الحالي في اليمن: \n${now}` });
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== 401;
            if (shouldReconnect) startSaeedBot();
        } else if (connection === 'open') {
            console.log('✅ تم تفعيل الأوامر! جرب أرسل (.قائمة) في الواتساب الآن.');
        }
    });
}

startSaeedBot();
