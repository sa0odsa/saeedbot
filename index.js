const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore 
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');

async function startBot() {
    // إعداد الجلسة وحفظ الملفات في مجلد session
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'fatal' }),
        printQRInTerminal: false, // تعطيل QR لأننا سنستخدم الكود
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }))
        },
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    // طلب كود الربط إذا لم يكن الحساب مسجلاً
    if (!sock.authState.creds.registered) {
        
        // --- تعديلك هنا يا سعيد ---
        const myNumber = "967770179625"; // ضع رقمك هنا بالصيغة الدولية
        // -------------------------

        console.log(`\n⏳ جاري طلب كود الربط للرقم: ${myNumber}...`);
        
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(myNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log("\n" + "=".repeat(40));
                console.log("✅ كود الربط الخاص بك هو: " + code);
                console.log("=".repeat(40) + "\n");
                console.log("افتح واتساب > الأجهزة المرتبطة > ربط هاتف > أدخل الكود أعلاه.");
            } catch (error) {
                console.log("❌ فشل طلب الكود: ", error.message);
            }
        }, 8000); // انتظار 8 ثوانٍ لضمان استقرار السيرفر
    }

    // حفظ تحديثات الجلسة
    sock.ev.on('creds.update', saveCreds);

    // متابعة حالة الاتصال
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            console.log("\n🚀 [مبروك يا سعيد] البوت متصل الآن وشغال من سيرفرات GitHub!");
        }
        if (connection === 'close') {
            console.log("⚠️ انقطع الاتصال، جاري إعادة التشغيل...");
            startBot();
        }
    });
}

// البدء
startBot();
