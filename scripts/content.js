let reqTimeoutId;
document.addEventListener("mouseup", async function () {
  clearTimeout(reqTimeoutId);

  const existingBox = document.getElementById("neo-translate-box");
  if (existingBox) existingBox.remove();

  chrome.storage.sync.get("enabled", function (data) {
    if (data.enabled === false) {
      return;
    }

    let selectedText = window.getSelection().toString().trim();
    if (!selectedText) return;

    chrome.storage.sync.get(
      ["apiKey", "language", "rtl"],
      async function (data) {
        if (!data.apiKey) {
          showErrorMessage("❌ No API key found. Please enter it in settings.");
          return;
        }

        const apiKey = data.apiKey;
        const targetLanguage = data.language || "English";
        const rtl = data.rtl;

        reqTimeoutId = setTimeout(async () => {
          try {
            // Call Gemini API for translation
            const translatedText = await translateText(
              selectedText,
              targetLanguage,
              apiKey
            );

            displayTranslation(translatedText, rtl);
          } catch (error) {
            showErrorMessage(
              error.message ||
                "❌ Failed to connect to the API. Check your internet or API key."
            );
          }
        }, 800);
      }
    );
  });
});

function showErrorMessage(message) {
  displayTranslation(message, undefined, true);
}

// Function to call the Gemini API
async function translateText(text, targetLanguage, apiKey) {
  const apiUrl =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `Translate the following text to ${targetLanguage} and provide only the translation(also new lines) without any explanation:"${text}"`,
          },
        ],
      },
    ],
  };

  const response = await fetch(`${apiUrl}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error("⚠️ Invalid API key! Please check your settings.");
  }

  const translatedText = data.candidates[0].content.parts[0].text;

  return translatedText;
}

function displayTranslation(translatedText, rtl, err) {
  const box = document.createElement("div");
  box.id = "neo-translate-box";
  box.classList.add("neo-translate-box");
  box.textContent = translatedText;
  if (err) {
    box.classList.add("neo-translate-box-error");
  }
  if (rtl) {
    box.classList.add("neo-translate-box-rtl");
  }

  // Get selection coordinates
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  document.body.appendChild(box);

  // Position box at the bottom of the selected text
  box.style.left = `${
    rect.left + (rect.width / 2 - box.clientWidth / 2) + window.scrollX
  }px`;
  box.style.top = `${rect.top + rect.height + 13 + window.scrollY}px`;
}
