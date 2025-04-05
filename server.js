const fs = require('fs');
const express = require("express");
const http = require("http");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const { Server } = require('socket.io');
const conf = JSON.parse(fs.readFileSync("./conf.json"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", express.static(path.join(__dirname, "public")));

const server = http.createServer(app);
const io = new Server(server);
const userList = []; // Array per memorizzare la lista degli utenti

server.listen(5005, () => {
    console.log("Server in esecuzione sulla porta: " + conf.port);
});

io.on('connection', (socket) => {
    console.log("Socket connessa: " + socket.id);

    // Gestiamo l'impostazione del nome utente
    socket.on('setUsername', (username) => {
        const newUser = { socketId: socket.id, name: username };
        userList.push(newUser);
        //console.log(`Utente ${username} connesso con ID: ${socket.id}`);
        // Invia la lista aggiornata a tutti i client
        io.emit("list", userList);
        // Invia un messaggio di benvenuto a tutti i client
        //io.emit("chat", { username: 'Server', message: `${username} è entrato nella chat.` });
    });

    // Gestiamo la richiesta della lista utenti
    socket.on('list', () => {
        socket.emit("list", userList); // Invia la lista solo al client che ha fatto la richiesta
    });

    socket.on('message', (message) => {
        // Dichiariamo una variabile per memorizzare il nome utente, inizializzandola a 'Anonimo'
        let username = 'Anonimo';
        let userFound = false; // Flag per sapere se abbiamo trovato l'utente

        // Iteriamo sulla userList usando un ciclo for standard
        for (let i = 0; i < userList.length; i++) {
            // Controlliamo se l'id del socket dell'utente corrente corrisponde all'id del socket che ha inviato il messaggio
            if (userList[i].socketId === socket.id) {
                // Se troviamo una corrispondenza, assegniamo il nome dell'utente alla variabile username
                username = userList[i].name;
                userFound = true; // Impostiamo il flag a true
                // Interrompiamo il ciclo perché abbiamo trovato l'utente che cercavamo
                break;
            }
        }

        // Creiamo l'oggetto di risposta con il nome utente trovato (o 'Anonimo') e il messaggio
        const response = { username: username, message: message };

        // Stampiamo il messaggio sulla console del server
       // console.log(`${response.username}: ${response.message}`);

        // Inviamo il messaggio a tutti i client connessi
        io.emit("chat", response);
    });
   
   
    socket.on('disconnect', () => {
        let userFound = false; // Flag per indicare se l'utente è stato trovato e rimosso
        let username = ''; // Variabile per memorizzare il nome dell'utente disconnesso

        // Iteriamo sulla userList con un ciclo for standard
        for (let i = 0; i < userList.length; i++) {
            // Controlliamo se l'ID del socket dell'utente corrente corrisponde a quello disconnesso
            if (userList[i].socketId === socket.id) {
                // Utente trovato!
                userFound = true;
                username = userList[i].name; // Memorizziamo il nome utente

                // Rimuoviamo l'utente dall'array userList usando splice con l'indice corrente 'i'
                
                userList.splice(i, 1);

                // Inviamo un messaggio a tutti gli altri client per informarli della disconnessione
                io.emit("chat", { username: 'Server', message: `${username} ha lasciato la chat.` });

                // Inviamo la lista utenti aggiornata a tutti i client
                io.emit("list", userList);

                // Interrompiamo il ciclo perché abbiamo trovato e gestito l'utente
                break;
            }
        }
    
    });
});