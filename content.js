chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SAVE_NOTE") {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const text = selection.toString().trim();
    if (!text) return;

    const note = {
      id: crypto.randomUUID(),
      text,
      url: location.href,
      date: new Date().toISOString()
    };

    chrome.storage.local.get({ notes: [] }, (result) => {
      chrome.storage.local.set({
        notes: [...result.notes, note]
      });
    });
  }
});

window.addEventListener("load", () => {
  chrome.storage.local.get({ notes: [] }, (result) => {
    result.notes
      .filter(n => n.url === location.href)
      .forEach(n => highlightText(n.text));
  });
});

function highlightText(text) {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null
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
      return;
    }
  }
}
