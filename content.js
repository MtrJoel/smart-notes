chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SAVE_NOTE") {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const text = selection.toString().trim();
    if (!text) return;

    const range = selection.getRangeAt(0).cloneRange();

    const note = {
      id: crypto.randomUUID(),
      text,
      comment: "",
      url: location.href,
      date: new Date().toISOString()
    };

    chrome.storage.local.get({ notes: [] }, (result) => {
      const updated = [...result.notes, note];
      chrome.storage.local.set({ notes: updated }, () => {
        showToast("✓ Nota guardada");
        updateBadgeForThisPage(updated);
        highlightRangeNow(range, text);
      });
    });
  }
});

// Resalta usando el range exacto de la selección (más confiable que buscar por texto).
// Si el range cruza varios elementos (surroundContents falla), cae al buscador por texto.
function highlightRangeNow(range, text) {
  try {
    const mark = document.createElement("mark");
    mark.style.background = "#fde68a";
    mark.style.padding = "2px";
    mark.style.borderRadius = "4px";
    range.surroundContents(mark);
  } catch (e) {
    highlightTextSafe(text);
  }
}

// Compara URLs ignorando el fragmento (#...), que puede cambiar entre
// cargas (por scroll-to-anchor, SPA routing, etc.) sin que sea otra página.
function sameUrl(a, b) {
  try {
    const ua = new URL(a);
    const ub = new URL(b);
    return ua.origin + ua.pathname + ua.search === ub.origin + ub.pathname + ub.search;
  } catch (e) {
    return a === b;
  }
}

window.addEventListener("load", () => {
  chrome.storage.local.get({ notes: [] }, (result) => {
    const notesForPage = result.notes.filter(n => sameUrl(n.url, location.href));

    notesForPage.forEach(n => attemptHighlight(n.text, 3, 700));

    updateBadgeForThisPage(result.notes);
  });
});

// Reintenta el resaltado por si el contenido de la página sigue cargando
// (frameworks que renderizan después del evento "load").
function attemptHighlight(text, attemptsLeft, delay) {
  const isLastAttempt = attemptsLeft === 0;
  const found = highlightTextSafe(text, isLastAttempt);
  if (!found && attemptsLeft > 0) {
    setTimeout(() => attemptHighlight(text, attemptsLeft - 1, delay), delay);
  }
}

function updateBadgeForThisPage(notes) {
  const count = notes.filter(n => sameUrl(n.url, location.href)).length;
  chrome.runtime.sendMessage({ type: "UPDATE_BADGE", count });
}

function showToast(message) {
  const existing = document.getElementById("smart-notes-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "smart-notes-toast";
  toast.textContent = message;
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: "#111827",
    color: "#ffffff",
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "13px",
    fontFamily: "system-ui, sans-serif",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    zIndex: "2147483647",
    opacity: "0",
    transition: "opacity 0.2s ease, transform 0.2s ease",
    transform: "translateY(8px)"
  });

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(8px)";
    setTimeout(() => toast.remove(), 200);
  }, 1800);
}

function highlightTextSafe(text, allowFallbackScroll = true) {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null
  );

  let node;
  while ((node = walker.nextNode())) {
    const value = node.nodeValue;
    if (!value) continue;

    const index = value.indexOf(text);
    if (index !== -1) {
      try {
        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + text.length);

        const mark = document.createElement("mark");
        mark.style.background = "#fde68a";
        mark.style.padding = "2px";
        mark.style.borderRadius = "4px";

        range.surroundContents(mark);

        mark.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

        return true;
      } catch (e) {
        if (allowFallbackScroll) fallbackScroll(text);
        return false;
      }
    }
  }

  if (allowFallbackScroll) fallbackScroll(text);
  return false;
}

function fallbackScroll(text) {
  const snippet = text.slice(0, 20);

  const els = document.querySelectorAll("p, span, div");
  for (const el of els) {
    if (el.innerText && el.innerText.includes(snippet)) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
      return;
    }
  }
}