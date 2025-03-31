import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import * as PataFriendAPI from "../../../services/api-service";
import { useAuthContext } from "../../../contexts/auth-context";
import { useNavigate } from "react-router-dom";
import "./login.css";
import petsImage from "../../../assets/images/login-pets.png";

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const handleLogin = async (user) => {
    try {
      user = await PataFriendAPI.login(user);
      login(user);
      navigate("/");
    } catch (error) {
      if (error.response?.status === 401) {
        const { data } = error.response;
        Object.keys(data.errors).forEach((inputName) =>
          setError(inputName, { message: data.errors[inputName] })
        );
      } else {
        console.error(error);
      }
    }
  };

  return (
    <div className="login-page">
      {/* Sección Izquierda - Bienvenida */}
      <div className="welcome-section">
        <div className="welcome-section-title">
          <div className="welcome-section-text">
            <h1 className="welcome-line">WELCOME</h1>
            <h1 className="welcome-line">BACK,</h1>
            <span>
              <span className="text-pata">Pata</span>
              <span className="text-friend">Friend!</span>
            </span>
          </div>

          <div>
            <img src={petsImage} alt="login-pets" />
          </div>
        </div>

        <p>
          Thousands of little paws are waiting to find their perfect home.
          Swipe, connect, and give the most loyal love a second chance.
        </p>

        <div className="social-icons">
          <i className="fab fa-facebook-f"></i>
          <i className="fab fa-twitter"></i>
          <i className="fab fa-instagram"></i>
          <i className="fab fa-youtube"></i>
        </div>
      </div>

      {/* Sección Derecha - Formulario */}
      <div className="login-form">
        <h2>Login</h2>
        <form onSubmit={handleSubmit(handleLogin)}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email Address"
              {...register("email", { required: "Mandatory field" })}
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email.message}</div>
            )}
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              {...register("password", { required: "Mandatory field" })}
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
            />
            {errors.password && (
              <div className="invalid-feedback">{errors.password.message}</div>
            )}
          </div>

          <button className="btn-signin" type="submit">
            Login now
          </button>

          <p className="forgot-password">Lost your password?</p>
          <p className="new-here">
            New here?{" "}
            <Link to="/register" className="signup-link">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
