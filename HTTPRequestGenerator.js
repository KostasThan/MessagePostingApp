class HTTPRequestGenerator {
    #postMessageEndpoint;
    #getAllMessagesEndPoint;
    #getMessageCountEndpoint;
    #getPaginatedMessagesEndPoint;
  constructor() {
      this.#postMessageEndpoint = 
      "https://infinite-escarpment-61510.herokuapp.com/https://herokudbm.herokuapp.com/messages/testroute";
      this.#getAllMessagesEndPoint = 
      "https://infinite-escarpment-61510.herokuapp.com/https://herokudbm.herokuapp.com/messages";
      this.#getMessageCountEndpoint = this.#getAllMessagesEndPoint+"/count";
      this.#getPaginatedMessagesEndPoint = this.#getAllMessagesEndPoint + `?offset=%&limit=%`;
  }
  async sendPostRequest(author, message){
    const body = {
        author,
        message,
      };
     return await this.#sendGenericRequest(this.#postMessageEndpoint, "POST", body);
  }

  async sendDeleteRequest(id){
    return await 
    this.#sendGenericRequest(this.#getAllMessagesEndPoint + `/${id}`, "DELETE");
  }

  sendGetMessageRequest(id){
    return fetch(this.#getAllMessagesEndPoint +`/${id}`);
  }

  async sendMessageCountRequest(){
      return await fetch(this.#getMessageCountEndpoint);
  }

  async sendGetAllMessagesRequest(){
      console.log("sending get all messages request")
      return await fetch(this.#getAllMessagesEndPoint);
  }

  async sendGetPaginatedMessagesRequest(offset, limit){
      console.log(offset, "offset");
      console.log(limit, "limit")
    let endpoint = 
    this.#getPaginatedMessagesEndPoint.replace("%",offset).replace("%",limit);
    return await fetch(endpoint);
  }

  async #sendGenericRequest(url, method, message = {}) {
      const resp = await fetch(url, {
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
        body: method === "DELETE" ? "" : JSON.stringify(message), // body data type must match "Content-Type" header
      });
      return resp;
  }
}
