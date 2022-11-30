import React from "react";
const { encrypt, decrypt } = require("./crypto");
const { getName } = require("./randomName");

class Chat extends React.Component {
  ws = new WebSocket("ws://openaudata.com:8080");

  state = {
    serverTimeStamp: "",
    randomName: "",
    lstWords: [],
    value: "",
    tmpkey: "",
  };

  componentDidMount() {
    this.connect();
    this.setState({ randomName: getName() });
  }

  connect = () => {
    var tmpkey = "";
    var msgcount = 0;
    // websocket onopen event listener
    this.ws.onopen = () => {
      console.log("hello from console");
    };

    this.ws.onmessage = (evt) => {
      // on receiving a message, add it to the list of messages
      const message = JSON.parse(evt.data);

      switch (message["type"]) {
        case "key":
          tmpkey = message["data"];
          this.setState({ tmpkey: tmpkey });
          break;
        case "stamp":
          var de = decrypt(tmpkey, message["data"]);
          this.setState({ serverTimeStamp: de });
          break;
        case "reverse":
          var deRev = decrypt(tmpkey, message["reversed"]);
          var deNormal = decrypt(tmpkey, message["normal"]);
          console.log(deRev + "---" + deNormal);
          var newLstWords = this.state.lstWords;
          newLstWords.push([deNormal, deRev]);
          this.setState({ lstWords: newLstWords });
          //this.setState({serverTimeStamp: de});
          break;
      }

      msgcount += 1;
    };

    // websocket onclose event listener
    this.ws.onclose = (e) => {
      console.log("bye from console");
    };

    // websocket onerror event listener
    this.ws.onerror = (err) => {
      console.error(
        "Socket encountered error: ",
        err.message,
        "Closing socket"
      );

      this.ws.close();
    };
  };

  btnSend = async () => {
    var msg = this.state.value;
    var key = this.state.tmpkey;
    var enMsg = encrypt(key, msg);
    this.ws.send(enMsg);
  };

  handleChange = async (event) => {
    var i = event.target.value;
    this.setState({ value: i });
  };

  render() {
    return (
      <div className="windowBanner">
        <div className="uiq_tbl_same_bg">
          <span className="uiq_item">{this.state.serverTimeStamp}</span>
          <span className="uiq_item">{this.state.randomName}</span>
        </div>
        {this.renderWords()}
        <div className="footer">
          <input
            value={this.state.value}
            onChange={this.handleChange}
            type="text"
            placeholder="hello"
          />{" "}
          <button onClick={() => this.btnSend()}>Send</button>
        </div>
      </div>
    );
  }

  renderWords = () => {
    var tmpLst = this.state.lstWords;
    if (tmpLst.length > 0) {
      const listItems = tmpLst.map((pair) => (
        <div className="uiq_tr">
          <p class="uiq_item">{pair[0]}</p>
          <p class="uiq_item">{pair[1]}</p>
        </div>
      ));

      return <div className="uiq_tbl_same_bg">{listItems}</div>;
    } else {
      return (
        <div className="uiq_tbl_same_bg">
          <div className="uiq_tr">
            <p className="uiq_item">Send to see the reverse</p>
            <p className="uiq_item">the reverse will show here</p>
          </div>
        </div>
      );
    }
  };
}

export default Chat;
