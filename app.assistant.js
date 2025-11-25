/* app.assistant.js
   Simple, farmer-friendly assistant module.
   - Offline canned replies (reliable, instant)
   - Quick-action buttons for one-tap answers
   - Typed input for custom questions
   - Uses SpeechSynthesis to read replies aloud
   - Hook `callRemoteAssistant(message)` left as optional to plug server-side LLM later
*/

/* -------------------------
   Configuration & canned KB
   ------------------------- */
const ASSISTANT_CONFIG = {
  // If you later have a server endpoint that returns { reply }, set it here.
  // Example: "https://your-server.example.com/api/assistant"
  REMOTE_API: "",

  // Speech toggle (true = auto-speak answers)
  SPEECH_ENABLED: true,

  // Quick buttons shown to farmers (short phrases)
  QUICK_QUESTIONS: [
    "How to create listing",
    "How escrow works",
    "What is mandi price",
    "How to confirm delivery",
    "How to export CSV"
  ]
};

// Very small, reliable offline knowledge base. Keep phrases short and explicit.
const OFFLINE_KB = [
  {
    match: /create listing|how to create listing|new listing/i,
    answer:
      "Tap New, enter crop, quantity and minimum price, then press Save. Your listing will appear for buyers."
  },
  {
    match: /escrow|how escrow works|what is escrow/i,
    answer:
      "When buyer pays, money goes into escrow and is held safely. After you upload delivery proof and confirm, escrow is released to your account."
  },
  {
    match: /mandi price|what is mandi price|mandi/i,
    answer:
      "Mandi price is the local market rate. Check the live mandi panel to set your selling price fairly."
  },
  {
    match: /confirm delivery|how to confirm delivery|delivery/i,
    answer:
      "Open the Orders area, tap 'Confirm Delivery' on the order. The app creates a photo proof and releases escrow in demo."
  },
  {
    match: /export|csv|export csv/i,
    answer:
      "Go to Tools and tap Export CSV. You will get a file with your listings and orders to share with others."
  },
  // fallback
  {
    match: /.*/,
    answer:
      "I can help with: create listing, escrow, mandi price, confirm delivery, export CSV. Try one of the quick buttons."
  }
];

/* -------------------------
   Helper: find answer in KB
   ------------------------- */
function findOfflineAnswer(message) {
  for (const item of OFFLINE_KB) {
    if (item.match.test(message)) return item.answer;
  }
  // fallback return last item (catch-all)
  return OFFLINE_KB[OFFLINE_KB.length - 1].answer;
}

/* -------------------------
   Optional remote assistant hook
   (keeps code pluggable for later)
   ------------------------- */
async function callRemoteAssistant(message) {
  // If REMOTE_API is empty, skip remote call.
  if (!ASSISTANT_CONFIG.REMOTE_API) return null;

  try {
    const res = await fetch(ASSISTANT_CONFIG.REMOTE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });
    if (!res.ok) return null;
    const j = await res.json();
    return j.reply || j.answer || null;
  } catch (e) {
    console.warn("Remote assistant failed:", e);
    return null;
  }
}

/* -------------------------
   Speech: speak a message (if available)
   ------------------------- */
function speak(text) {
  if (!ASSISTANT_CONFIG.SPEECH_ENABLED || !("speechSynthesis" in window)) return;
  try {
    const ut = new SpeechSynthesisUtterance(text);
    // Choose a clear voice if available (prefers local english/hindi if installed)
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length) {
      // try to prefer female / local voices heuristically
      ut.voice = voices.find(v => /english|hindi|telugu|tamil/i.test(v.lang)) || voices[0];
    }
    ut.rate = 0.95;
    window.speechSynthesis.cancel(); // stop previous
    window.speechSynthesis.speak(ut);
  } catch (e) {
    console.warn("TTS failed:", e);
  }
}

/* -------------------------
   UI wiring: build assistant panel
   Requires these DOM elements to exist:
    - container: element that will hold the assistant controls
   If you used the previously delivered HTML, use '#assistantContainer' or similar.
   ------------------------- */
function initAssistantUI(containerSelector = "#assistantContainer") {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.warn("Assistant container not found:", containerSelector);
    return;
  }

  // Clear and build simple UI
  container.innerHTML = "";

  // big title
  const title = document.createElement("div");
  title.style.fontWeight = "800";
  title.style.fontSize = "16px";
  title.style.marginBottom = "8px";
  title.textContent = "Assistant — Quick Help";
  container.appendChild(title);

  // quick buttons row
  const quickRow = document.createElement("div");
  quickRow.style.display = "flex";
  quickRow.style.flexDirection = "column";
  quickRow.style.gap = "8px";
  quickRow.style.marginBottom = "10px";

  ASSISTANT_CONFIG.QUICK_QUESTIONS.forEach(q => {
    const b = document.createElement("button");
    b.textContent = q;
    b.style.fontSize = "15px";
    b.style.padding = "10px";
    b.style.borderRadius = "8px";
    b.style.border = "none";
    b.style.background = "#e9f7ee";
    b.style.color = "#0b6e3f";
    b.style.fontWeight = "700";
    b.style.cursor = "pointer";
    b.addEventListener("click", () => handleUserMessage(q));
    quickRow.appendChild(b);
  });
  container.appendChild(quickRow);

  // chat area (simple)
  const chatLog = document.createElement("div");
  chatLog.id = "assistantChatLog";
  chatLog.style.minHeight = "80px";
  chatLog.style.maxHeight = "200px";
  chatLog.style.overflow = "auto";
  chatLog.style.padding = "8px";
  chatLog.style.border = "1px dashed #e6e6e6";
  chatLog.style.borderRadius = "8px";
  chatLog.style.background = "#fff";
  chatLog.style.marginBottom = "8px";
  container.appendChild(chatLog);

  // input row
  const inputRow = document.createElement("div");
  inputRow.style.display = "flex";
  inputRow.style.gap = "8px";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Type question (or tap above)...";
  input.style.flex = "1";
  input.style.padding = "10px";
  input.style.borderRadius = "8px";
  input.style.border = "1px solid #e6e6e6";
  input.style.fontSize = "15px";

  const send = document.createElement("button");
  send.textContent = "Ask";
  send.style.padding = "10px 12px";
  send.style.borderRadius = "8px";
  send.style.border = "none";
  send.style.background = "#0f9d58";
  send.style.color = "#fff";
  send.style.fontWeight = "700";
  send.style.cursor = "pointer";

  // Enter key to send
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") send.click();
  });

  send.addEventListener("click", () => {
    const msg = input.value.trim();
    if (!msg) return;
    handleUserMessage(msg);
    input.value = "";
  });

  inputRow.appendChild(input);
  inputRow.appendChild(send);
  container.appendChild(inputRow);

  // small hint & speech toggle
  const hintRow = document.createElement("div");
  hintRow.style.marginTop = "8px";
  hintRow.style.display = "flex";
  hintRow.style.justifyContent = "space-between";
  hintRow.style.alignItems = "center";
  hintRow.style.gap = "8px";

  const hint = document.createElement("div");
  hint.style.fontSize = "13px";
  hint.style.color = "#6b7280";
  hint.textContent = "Quick help for the app. Tap a button or type your question.";

  const speechToggle = document.createElement("input");
  speechToggle.type = "checkbox";
  speechToggle.checked = ASSISTANT_CONFIG.SPEECH_ENABLED;
  speechToggle.addEventListener("change", () => {
    ASSISTANT_CONFIG.SPEECH_ENABLED = speechToggle.checked;
  });

  const speechLabel = document.createElement("label");
  speechLabel.style.fontSize = "13px";
  speechLabel.style.color = "#6b7280";
  speechLabel.style.display = "flex";
  speechLabel.style.alignItems = "center";
  speechLabel.style.gap = "6px";
  speechLabel.appendChild(speechToggle);
  speechLabel.appendChild(document.createTextNode("Read aloud"));

  hintRow.appendChild(hint);
  hintRow.appendChild(speechLabel);
  container.appendChild(hintRow);
}

/* -------------------------
   Handle a user's message:
   - display user message
   - try remote assistant (if configured)
   - fallback to offline KB
   - display and read aloud answer
   ------------------------- */
async function handleUserMessage(message) {
  // show user message in chat log
  const chatLog = document.getElementById("assistantChatLog");
  if (!chatLog) return;

  const userDiv = document.createElement("div");
  userDiv.style.textAlign = "right";
  userDiv.style.fontWeight = "700";
  userDiv.style.margin = "6px 0";
  userDiv.textContent = message;
  chatLog.appendChild(userDiv);

  // show "thinking" placeholder
  const botDiv = document.createElement("div");
  botDiv.style.textAlign = "left";
  botDiv.style.fontSize = "15px";
  botDiv.style.margin = "6px 0";
  botDiv.style.opacity = "0.7";
  botDiv.textContent = "Please wait...";
  chatLog.appendChild(botDiv);
  chatLog.scrollTop = chatLog.scrollHeight;

  // Try remote assistant (if configured)
  let reply = null;
  if (ASSISTANT_CONFIG.REMOTE_API) {
    try {
      reply = await callRemoteAssistant(message);
    } catch (err) {
      console.warn("Remote failed:", err);
      reply = null;
    }
  }

  // If no remote reply, use offline KB
  if (!reply) {
    reply = findOfflineAnswer(message);
  }

  // Update botDiv with reply
  botDiv.style.opacity = "1.0";
  botDiv.textContent = reply;
  chatLog.appendChild(document.createElement("hr"));
  chatLog.scrollTop = chatLog.scrollHeight;

  // speak it (if enabled)
  speak(reply);
}

/* -------------------------
   Public init function
   - selector: where to render assistant UI
   ------------------------- */
function startSimpleAssistant(selector) {
  initAssistantUI(selector);
  // Optionally add a welcome message
  setTimeout(() => handleUserMessage("How to create listing"), 600); // gentle nudge example
}

/* -------------------------
   Expose to global so app can call:
   - startSimpleAssistant('#assistantContainer')
   - handleUserMessage('text') to trigger programmatically
   ------------------------- */
window.SimpleAssistant = {
  start: startSimpleAssistant,
  ask: handleUserMessage
};

/* End of app.assistant.js */
