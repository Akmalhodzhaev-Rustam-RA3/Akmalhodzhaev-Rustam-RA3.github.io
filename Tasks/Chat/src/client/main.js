import { io } from "socket.io-client";

async function main() {
    const socket = io();
    let Name = document.getElementById("name");

    const loginWindow = document.getElementById("login");
    const chatWindow = document.getElementById("chat");
    const loginForm = document.getElementById("login-form");

    socket.on("connect", () => {
        socket.on("messageFromServer", function (msg) {
            const messages = document.getElementById("main")
            const item = document.createElement('li');
            item.textContent = msg;
            messages.appendChild(item);
            /* console.log(msg); */
            window.scrollTo(0, document.body.scrollHeight);
        });

        socket.on("isNameAvailableFromServer", (TF) => {
            if (!TF)
                Name.value = null;

            if (Name.value != null && Name.value != 0)
            {
                loginWindow.style.display = "none";
                chatWindow.style.display = "block";
            }
        });
    });

    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();

        socket.emit("isNameAvailableToServer", Name.value);
    });

    window.addEventListener("keydown", (keyboard) => {
        if (keyboard.key == "Enter")
        {
            keyboard.preventDefault();
            const text = document.getElementById("3047102");

            if (Name != null && Name.value != null && Name.value != 0 && text != null && text.value != 0)
            {
                socket.emit("messageToServer", Name.value + ": " + text.value);
                text.value = null;
            }
        }
    });

    socket.on("disconnect", () => {
        console.log(socket.id);
    });
}

window.addEventListener("load", () => {
    main();
});