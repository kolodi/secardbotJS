module.exports = class SlimHttps {
    get(url) {
        // return new pending promise
        return new Promise((resolve, reject) => {
            // select http or https module, depending on reqested url
            const lib = require('https');
            const request = lib.get(url, (response) => {
                // handle http errors
                if (response.statusCode < 200 || response.statusCode > 299) {
                    reject(new Error('Failed to load page, status code: ' + response.statusCode));
                }
                // temporary data holder
                const body = [];
                // on every content chunk, push it to the data array
                response.on('data', (chunk) => body.push(chunk));
                // we are done, resolve promise with those joined chunks
                response.on('end', () => resolve(body.join('')));
            });
            // handle connection errors of the request
            request.on('error', (err) => reject(err))
        });
    }

    postJson(host, path, data) {
        return new Promise((resolve, reject) => {
    
            const https = require("https");
            let postBody = JSON.stringify(data);
            let options = {
                hostname: host, //"api.telegram.org",
                port: 443,
                path: path, //"/bot" + token + responseType,
                method: "POST",
                //your options which have to include the two headers
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': postBody.length
                }
            };
    
            var postreq = https.request(options, (res) => {
                res.setEncoding('utf8');
                // temporary data holder
                const body = [];
                // on every content chunk, push it to the data array
                res.on('data', (chunk) => body.push(chunk));
                // we are done, resolve promise with those joined chunks
                res.on('end', () => resolve(body.join('')));
            });
            postreq.on('error', (e) => {
                reject(e);
            });
            postreq.write(postBody);
            postreq.end();
        });
    }
}