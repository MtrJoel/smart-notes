const notesList = document.getElementById("notes");
const searchInput = document.getElementById("search");

let allNotes = [];

function render(notes) {
  notesList.innerHTML = "";

  notes.forEach(note => {
    const li = document.createElement("li");

    li.innerHTML = `
      <p>${note.text}</p>
      <div class="actions">
        <button class="open">Abrir</button>
        <button class="delete">✕</button>
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
      allNotes = allNotes.filter(n => n.id !== note.id);
      chrome.storage.local.set({ notes: allNotes }, () => render(allNotes));
    };

    notesList.appendChild(li);
  });
}

chrome.storage.local.get({ notes: [] }, (result) => {
  allNotes = result.notes;
  render(allNotes);
});

searchInput.addEventListener("input", e => {
  const value = e.target.value.toLowerCase();
  render(allNotes.filter(n => n.text.toLowerCase().includes(value)));
});
