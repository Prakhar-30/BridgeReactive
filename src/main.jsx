// main.jsx or index.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThirdwebProvider } from "@thirdweb-dev/react";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThirdwebProvider 
      clientId="233bcf8ed1c12d806c8643fbcb370350"
    >
      <App />
    </ThirdwebProvider>
  </React.StrictMode>,
)