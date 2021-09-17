"use strict";

const httpRequestGenerator = new HTTPRequestGenerator();
const uiHandler = new UIHandler();

const postMessageButton = document.getElementById("postMessageButton");
const authorInput = document.getElementById("authorInput");
const messageInput = document.getElementById("messageInput");

const INITIAL_SIZE = 5;





async function getAndRenderAllMessages() {
  const response = await httpRequestGenerator.sendGetPaginatedMessagesRequest(
    0,
    INITIAL_SIZE
  );
  if (requestSuccedded(response)) {
    const messages = await response.json();
    uiHandler.eraseCurrentMessages();
    uiHandler.hideLoadingMessages();
    uiHandler.printMessages(messages);
    updateSeeMoreButton();
  }
}

async function handleDeleteMessage(event) {
  event.preventDefault();
  const id = event.srcElement.id;
  const deletedElement = uiHandler.hideElement(id);
  try {
    const resp = await httpRequestGenerator.sendDeleteRequest(id);
    if (requestSuccedded(resp)) {
      deletedElement.remove();
      updateSeeMoreButton();
    } else {
      deletedElement.classList.remove("hidden");
    }
  } catch (e) {
    deletedElement.classList.remove("hidden");
  }
}

async function handlePostMessage(event) {
  const author = authorInput.value;
  const message = messageInput.value;

  if (author && message) {
    const {messageContainer, deleteButton} = uiHandler.createTempElement(author, message);

    console.log(messageContainer, deleteButton);
    uiHandler.clearInputs();
    const resp = await httpRequestGenerator.sendPostRequest(author, message);
    if (requestSuccedded(resp)) {
      let message = await resp.json();
      messageContainer.id = `div-${message.id}`;
      deleteButton.id = message.id;
      updateSeeMoreButton();
    } //else message to user if not succeededelse
    else {
      authorInput.value = author;
      messageInput.value = input;
    }
  }
}

async function handleSeeMoreButtonClick() {
  let response = await httpRequestGenerator.sendMessageCountRequest();
  if (requestSuccedded(response)) {
    let messagesAtDb = await response.json();
    console.log(messagesAtDb, "db messages");
    const nowShowing = uiHandler.getMessagesShown();
    const messagesResp = await httpRequestGenerator.sendGetPaginatedMessagesRequest(
      nowShowing + 1,
      messagesAtDb
    );
    const jsonResp = await messagesResp.json();
    console.log(jsonResp);
    uiHandler.printMessages(jsonResp);
  }
}

function requestSuccedded(request) {
  return request.status >= 200 && request.status <= 299;
}

async function updateSeeMoreButton() {
  console.log("updating button");

  let response = await httpRequestGenerator.sendMessageCountRequest();
  if (requestSuccedded(response)) {
    let messagesAtDb = await response.json();
    console.log("messages at db", messagesAtDb);

    uiHandler.updateSeeMoreButton(messagesAtDb);
  }
}

postMessageButton.addEventListener("click", handlePostMessage);

messageInput.addEventListener("keyup", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    handlePostMessage(e);
  }
});

getAndRenderAllMessages().then(() => {
  uiHandler.hideLoadingMessages();
  if (!uiHandler.getMessagesShown()) {
    uiHandler.showNoMessageIsPosted();
  }
});

seeMoreButton.addEventListener("click", handleSeeMoreButtonClick);
