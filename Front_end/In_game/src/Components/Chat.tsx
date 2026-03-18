import { useState, useEffect } from "react";
import axios from "axios";
import "../Css/Chat.css";

interface ChatMessage {
  username: string;
  content: string;
}

type SessionData = {
  username: string;
  sessionIp: string;
};

export function Chat({ username, sessionIp }: SessionData) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  async function updateMessages() {
    try {
      const response = await axios.get(`${sessionIp}/messages/get`);
      setMessages(response.data as ChatMessage[]);
    } catch (err) {
      console.warn("Error fetching messages", err);
    }
  }

  async function sendMessage() {
    if (!inputMessage.trim()) return;

    try {
      await axios.post(`${sessionIp}/messages/send`, {
        username: username,
        content: inputMessage,
      });

      setInputMessage("");
      updateMessages();
    } catch (err) {
      console.warn("There was an error sending message", err);
    }
  }

  useEffect(() => {
  const fetchMessages = async () => {
    try {
        if (username == "" || sessionIp == "") {
            return;
        }
        const response = await axios.get(`${sessionIp}/messages/get`);
        setMessages(response.data as ChatMessage[]);
    } catch (err) {
        console.warn("Error fetching messages", err);
        }
  };

  fetchMessages();

  const interval = setInterval(() => {
    fetchMessages();
  }, 1000);

  return () => clearInterval(interval);
}, [sessionIp, username]);

  return (
    <div className="ChatContainer">
      <div className="Top">
        {messages.map((msg, index) => (
          <div key={index} className="Message">
            <span className="Username">{msg.username}:</span>
            <span className="Text">{msg.content}</span>
          </div>
        ))}
      </div>

      <div className="Bottom">
        <input
          className="Textbar"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type message..."
        />

        <button className="SendButton" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}