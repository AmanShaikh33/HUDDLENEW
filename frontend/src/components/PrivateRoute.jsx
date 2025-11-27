import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const user = localStorage.getItem("user");

  const isAuth = user ? JSON.parse(user) : null;

  return isAuth ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
