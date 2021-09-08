"use strict";

const author = document.getElementById("author");
const message = document.getElementById("message");
const date = document.getElementById("date");
const messagesDiv = document.getElementById("messagesDiv");
const authorInput = document.getElementById("authorInput");
const messageInput = document.getElementById("messageInput");
const getAllMessagesEndPoint =
  "https://infinite-escarpment-61510.herokuapp.com/https://herokudbm.herokuapp.com/messages";

const postMessageEndpoint =
  "https://infinite-escarpment-61510.herokuapp.com/https://herokudbm.herokuapp.com/messages/testroute";
// const postMessageEndpoint = "https://herokudbm.herokuapp.com/messages";
const postMessageButton = document.getElementById("postMessageButton");

function handlePostMessage(event) {
  postMessage();
  clearInputs();
}

function clearInputs() {
  authorInput.value = "";
  messageInput.value = "";
}

async function postMessage() {
  console.log(authorInput);
  console.log(messageInput);
  console.log(authorInput.value);
  const author = authorInput.value;
  const message = messageInput.value;

  const body = {
    author: author,
    message: message,
  };

  const resp = await sendMessagePostRequest(body);
  updateUIMessages();
}

// Example POST method implementation:
async function sendMessagePostRequest(message = {}) {
  console.log(message);
  // Default options are marked with *
  const response = await fetch(postMessageEndpoint, {
    method: "PUT", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Content-Length": JSON.stringify(message).length,
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(message), // body data type must match "Content-Type" header
  });
  // return response.json(); // parses JSON response into native JavaScript objects
  return response;
}

async function fetchMessages() {
  const response = await fetch(getAllMessagesEndPoint);
  return await response.json();
}

async function updateUIMessages() {
  console.log("initial fetch");
  let response = await fetch(getAllMessagesEndPoint);
  let messages = await response.json();

  console.log(messages);
  console.log(messages ? true : false);
  //refetching
  if (!messages.length || !messages || messages === [] || messages == []) {
    console.log("refetching");
    setTimeout(updateUIMessages, 2000);
  } else {
    printMessages(messages);
  }
}

function eraseCurrentMessages() {
  while (messagesDiv.lastElementChild) {
    messagesDiv.removeChild(messagesDiv.lastElementChild);
  }
}

function createMessageElement(message) {
  const authorLabel = document.createElement("label");
  authorLabel.classList.add("author");
  authorLabel.textContent = message.author;
  messagesDiv.append(authorLabel);

  const messagePar = document.createElement("p");
  messagePar.classList.add("messagePar");
  messagePar.textContent = message.message;
  messagesDiv.append(messagePar);

  messagesDiv.append(document.createElement("hr"));
}

function printMessages(messages) {
  console.log("printing messages");
  eraseCurrentMessages();
  for (let message of messages) {
    console.log("inside for");
    createMessageElement(message);
  }
}

postMessageButton.addEventListener("click", handlePostMessage);
updateUIMessages();
