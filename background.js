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

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "OPEN_NOTE") {
    chrome.tabs.create({ url: message.url }, (tab) => {
      chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (tabId === tab.id && info.status === "complete") {
          chrome.tabs.onUpdated.removeListener(listener);

          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            args: [message.text],
            func: (text) => {
              const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT
              );

              let node;
              while ((node = walker.nextNode())) {
                const index = node.nodeValue.indexOf(text);
                if (index !== -1) {
                  const range = document.createRange();
                  range.setStart(node, index);
                  range.setEnd(node, index + text.length);

                  const mark = document.createElement("mark");
                  mark.style.background = "#fde68a";
                  mark.style.padding = "2px";

                  range.surroundContents(mark);
                  mark.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                  });
                  return;
                }
              }
            }
          });
        }
      });
    });
  }
});
