const input = document.getElementById("input");
const button = document.getElementById("sendButton");
const chat = document.getElementById("chat");
const usernameModal = document.getElementById("usernameModal");
const usernameInput = document.getElementById("usernameInput");
const setUsernameButton = document.getElementById("setUsernameButton");
const userListElement = document.getElementById("userList");

const template = "<li class=\"list-group-item\">%USERNAME: %MESSAGE</li>";
const messages = [];
let username = null;
const socket = io();

// Funzione per mostrare la modale del nome utente (MODIFICATA)
const showUsernameModal = () => {
    // Aggiunge la classe 'visible' per mostrare la modale
    usernameModal.classList.add("visible");
  };

// Funzione per nascondere la modale del nome utente (MODIFICATA)
const hideUsernameModal = () => {
    // Rimuove la classe 'visible' per nascondere la modale
    usernameModal.classList.remove("visible");
  };

// Gestiamo l'invio del nome utente
setUsernameButton.onclick = () => {
  const enteredUsername = usernameInput.value.trim();
  if (enteredUsername) {
    username = enteredUsername;
    socket.emit("setUsername", username); // Invia il nome utente al server
    hideUsernameModal();
   
    socket.emit("list"); // Richiedi la lista degli utenti dopo essersi connesso
  } 
};

// Mostra la modale all'avvio
showUsernameModal();


// Gestiamo l'invio del messaggio rifare con bottone.onclick
input.onkeydown = (event) => {
  if (event.keyCode === 13 && username) {
    event.preventDefault();
    button.click();
  }
}


button.onclick = () => {
  if (username && input.value.trim()) {
    socket.emit("message", input.value);
    input.value = "";
  }
}

// Gestiamo i messaggi ricevuti dal server
socket.on("chat", (data) => {
  console.log(data);
  messages.push(data);
  renderChat();
});

// Gestiamo la lista degli utenti ricevuta dal server
socket.on("list", (list) => {
  console.log("Lista utenti ricevuta:", list);
  renderUserList(list);
});

// Funzione per visualizzare i messaggi della chat
const renderChat = () => {
  let html = "";
  messages.forEach((item) => {
    const row = template.replace("%MESSAGE", item.message).replace("%USERNAME", item.username);
    html += row;
  });
  chat.innerHTML = html;
  window.scrollTo(0, document.body.scrollHeight);
}



// Funzione per visualizzare la lista degli utenti
const renderUserList = (userList) => {
  let html = "";
  userList.forEach((user) => {
    html += `<li>${user.name}</li>`;
  });
  userListElement.innerHTML = html;
};

// Disconnessione
socket.on('disconnect', () => {
  console.log('Disconnesso dal server');
  
});