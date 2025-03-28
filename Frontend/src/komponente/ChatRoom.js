import React, { useState } from 'react';

const ChatRoom = ({ messages, sendMessage, username, onClose }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() !== "") {
      sendMessage(message);
      setMessage("");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-800 bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-lg h-3/4 flex flex-col shadow-lg relative">
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 bg-red-500 text-white rounded px-3 py-1"
        >
          Close
        </button>
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`mb-3 p-3 rounded-lg max-w-xs shadow ${
                msg.senderUsername === username ? 'bg-green-100 self-end' : 'bg-white self-start'
              }`}
            >
              <strong>{msg.senderUsername}:</strong> {msg.message}
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex p-4 border-t border-gray-300">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 mr-2 p-2 border rounded"
          />
          <button 
            type="submit" 
            className="bg-blue-500 text-white rounded px-4 py-2"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;
