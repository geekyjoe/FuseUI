import React, { useState } from 'react';

const ChatContainer = ({ username }) => {
  const [message, setMessage] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const handleInputChange = (event) => {
    const inputValue = event.target.value;
    setMessage(inputValue);
    setIsButtonDisabled(inputValue.trim() === '');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (message.trim()) {
      console.log('Message sent:', message);
      setMessage('');
      setIsButtonDisabled(true);
    }
  };

  const sendMessage1 = (text) => {
    console.log(text); // Handle sending the pre-defined messages
  };

  return (
    <div className="main">
      <div id="chatContainer" className="flex-grow-0">
        <div id="chatbox" className="message_container">
          <div className="logoContainer">
            <div className="logo">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="bi bi-stars">
                <defs>
                  <linearGradient id="gradient-fill" x1="20%" y1="50%" x2="100%" y2="75%">
                    <stop offset="0%" style={{ stopColor: '#bda0de', stopOpacity: 1 }} />
                    <stop offset="50%" style={{ stopColor: '#867fea', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#5272f2', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#gradient-fill)"
                  d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828zM3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387A1.73 1.73 0 0 0 4.593 5.69l-.387 1.162a.217.217 0 0 1-.412 0L3.407 5.69A1.73 1.73 0 0 0 2.31 4.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.73 1.73 0 0 0 3.407 2.31zM10.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732L9.1 2.137a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z"
                />
              </svg>
            </div>
            <div className="greet">
              <p>Hello, {username}. What can I help you with?</p>
            </div>
            <div className="suggestion-card-container">
              <div className="suggestion-card" onClick={() => sendMessage1('How to apply for Credit Card?')}>
                <i className="bi bi-credit-card-2-front"></i>
                <p>How to apply for Credit Card?</p>
              </div>
              <div className="suggestion-card" onClick={() => sendMessage1('How do I block a lost card?')}>
                <i className="bi bi-safe"></i>
                <p>How do I block a lost card?</p>
              </div>
              <div className="suggestion-card" onClick={() => sendMessage1('How do I set up direct deposit?')}>
                <i className="bi bi-cash-stack"></i>
                <p>How do I set up direct deposit?</p>
              </div>
              <div className="suggestion-card" onClick={() => sendMessage1('How do I open a savings account?')}>
                <i className="bi bi-bank"></i>
                <p>How do I open a savings account?</p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-container">
          <form onSubmit={handleSubmit} className="message-wrapper">
            <textarea
              id="message"
              className="form-control"
              placeholder="Message..."
              rows="1"
              value={message}
              onChange={handleInputChange}
            ></textarea>
            <button className="send-button" type="submit" disabled={isButtonDisabled}>
              <svg xmlns="http://www.w3.org/2000/svg" height="45" width="45" viewBox="0 0 24 24" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm.53 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v5.69a.75.75 0 0 0 1.5 0v-5.69l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
