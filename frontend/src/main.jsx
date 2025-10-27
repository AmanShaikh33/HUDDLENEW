import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { UserContextProvider } from "./context/UserContext.jsx";
import { ChatProvider } from "./context/ChatContext.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <UserContextProvider>
    <ChatProvider>
      <App />
    </ChatProvider>
</UserContextProvider>

  </StrictMode>
)
