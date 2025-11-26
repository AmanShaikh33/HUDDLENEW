// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import HuddleLogin from "./pages/HuddleLogin";
import HuddleSignup from "./pages/HuddleSignup";
import Feed from "./components/Feed";
import Notifications from "./components/Notifications";
import Profile from "./components/Profile";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import UserAccount from "./components/UserAccount";
import BackendStatus from "./components/BackendStatus"; // ✅ ADDED

function App() {
  return (
    <>
      <BackendStatus />

      <Router>
        <Routes>
    
          <Route
            path="/"
            element={
              <PublicRoute>
                <HuddleLogin />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <HuddleSignup />
              </PublicRoute>
            }
          />

         
          <Route
            path="/homepage"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          >
            <Route index element={<Feed />} />
            <Route path="feed" element={<Feed />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
            <Route path="user/:userId" element={<UserAccount />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
