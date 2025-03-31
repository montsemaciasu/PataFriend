import Navbar from "./components/ui/navbar/navbar";
import { Route, Routes } from "react-router-dom";
import {
  HomePage,
  LoginPage,
  RegisterPage,
  MatchPage,
  ProfilePage,
} from "./pages";
import { PrivateRoute } from "./guards";
import "@fortawesome/fontawesome-free/css/all.min.css";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/matches"
          element={
            <PrivateRoute>
              <MatchPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <PrivateRoute>
              <ProfilePage userType="adopter" />{" "}
            </PrivateRoute>
          }
        />
        ¡
        <Route
          path="/shelter/:id"
          element={<ProfilePage userType="shelter" />}
        />
      </Routes>
    </>
  );
}
export default App;
