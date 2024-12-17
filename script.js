document.addEventListener('DOMContentLoaded', () => {
    const defaultLists = ['todo-list', 'in-progress-list', 'done-list', 'memo-list'];
    const customLists = getCustomListsFromLocalStorage();

    // Load default lists if they are not in custom lists and exist in localStorage
    defaultLists.forEach(listId => {
        if (!customLists.some(list => list.id === listId) && localStorage.getItem(listId)) {
            const notes = getNotesFromLocalStorage(listId);
            const list = document.getElementById(listId);
            notes.forEach(note => {
                createNoteItem(list, note.content, note.id);
            });
        }
    });

    // Load custom lists
    customLists.forEach(list => {
        if (!document.querySelector(`[data-list-id="${list.id}"]`)) {
            addNewList(list.name, list.notes, list.id);
        }
    });

    dragula([...document.querySelectorAll('.note-list')]);
});

function addNote(listId) {
    const list = document.getElementById(listId);
    const newNote = prompt("Entrez le contenu de la note :");
    if (newNote) {
        const noteId = new Date().getTime().toString();
        createNoteItem(list, newNote, noteId);

        let notes = getNotesFromLocalStorage(listId) || [];
        notes.push({ content: newNote, id: noteId });
        saveNotesToLocalStorage(listId, notes);
    }
}

function createNoteItem(list, content, id) {
    const noteItem = document.createElement('div');
    noteItem.className = 'note-item';
    noteItem.setAttribute('data-id', id);
    noteItem.innerHTML = `
        <p>${content}</p>
        <button class="edit-button" onclick="editNote(this)">✏️</button>
        <button class="delete-button" onclick="deleteNote(this)">🗑️</button>
    `;
    list.appendChild(noteItem);
}

function editNote(button) {
    const noteItem = button.parentElement;
    const content = noteItem.querySelector('p').textContent;
    const newContent = prompt("Modifier le contenu de la note :", content);
    if (newContent) {
        noteItem.querySelector('p').textContent = newContent;
        const listId = noteItem.parentElement.id;
        let notes = getNotesFromLocalStorage(listId);
        notes = notes.map(note => {
            if (note.id === noteItem.getAttribute('data-id')) {
                note.content = newContent;
            }
            return note;
        });
        saveNotesToLocalStorage(listId, notes);
    }
}

function deleteNote(button) {
    const noteItem = button.parentElement;
    const listId = noteItem.parentElement.id;
    noteItem.remove();
    let notes = getNotesFromLocalStorage(listId);
    notes = notes.filter(note => note.id !== noteItem.getAttribute('data-id'));
    saveNotesToLocalStorage(listId, notes);
}

function getNotesFromLocalStorage(listId) {
    return JSON.parse(localStorage.getItem(listId)) || [];
}

function saveNotesToLocalStorage(listId, notes) {
    localStorage.setItem(listId, JSON.stringify(notes));
}

function addNewList(name = null, notes = [], listId = null) {
    if (!name) {
        name = prompt("Entrez le nom de la nouvelle liste :");
        if (!name) return;
    }

    if (!listId) {
        listId = name.toLowerCase().replace(' ', '-') + '-list';
    }

    if (document.querySelector(`[data-list-id="${listId}"]`)) {
        alert("Une liste avec ce nom existe déjà.");
        return;
    }

    const newColumn = document.createElement('div');
    newColumn.className = 'column';
    newColumn.setAttribute('data-list-id', listId);
    newColumn.innerHTML = `
        <div class="column-header">
            <h2 id="texte-colonnes-default">${name}</h2>
            <button onclick="deleteList(this)">Supprimer</button>
        </div>
        <button onclick="addNote('${listId}')">Ajouter une carte</button>
        <div id="${listId}" class="note-list"></div>
    `;
    document.querySelector('.container').insertBefore(newColumn, document.getElementById('add-list-column'));

    notes.forEach(note => {
        createNoteItem(document.getElementById(listId), note.content, note.id);
    });

    dragula([...document.querySelectorAll('.note-list')]);

    let customLists = getCustomListsFromLocalStorage();
    customLists.push({ name: name, id: listId, notes: notes });
    saveCustomListsToLocalStorage(customLists);
}

function deleteList(button) {
    const column = button.closest('.column');
    const listId = column.getAttribute('data-list-id');
    column.remove();

    let customLists = getCustomListsFromLocalStorage();
    customLists = customLists.filter(list => list.id !== listId);
    saveCustomListsToLocalStorage(customLists);

    localStorage.removeItem(listId);
}

function getCustomListsFromLocalStorage() {
    return JSON.parse(localStorage.getItem('customLists')) || [];
}

function saveCustomListsToLocalStorage(customLists) {
    localStorage.setItem('customLists', JSON.stringify(customLists));
}
