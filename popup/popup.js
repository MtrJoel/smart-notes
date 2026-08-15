const notesList = document.getElementById("notes");
const searchInput = document.getElementById("search");
const exportMdBtn = document.getElementById("exportMd");
const exportPdfBtn = document.getElementById("exportPdf");

let allNotes = [];
let visibleNotes = [];

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function applyFilterAndRender() {
  const value = searchInput.value.toLowerCase();
  const filtered = value
    ? allNotes.filter(n =>
        n.text.toLowerCase().includes(value) ||
        (n.comment || "").toLowerCase().includes(value)
      )
    : allNotes;
  render(filtered);
}

function saveNotes(updatedNotes) {
  allNotes = updatedNotes;
  chrome.storage.local.set({ notes: allNotes }, applyFilterAndRender);
}

function render(notes) {
  visibleNotes = notes;
  notesList.innerHTML = "";

  notes.forEach(note => {
    const li = document.createElement("li");

    li.innerHTML = `
      <p>${escapeHtml(note.text)}</p>
      ${note.comment ? `<p class="comment">💬 ${escapeHtml(note.comment)}</p>` : ""}
      <div class="actions">
        <button class="open">Abrir</button>
        <button class="comment-toggle">${note.comment ? "✏️ Comentario" : "+ Comentario"}</button>
        <button class="delete">✕</button>
      </div>
      <div class="comment-editor hidden">
        <textarea placeholder="Escribe tu comentario o idea sobre esta nota...">${escapeHtml(note.comment || "")}</textarea>
        <button class="save-comment">Guardar comentario</button>
      </div>
    `;

    li.querySelector(".open").onclick = () => {
      chrome.runtime.sendMessage({
        type: "OPEN_NOTE",
        url: note.url,
        text: note.text
      });
    };

    li.querySelector(".delete").onclick = () => {
      saveNotes(allNotes.filter(n => n.id !== note.id));
    };

    li.querySelector(".comment-toggle").onclick = () => {
      li.querySelector(".comment-editor").classList.toggle("hidden");
    };

    li.querySelector(".save-comment").onclick = () => {
      const textarea = li.querySelector(".comment-editor textarea");
      const newComment = textarea.value.trim();
      saveNotes(
        allNotes.map(n => (n.id === note.id ? { ...n, comment: newComment } : n))
      );
    };

    notesList.appendChild(li);
  });
}

chrome.storage.local.get({ notes: [] }, (result) => {
  allNotes = result.notes;
  render(allNotes);
});

searchInput.addEventListener("input", applyFilterAndRender);

exportMdBtn.addEventListener("click", () => {
  if (!visibleNotes.length) return;
  exportMarkdown(visibleNotes);
});

exportPdfBtn.addEventListener("click", () => {
  // El PDF se genera en una pestaña aparte, con todas las notas guardadas
  // (la búsqueda del popup no aplica ahí, ya que se lee directo de storage).
  chrome.tabs.create({ url: chrome.runtime.getURL("export.html") });
});

function exportMarkdown(notes) {
  let md = `# Mis notas — Smart Notes\n\n`;
  notes.forEach(n => {
    const date = new Date(n.date).toLocaleString("es-ES");
    const quoted = n.text.replace(/\n/g, "\n> ");
    md += `## ${date}\n\n> ${quoted}\n\n`;
    if (n.comment) {
      md += `💬 ${n.comment}\n\n`;
    }
    md += `🔗 ${n.url}\n\n---\n\n`;
  });

  const blob = new Blob([md], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "smart-notes.md";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}