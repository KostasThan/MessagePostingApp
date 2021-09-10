"use strict";

const author = document.getElementById("author");
const message = document.getElementById("message");
const date = document.getElementById("date");
const messagesDiv = document.getElementById("messagesDiv");
const authorInput = document.getElementById("authorInput");
const messageInput = document.getElementById("messageInput");
const seeMoreDiv = document.getElementById("seeMoreDiv");
const seeMoreButton = document.getElementById("seeMoreButton");
const loadingMessagesDiv = document.getElementById("loadingMessagesDiv");
const INITIAL_SIZE = 5;
const FETCH_THRESHOLD = 2;

const getAllMessagesEndPoint =
  "https://infinite-escarpment-61510.herokuapp.com/https://herokudbm.herokuapp.com/messages";

const postMessageEndpoint =
  "https://infinite-escarpment-61510.herokuapp.com/https://herokudbm.herokuapp.com/messages/testroute";
const messageCountEndpoint =
  "https://infinite-escarpment-61510.herokuapp.com/https://herokudbm.herokuapp.com/messages/count";

const firstMessagesEndpoint = getAllMessagesEndPoint + `?limit=${INITIAL_SIZE}`;
const allButFirstMessagesEndpoint =
  getAllMessagesEndPoint + `offset=${INITIAL_SIZE}&limit=`;

const postMessageButton = document.getElementById("postMessageButton");

let messagesShown = 0;
let fetchAttempt = 0;
let dirtyList = false;

async function handleDeleteMessage(event) {
  dirtyList = true;
  document.getElementById(`div-${event.srcElement.id}`).remove();
  await sendRequest(
    getAllMessagesEndPoint + `/${event.srcElement.id}`,
    "DELETE"
  );
  //if delete fails, we need to rerender the message
  // setTimeout(() => updateUIMessages(firstMessagesEndpoint, true), 1000);
}

async function handlePostMessage(event) {
  const author = authorInput.value;
  const message = messageInput.value;
  let dummyMessage = createTempElement(author, message);
  if(messagesShown == INITIAL_SIZE){
    messagesDiv.lastChild.remove();
  }
  await postMessage(author, message);
}

function clearInputs() {
  authorInput.value = "";
  messageInput.value = "";
}

function createTempElement(author, message) {
  if (author && message) {
    let date = new Date();
    let dummyMessage = {
      author,
      message,
      date: date.getUTCDate(),
      id: "temp",
    };

    return createMessageElement(dummyMessage);
  }
}

async function postMessage(author, message) {
  if (author && message) {
    clearInputs();
    const body = {
      author,
      message,
    };
    console.log("sending");
    const resp = await sendRequest(postMessageEndpoint, "PUT", body);

    updateUIMessages(firstMessagesEndpoint, true);
    // setTimeout(() => updateUIMessages(firstMessagesEndpoint, true), 1500);
  }
}

// Example POST method implementation:
async function sendRequest(url, method, message = {}) {
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

async function getMessageRequest(response) {
  if (INITIAL_SIZE) {
    console.log("sending paginated message");
    response = await fetch(getAllMessagesEndPoint + `?limit=${INITIAL_SIZE}`);
  } else {
    console.log("asking for all messages");
    response = await fetch(getAllMessagesEndPoint);
  }
  return response;
}

async function fetchMessages(fetchURI) {
  console.log("initiating fetch");

  let response;
  response = await getMessageRequest(response);
  let messages = await response?.json();
  console.log("fetched\n");
  return messages;
}

async function updateUIMessages(fetchURI, eraseMessages = true) {
  try {
    let messages = await fetchMessages(fetchURI);
    //refetching
    if (!messages.length) {
      fetchAttempt++;
      if (fetchAttempt < FETCH_THRESHOLD) {
        console.log("refetching");
        setTimeout(() => updateUIMessages(fetchURI, eraseMessages), 2000);
      } else {
        console.log("aborting fetch");
        fetchAttempt = 0;
      }
    } else {
      if (eraseMessages) eraseCurrentMessages();
      printMessages(messages);
      showSeeMoreButton();
    }
  } catch (e) {
    console.log("exception happend... retrying...");
    fetchAttempt++;
    updateUIMessages(fetchURI, eraseMessages);
  }
}

async function showSeeMoreButton() {
  let response = await fetch(messageCountEndpoint);
  let messagesAtDb = await response.json();
  if (messagesAtDb > messagesShown) {
    seeMoreDiv.classList.remove("hidden");
  } else {
    seeMoreDiv.classList.add("hidden");
  }
}

function eraseCurrentMessages() {
  messagesShown = 0;
  while (messagesDiv.lastElementChild) {
    messagesDiv.removeChild(messagesDiv.lastElementChild);
  }
}

function hasTodaysDate(messageDate) {
  const today = new Date();
  return (
    today.getFullYear() === messageDate.getFullYear() &&
    today.getMonth() === messageDate.getMonth() &&
    today.getDate() === messageDate.getDate()
  );
}

function createMessageElement(message) {
  const messageContainer = document.createElement("div");
  messageContainer.id = `div-${message.id}`;

  const authorLabel = document.createElement("label");
  authorLabel.classList.add("author");
  authorLabel.textContent = message.author;
  messageContainer.append(authorLabel);

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-button");
  deleteButton.textContent = "x";
  deleteButton.id = message.id;
  deleteButton.addEventListener("click", handleDeleteMessage);
  messageContainer.append(deleteButton);

  const br = document.createElement("br");
  messageContainer.append(br);

  const messagePar = document.createElement("span");
  messagePar.classList.add("messagePar");
  messagePar.textContent = message.message;
  messageContainer.append(messagePar);

  if (message.date) {
    const datePar = getDateFromMessage(message);
    messageContainer.append(datePar);
  }

  messageContainer.append(document.createElement("hr"));

  if (message.id === "temp") {
    messagesDiv.insertBefore(messageContainer, messagesDiv.firstChild);
  } else {
    messagesDiv.append(messageContainer);
  }

  return messageContainer;
}

function getDateFromMessage(message) {
  const datePar = document.createElement("span");
  datePar.classList.add("datePar");

  if (message.id === "temp") {
    let now = new Date();
    datePar.textContent =
      addZeroToDate(now.getHours()) + ":" + addZeroToDate(now.getMinutes());

    return datePar;
  }

  const messageDate = new Date(message.date.replace("T", " ") + " UTC");
  if (hasTodaysDate(messageDate)) {
    let minutes = messageDate.getMinutes();
    minutes = addZeroToDate(minutes);
    let hours = messageDate.getHours();
    hours = addZeroToDate(hours);
    datePar.textContent = `${hours}:${minutes}`;
  } else {
    datePar.textContent = `${messageDate.getDay()}-${
      messageDate.getMonth() + 1
    }-${messageDate.getFullYear()}`;
  }
  return datePar;

  function addZeroToDate(timeUnit) {
    if (timeUnit <= 9) {
      timeUnit = "0" + timeUnit;
    }
    return timeUnit;
  }
}

function printMessages(messages) {
  const sortedMessages = Object.values(messages).sort((m1, m2) =>
    m1.id < m2.id ? 1 : -1
  );
  for (let message of sortedMessages) {
    messagesShown++;
    createMessageElement(message);
  }
}

postMessageButton.addEventListener("click", handlePostMessage);
seeMoreButton.addEventListener("click", () => {
  if (dirtyList) {
    dirtyList = false;
    updateUIMessages(getAllMessagesEndPoint, true);
  } else {
    updateUIMessages(allButFirstMessagesEndpoint, false);
  }
});

messageInput.addEventListener("keyup", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    handlePostMessage(e);
  }
});

updateUIMessages();
if (messagesShown > 0) {
  document.getElementById("loadingMessagesDiv").classList.add("hidden");
}
