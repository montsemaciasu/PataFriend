import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import * as PataFriendAPI from "../../../services/api-service";
import { useAuthContext } from "../../../contexts/auth-context";
import { useNavigate } from "react-router-dom";
import "./register-form.css";
import petsImage from "../../../assets/images/register-pets.png";

function RegisterForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm();
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const userType = watch("userType"); 
  const handleRegister = async (user) => {
    const formData = new FormData();
    formData.append("name", user.name);
    formData.append("email", user.email);
    formData.append("password", user.password);
    formData.append("avatar", user.avatar[0]);
    formData.append("province", user.province);
    formData.append("userType", user.userType);
    formData.append("description", user.description); 

    // Campos adicionales según el tipo de usuario
    if (user.userType === "adopter") {
      formData.append("age", user.age);
    } else if (user.userType === "shelter") {
      formData.append("cif", user.cif);
      if (user.website) {
        formData.append("website", user.website);
      }
    }

    try {
      await PataFriendAPI.register(formData);
      const data = await PataFriendAPI.login(user);
      login(data);
      navigate("/");
    } catch (error) {
      if (error.response) {
        const { data } = error.response;

        Object.keys(data.errors || {}).forEach((inputName) =>
          setError(inputName, { message: data.errors[inputName] })
        );
      } else {
        console.error("Unexpected error:", error);
        setError("general", {
          message: "An unexpected error occurred. Please try again.",
        });
      }
    }
  };

  return (
    <div className="register-page">
      {/* Sección Derecha - Formulario */}
      <div className="register-form">
        <h2>Register</h2>
        <form onSubmit={handleSubmit(handleRegister)}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Name"
              {...register("name", { required: "Mandatory field" })}
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
            />
            {errors.name && (
              <div className="invalid-feedback">{errors.name.message}</div>
            )}
          </div>

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

          <div className="input-group">
            <input
              type="text"
              placeholder="Province"
              {...register("province", {
                required: "Please enter your province",
              })}
              className={`form-control ${errors.province ? "is-invalid" : ""}`}
            />
            {errors.province && (
              <div className="invalid-feedback">{errors.province.message}</div>
            )}
          </div>
          <div className="input-group">
            <textarea
              placeholder="Description (max 300 characters)"
              {...register("description", {
                required: "Please enter a description",
                maxLength: {
                  value: 300,
                  message: "Max 300 characters",
                },
              })}
              className={`form-control m-0 ${
                errors.description ? "is-invalid" : ""
              }`}
              rows="3"
            ></textarea>
            {errors.description && (
              <div className="invalid-feedback">
                {errors.description.message}
              </div>
            )}
          </div>

          <div className="input-group">
            <select
              {...register("userType", { required: "Please select a role" })}
              className={`form-control ${
                errors.userType ? "is-invalid" : ""
              } selector`}
            >
              <option value="">Select your role</option>
              <option value="adopter">Adopter</option>
              <option value="shelter">Shelter</option>
            </select>
            {errors.userType && (
              <div className="invalid-feedback">{errors.userType.message}</div>
            )}
          </div>

          {userType === "adopter" && (
            <>
              <div className="input-group">
                <input
                  type="number"
                  placeholder="Age"
                  {...register("age", { required: "Please enter your age" })}
                  className={`form-control ${errors.age ? "is-invalid" : ""}`}
                />
                {errors.age && (
                  <div className="invalid-feedback">{errors.age.message}</div>
                )}
              </div>
            </>
          )}

          {userType === "shelter" && (
            <>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="CIF"
                  {...register("cif", { required: "Please enter the CIF" })}
                  className={`form-control ${errors.cif ? "is-invalid" : ""}`}
                />
                {errors.cif && (
                  <div className="invalid-feedback">{errors.cif.message}</div>
                )}
              </div>

              <div className="input-group">
                <input
                  type="url"
                  placeholder="Website (optional)"
                  {...register("website")}
                  className="form-control"
                />
              </div>
            </>
          )}

          <div className="input-group">
            <input
              type="file"
              {...register("avatar")}
              className={`form-control ${errors.avatar ? "is-invalid" : ""}`}
            />
            {errors.avatar && (
              <div className="invalid-feedback">{errors.avatar.message}</div>
            )}
          </div>

          <button className="btn-login" type="submit">
            Register now
          </button>

          <p className="already-account">Already have an account?</p>
          <p className="new-here">
            Go to{" "}
            <Link to="/login" className="login-link">
              Login
            </Link>
          </p>
          <p className="terms">
            By clicking on "Register now" you agree to our
            <a href="#">Terms of Service</a>and
            <a href="#">Privacy Policy</a>
          </p>
        </form>
      </div>
      <div className="welcome-section">
        <div className="welcome-section-title">
          <div className="welcome-section-text">
            <h1 className="welcome-line">JOIN US.</h1>
            <h1 className="welcome-line">BECOME A</h1>
            <span>
              <span className="text-pata">Pata</span>
              <span className="text-friend">Friend!</span>
            </span>
          </div>

          <div>
            <img src={petsImage} alt="register-pets" />
          </div>
        </div>

        <p>
          Join our community, create your profile, and help connect furry hearts
          with loving homes.
        </p>

        <div className="social-icons-register">
          <i className="fab fa-facebook-f"></i>
          <i className="fab fa-twitter"></i>
          <i className="fab fa-instagram"></i>
          <i className="fab fa-youtube"></i>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;
