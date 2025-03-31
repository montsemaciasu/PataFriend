import { Navigate } from "react-router-dom";
import { useAuthContext } from "../contexts/auth-context";

function PrivateRoute({ children }) {
  const { user } = useAuthContext();

  if (!user) {
    return <Navigate to="/login" />;
  } else if (user.userType && user.userType !== user.userType) {
    return <Navigate to="/403" />;
  } else {
    return children;
  }
}

export default PrivateRoute;
