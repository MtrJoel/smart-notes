chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveNote",
    title: "📌 Guardar como nota",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "saveNote") {
    chrome.tabs.sendMessage(tab.id, {
      type: "SAVE_NOTE"
    });
  }
});

chrome.action.setBadgeBackgroundColor({ color: "#2563eb" });

function setBadge(tabId, count) {
  chrome.action.setBadgeText({
    tabId,
    text: count > 0 ? String(count) : ""
  });
}

async function refreshBadgeForTab(tabId, url) {
  if (!url || !/^https?:/.test(url)) {
    setBadge(tabId, 0);
    return;
  }
  const { notes = [] } = await chrome.storage.local.get({ notes: [] });
  const count = notes.filter(n => n.url === url).length;
  setBadge(tabId, count);
}

chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, (tab) => refreshBadgeForTab(tabId, tab.url));
});

chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (info.status === "complete") {
    refreshBadgeForTab(tabId, tab.url);
  }
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === "UPDATE_BADGE" && sender.tab) {
    setBadge(sender.tab.id, message.count);
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "OPEN_NOTE") {
    // content.js ya se encarga de resaltar y hacer scroll cuando la página
    // carga y encuentra notas guardadas para esa URL — no duplicamos esa
    // lógica aquí (hacerlo generaba una condición de carrera entre dos
    // intentos de resaltado simultáneos).
    chrome.tabs.create({ url: message.url });
  }
});