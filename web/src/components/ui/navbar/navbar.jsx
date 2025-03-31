import { Link } from "react-router-dom";
import { useAuthContext } from "../../../contexts/auth-context";
import "./Navbar.css";

function Navbar() {
  const { user, logout } = useAuthContext();

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <span className="navbar-brand">
        <span className="logo-part1">Pata</span>
        <span className="logo-part2">Friend</span>
      </span>

      <ul className="navbar-nav me-automb-lg-0">
        <li className="nav-item">
          <Link className="nav-link" to="/">
            HOME
          </Link>
        </li>

        {user?.userType === "shelter" && (
          <li className="nav-item">
            <Link className="nav-link" to="/">
              ADD PET
            </Link>
          </li>
        )}
        {user && (
          <li className="nav-item">
            <Link className="nav-link" to="/matches">
              MATCHES
            </Link>
          </li>
        )}
        <li className="nav-item">
          <Link className="nav-link" to="/">
            ABOUT US
          </Link>
        </li>
      </ul>

      <ul className="navbar-nav ">
        {user ? (
          <li className="nav-item dropdown">
            <div
              className="nav-link dropdown-toggle user-info nav-user"
              role="button"
              id="navbarDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {user.avatar && (
                <img
                  src={user.avatar}
                  alt="User Avatar"
                  className="user-avatar"
                />
              )}
              <span className="user-name">{user.name}</span>
            </div>

            <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
              <li>
                <Link
                  className="dropdown-item"
                  to={`/${
                    user.userType === "shelter" ? "shelter" : "profile"
                  }/${user.id}`}
                >
                  Profile
                </Link>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    console.log("Logout clicked");
                    logout();
                  }}
                >
                  Logout
                </button>
              </li>
            </ul>
          </li>
        ) : (
          <li className="nav-item">
            <Link className="nav-link" to="/login">
              LOGIN
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
