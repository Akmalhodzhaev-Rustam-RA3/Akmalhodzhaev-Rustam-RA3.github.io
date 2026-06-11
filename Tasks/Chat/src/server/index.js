const http = require("http");
const express = require("express");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");

const app = express();
const port = 8030;

app.use(logger("dev"));
app.use(cookieParser());
app.use(express.static("dist"));

const server = http.createServer(app);
const io = new Server(server);

let clients = [];
let clientsname = [];

io.on("connection", (socket) => {
    clients.push(socket);

    socket.on("messageToServer", (msg) => {
        console.log(msg);
        //console.log(`Client connected with id: ${socket.id}`);

        for (client of clients) {
            client.emit("messageFromServer", `${msg}`);
        }
    });

    socket.on("isNameAvailableToServer", (Name) => {
        if (!clientsname.includes(Name) && Name != null && Name != 0)
        {
            clientsname.push(Name);
            socket.emit("isNameAvailableFromServer", true);
        }
        else
            socket.emit("isNameAvailableFromServer", false);
    });

    socket.on("disconnect", () => {
        console.log(`Client disconnected with id: ${socket.id}`);
        const index = clients.indexOf(socket);
        if (index > -1) {
            clients.splice(index, 1);
        }
    });
});

server.listen(port, () => {
    console.log(`Server started: ${JSON.stringify(server.address())}`);
});