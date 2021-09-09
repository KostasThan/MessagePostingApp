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

const FETCH_THRESHOLD = 2;
let fetchAttempt = 0;

async function handleDeleteMessage(event){
  document.getElementById(`div-${event.srcElement.id}`).remove();
  await sendRequest(getAllMessagesEndPoint + `/${event.srcElement.id}`, "DELETE");
  setTimeout(updateUIMessages, 1000);
}


function handlePostMessage(event) {
  postMessage();
  clearInputs();
}

function clearInputs() {
  authorInput.value = "";
  messageInput.value = "";
}


async function postMessage() {

  const author = authorInput.value;
  const message = messageInput.value;

  if(author && message){

    const body = {
      author,
      message,
    };
  
    console.log("sending");
    const resp = await sendRequest(postMessageEndpoint, "PUT", body);
    console.log(resp);
  
    setTimeout(updateUIMessages, 1500);
  }
}

// Example POST method implementation:
async function sendRequest(url , method, message = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method, // *GET, POST, PUT, DELETE, etc.
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
  let response = await fetch(getAllMessagesEndPoint);
  let messages = await response.json();
  console.log("fetched\n", messages);
  //refetching
  if (!messages.length) {
    fetchAttempt++;
    if(fetchAttempt < FETCH_THRESHOLD){
      console.log("refetching");
      setTimeout(updateUIMessages, 2000);
    }
    else{
      console.log("aborting fetch");
      fetchAttempt = 0;
    }
  }else{
    printMessages(messages);
  }
}

function eraseCurrentMessages() {
  while (messagesDiv.lastElementChild) {
    messagesDiv.removeChild(messagesDiv.lastElementChild);
  }
}

function createMessageElement(message) {

  const messageContainer = document.createElement('div');
  messageContainer.id = `div-${message.id}`

  const authorLabel = document.createElement("label");
  authorLabel.classList.add("author");
  authorLabel.textContent = message.author;
  messageContainer.append(authorLabel);

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-button");
  deleteButton.textContent = 'x';
  deleteButton.id = message.id;
  deleteButton.addEventListener("click", handleDeleteMessage);
  messageContainer.append(deleteButton);

  const br = document.createElement("br");
  messageContainer.append(br);


  const messagePar = document.createElement("span");
  messagePar.classList.add("messagePar");
  messagePar.textContent = message.message;
  messageContainer.append(messagePar);

  const datePar = document.createElement("span");
  datePar.classList.add("datePar");
  datePar.textContent = `(${message.date?.replace("Z","")})`;
  messageContainer.append(datePar);

  messageContainer.append(document.createElement("hr"));

  messagesDiv.append(messageContainer);
}

function printMessages(messages) {
  eraseCurrentMessages();
  const sortedMessages = Object.values(messages).sort( (m1, m2) => m1.id < m2.id ? 1 : -1);
  for (let message of sortedMessages) {
    createMessageElement(message);
  }
}

postMessageButton.addEventListener("click", handlePostMessage);
updateUIMessages();

