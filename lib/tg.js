const SlimHttps = require("./SlimHttps.js");

module.exports = class TG {

    constructor(token) {
        this.token = token;
        this.apiHost = "api.telegram.org";
        this.https = new SlimHttps();
    }

    send(params) {
        let path = "/bot" + this.token + "/" + params.method;
        return this.https.postJson(this.apiHost, path, params.data);
    }

    sendMessage(message) {
        return this.send({
            method: "sendMessage",
            data: message
        });
    }

    sendPhoto(photo) {
        return this.send({
            method: "sendPhoto",
            data: photo
        });
    }

    answerInlineQuery(answer) {
        return this.send({
            method: "answerInlineQuery",
            data: answer
        });
    }

    
}