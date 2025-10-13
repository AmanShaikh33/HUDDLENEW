// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import HuddleLogin from './pages/HuddleLogin';
import HuddleSignup from './pages/HuddleSignup';

import Feed from './components/Feed';
import Notifications from './components/Notifications';
import Messages from './components/Messages';
import Profile from './components/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HuddleLogin />} />
        <Route path="/signup" element={<HuddleSignup />} />
        
        {/* Layout route: HomePage stays, body content changes */}
        <Route path="/homepage" element={<HomePage />}>
          <Route index element={<Feed />} />             {/* default / */}
          <Route path="feed" element={<Feed />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="messages" element={<Messages />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
