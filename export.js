chrome.storage.local.get({ notes: [] }, ({ notes }) => {
  const subtitle = document.getElementById("subtitle");
  const container = document.getElementById("notes");

  if (!notes.length) {
    subtitle.textContent = "No tienes notas guardadas todavía.";
    container.innerHTML = `<p class="empty">Guarda algunas notas desde cualquier página y vuelve a intentarlo.</p>`;
    return;
  }

  subtitle.textContent = `${notes.length} nota(s) — exportado el ${new Date().toLocaleDateString("es-ES")}`;

  notes.forEach(n => {
    const date = new Date(n.date).toLocaleString("es-ES");

    const wrapper = document.createElement("div");
    wrapper.className = "note";

    const small = document.createElement("small");
    small.textContent = date;

    const p = document.createElement("p");
    p.textContent = n.text;

    wrapper.appendChild(small);
    wrapper.appendChild(p);

    if (n.comment) {
      const comment = document.createElement("p");
      comment.style.color = "#4338ca";
      comment.style.fontSize = "13px";
      comment.textContent = `💬 ${n.comment}`;
      wrapper.appendChild(comment);
    }

    const a = document.createElement("a");
    a.href = n.url;
    a.textContent = n.url;
    wrapper.appendChild(a);
    container.appendChild(wrapper);
  });

  // Deja que el layout se asiente antes de abrir el diálogo de impresión
  setTimeout(() => window.print(), 300);
});