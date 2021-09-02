//--------------------------security
const { encrypt, decrypt } = require('./crypto');
var uuid = require("uuid");
//--------------------------security

//--------------------------hosting
const { WebSocketServer } = require("ws");
var wsPost = 667;
const wss = new WebSocketServer({ port: wsPost });
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
app.use("/", express.static(__dirname + "/react-host"));
//--------------------------hosting


//--------------------------connection
wss.on("connection", (ws) => {
  var secretKey = uuid.v4();
  var jkey = JSON.stringify({data: secretKey,type:"key"});
  ws.send(jkey);
  var dateObject = new Date();
  var encTime = encrypt(secretKey,dateObject.toString());
  var jtime = JSON.stringify({data: encTime,type:"stamp"});
  ws.send(jtime);
  ws.on("message", (msg) => {
    let reversed = "";
    let message = decrypt(secretKey,msg);
    message
      .toString()
      .split("")
      .forEach((char) => {
        reversed = `${char}${reversed}`;
      });
    var encryptedRevMsg = encrypt(secretKey,reversed);
    var encryptedMsg = encrypt(secretKey,message);
    var jmsg = JSON.stringify({reversed: encryptedRevMsg, normal: encryptedMsg, type: "reverse"});
    ws.send(jmsg);
  });
});
//--------------------------connection


console.log("WebSocketServer listening on port: " + wsPost);

server.listen(666, () => {
  console.log('Hosting listening on port: 666');
});