const input = document.getElementById('messageInput');
const chatBody = document.getElementById('chatBody');
const statusText = document.getElementById('statusText');
const sendIcon = document.getElementById('sendIcon');

let chatState = 'start';

const menuOptions = `
<strong>Hola! este es nuestro menú de opciones:</strong><br><br>
1️⃣ Consultar Saldo<br>
2️⃣ Soporte Técnico<br>
3️⃣ Ventas y Promociones<br>
4️⃣ Ubicación de Sucursales<br>
5️⃣ Hablar con un asesor<br><br>
9️⃣ Volver al menú principal
`;

const responses = {
    1: "Tu saldo actual es de $500.00 MXN.",
    2: "Para soporte técnico, por favor reinicia tu módem y espera 5 minutos. Si el problema persiste, elige la opción 5.",
    3: "¡Tenemos una promoción del 50% de descuento en planes anuales solo por hoy!",
    4: "Nuestra sucursal más cercana está en Av. Reforma 222, CDMX. Horario: 9am - 6pm.",
    5: "Por favor aguarde en la línea, un asesor se conectará en breve 🎧"
};

input.addEventListener('input', () => {
    if (input.value.trim() !== "") {
        sendIcon.classList.remove('fa-microphone');
        sendIcon.classList.add('fa-paper-plane');
    } else {
        sendIcon.classList.add('fa-microphone');
        sendIcon.classList.remove('fa-paper-plane');
    }
});

input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'p. m.' : 'a. m.';
    hours = hours % 12 || 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;
}

function appendMessage(text, sender) {
    const divWrapper = document.createElement('div');
    const isUser = sender === 'user';

    divWrapper.className = `bubble ${isUser ? 'bubble-out' : 'bubble-in'} animate-msg`;

    const checks = isUser ? '<span class="text-[#53bdeb] ml-1"><i class="fas fa-check-double"></i></span>' : '';

    divWrapper.innerHTML = `
        ${text}
        <div class="msg-time">
            ${getCurrentTime()}
            ${checks}
        </div>
    `;

    chatBody.appendChild(divWrapper);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function extractNumberOption(text) {
    const onlyDigits = text.trim().match(/^\d+$/);
    if (onlyDigits) return parseInt(text.trim(), 10);
    return null;
}

function sendMessage() {
    const rawText = input.value;
    const text = rawText.trim();
    if (!text) return;

    appendMessage(escapeHtml(text), 'user');
    input.value = '';

    sendIcon.classList.add('fa-microphone');
    sendIcon.classList.remove('fa-paper-plane');

    statusText.textContent = "Escribiendo...";

    setTimeout(() => {
        processBotResponse(text);
        statusText.textContent = "En línea";
    }, 800 + Math.random() * 700);
}

function processBotResponse(userText) {
    const lowerText = userText.toLowerCase();
    const maybeNumber = extractNumberOption(userText);

    if (maybeNumber === 9) {
        appendMessage(menuOptions, 'bot');
        chatState = 'menu_active';
        return;
    }

    if (chatState === 'start') {
        if (lowerText.includes('hola') || lowerText.includes('buenas') || lowerText.includes('inicio')) {
            appendMessage(menuOptions, 'bot');
            chatState = 'menu_active';
        } else {
            appendMessage("👋 ¡Hola! Envía un mensaje diciendo 'Hola' para comenzar.", 'bot');
        }
    } 
    else if (chatState === 'menu_active') {
        const option = extractNumberOption(userText);

        if (option >= 1 && option <= 5) {
            appendMessage(responses[option], 'bot');

            if (option === 5) {
                chatState = 'talking_to_agent';
            } else {
                setTimeout(() => {
                    appendMessage("¿Necesitas ayuda con algo más? Envía 1-5 o 9 para volver al menú.", 'bot');
                }, 900);
            }
        } else {
            if (lowerText.includes('saldo')) {
                appendMessage(responses[1], 'bot');
            } else if (lowerText.includes('soporte') || lowerText.includes('módem') || lowerText.includes('internet')) {
                appendMessage(responses[2], 'bot');
            } else if (lowerText.includes('promo') || lowerText.includes('promoción') || lowerText.includes('venta')) {
                appendMessage(responses[3], 'bot');
            } else if (lowerText.includes('sucursal') || lowerText.includes('ubicación')) {
                appendMessage(responses[4], 'bot');
            } else {
                appendMessage("⚠️ Opción no válida. Envía solo un número del 1 al 5, o 9 para el menú.", 'bot');
                return;
            }

            setTimeout(() => {
                appendMessage("¿Necesitas ayuda con algo más? Envía 1-5 o 9 para volver al menú.", 'bot');
            }, 900);
        }
    } 
    else if (chatState === 'talking_to_agent') {
        if (lowerText.includes('gracias') || lowerText.includes('ok') || lowerText.includes('vale')) {
            appendMessage("👍 Gracias por confirmar. Si deseas volver al menú principal, envía 9.", 'bot');
        } else {
            appendMessage("⏳ Un asesor está revisando tu caso. Gracias por tu paciencia. Para volver al menú, envía 9.", 'bot');
        }
    } else {
        appendMessage("Lo siento, no entendí eso. Envía 'Hola' para ver el menú o 9 para volver.", 'bot');
    }
}

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}
