document.addEventListener("DOMContentLoaded", function () {
  const apiKeyInput = document.getElementById("apiKey");
  const languageSelect = document.getElementById("language");
  const saveButton = document.getElementById("saveButton");
  const statusButton = document.getElementById("statusButton");

  // Load saved settings
  chrome.storage.sync.get(["apiKey", "language", "enabled"], function (data) {
    if (data.apiKey) apiKeyInput.value = data.apiKey;
    if (data.language) languageSelect.value = data.language;
    if (data.enabled === false) {
      statusButton.textContent = "Disabled";
    } else {
      statusButton.textContent = "Enabled";
    }
  });

  // Save settings
  saveButton.addEventListener("click", function () {
    const apiKey = apiKeyInput.value.trim();
    const language = languageSelect.value;
    const rtl = languageSelect.selectedOptions[0].getAttribute("rtl");
    saveButton.textContent = "Saved ✔️";
    setTimeout(() => {
      saveButton.textContent = "💾 Save Settings";
    }, 5000);

    chrome.storage.sync.set({ apiKey, language, rtl });
  });

  // Status settings
  statusButton.addEventListener("click", function () {
    chrome.storage.sync.get("enabled", function (data) {
      const newStatus = !data.enabled;
      chrome.storage.sync.set({ enabled: newStatus }, function () {
        statusButton.textContent = newStatus ? "Enabled" : "Disabled";
      });
    });
  });
});
