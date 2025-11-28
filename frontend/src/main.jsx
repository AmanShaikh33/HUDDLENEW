import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { UserContextProvider } from "./context/UserContext.jsx";
import { ChatProvider } from "./context/ChatContext.jsx";
import { ThemeProvider } from "./context/ThemeContext";

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <UserContextProvider>
    <ChatProvider>
       <ThemeProvider>
      <App />
      </ThemeProvider>
    </ChatProvider>
</UserContextProvider>

  </StrictMode>
)
