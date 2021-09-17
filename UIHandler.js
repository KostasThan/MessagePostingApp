class UIHandler {
  #author = document.getElementById("author");
  #message = document.getElementById("message");
  #date = document.getElementById("date");
  #messagesDiv = document.getElementById("messagesDiv");
  #authorInput = document.getElementById("authorInput");
  #messageInput = document.getElementById("messageInput");
  #seeMoreDiv = document.getElementById("seeMoreDiv");
  #seeMoreButton = document.getElementById("seeMoreButton");
  #loadingMessagesDiv = document.getElementById("loadingMessagesDiv");
  #noMessagesDiv = document.getElementById("noMessagesDiv");
  #INITIAL_SIZE = 5;
  #FETCH_THRESHOLD = 2;
  #messagesShown = 0;
  #tempsCreated = 0;

  constructor() {}

  createTempElement(author, message) {
    const id =  "temp" + this.#tempsCreated;
    this.#tempsCreated++;
    console.log("id", id);
    let date = new Date();
    let dummyMessage = {
      author,
      message,
      id,
      date: date.getUTCDate(),
    };
    return uiHandler.createMessageElement(dummyMessage);
  }

  getMessagesShown() {
    return this.#messagesShown;
  }

  increaseMessagesShown(additionalMessages) {
    this.#messagesShown += additionalMessages;
  }

  clearInputs() {
    authorInput.value = "";
    messageInput.value = "";
  }

  showNoMessageIsPosted() {
    this.#noMessagesDiv.classList.remove("hidden");
  }

  hideNoMessageIsPosted() {
    this.#noMessagesDiv.classList.add("hidden");
  }

  updateNoMessagesDiv(){
    if(this.#messagesShown) this.hideNoMessageIsPosted();
    else this.showNoMessageIsPosted();
  }

  hideElement(id) {
    const deletedElement = document.getElementById(`div-${id}`);
    deletedElement.classList.add("hidden");
    this.#messagesShown--;
    this.updateNoMessagesDiv();
    return deletedElement;
  }

  removeElement(id){
    const element = document.getElementById(`div-${id}`);
    if(!element.classList.contains("hidden")){
        this.#messagesShown--;
    }  
    element.remove();

    this.updateNoMessagesDiv();
    return element;
  }

  showElement(id) {
    const elementClasslist = document.getElementById(`div-${id}`).classList;
    if (elementClasslist.contains("hidden")) {
      elementClasslist.remove(hidden);
      this.#messagesShown++;
    }

    this.updateNoMessagesDiv();
  }

  printMessages(messages) {
    const sortedMessages = Object.values(messages).sort((m1, m2) =>
      m1.id < m2.id ? 1 : -1
    );
    for (let message of sortedMessages) {
      this.createMessageElement(message);
    }

    this.hideNoMessageIsPosted();
  }

  updateSeeMoreButton(total) {
      console.log("i have total input", total);
      console.log("while i am showing ", this.#messagesShown);
    if (total > this.#messagesShown) {
      this.#seeMoreDiv.classList.remove("hidden");
      
    } else {
        this.#seeMoreDiv.classList.add("hidden");
    }
  }

  eraseCurrentMessages() {
    if (this.#messagesShown) {
      this.#messagesShown = 0;
      while (messagesDiv.lastElementChild) {
        messagesDiv.removeChild(messagesDiv.lastElementChild);
      }
    }
  }

  createMessageElement(message) {
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
      const datePar = this.getDateFromMessage(message);
      messageContainer.append(datePar);
    }

    messageContainer.append(document.createElement("hr"));

    if ((message.id + "").startsWith("temp")) {
      messagesDiv.insertBefore(messageContainer, messagesDiv.firstChild);
    } else {
      messagesDiv.append(messageContainer);
    }

    this.#messagesShown += 1;
    this.updateNoMessagesDiv();

    return {messageContainer, deleteButton};
  }

  //show more button handler
  updateLoadingDiv() {
    if (messagesShown) {
      this.showLoadingMessages();
    } else {
      this.hideLoadingMessages();
    }
  }

  showLoadingMessages() {
    this.#loadingMessagesDiv.classList.remove("hidden");
    this.#messagesDiv.appendChild(loadingMessagesDiv);
  }

  hideLoadingMessages() {
    this.#loadingMessagesDiv.classList.add("hidden");
    this.#loadingMessagesDiv.remove();
  }

  //helper
  hasTodaysDate(messageDate) {
    const today = new Date();
    return (
      today.getFullYear() === messageDate.getFullYear() &&
      today.getMonth() === messageDate.getMonth() &&
      today.getDate() === messageDate.getDate()
    );
  }

  addZeroToDate(timeUnit) {
    if (timeUnit <= 9) {
      timeUnit = "0" + timeUnit;
    }
    return timeUnit;
  }

  getDateFromMessage(message) {
    const datePar = document.createElement("span");
    datePar.classList.add("datePar");
    if(message.id === "temp"){
        console.log(typeof message.id);
    }
    const id = message.id + "";
    if (id.startsWith("temp")) {
      let now = new Date();
      datePar.textContent =
        this.addZeroToDate(now.getHours()) +
        ":" +
        this.addZeroToDate(now.getMinutes());

      return datePar;
    }

    const messageDate = new Date(message.date.replace("T", " ") + " UTC");
    if (this.hasTodaysDate(messageDate)) {
      let minutes = messageDate.getMinutes();
      minutes = this.addZeroToDate(minutes);
      let hours = messageDate.getHours();
      hours = this.addZeroToDate(hours);
      datePar.textContent = `${hours}:${minutes}`;
    } else {
      datePar.textContent = `${messageDate.getDay()}-${
        messageDate.getMonth() + 1
      }-${messageDate.getFullYear()}`;
    }
    return datePar;
  }
}
