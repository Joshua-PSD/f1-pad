
import React from "react";
import { Link, useNavigate } from "react-router-dom";

// Navigation component: keeps links in one place
// and displays account actions.
export default function NavBar({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <header className="nav">
      <Link className="brand" to="/">
        F1<span>PAD</span>
      </Link>

      <nav>
        <Link to="/">Overview</Link>
        <Link to="/drivers">Drivers</Link>
        <Link to="/teams">Teams & Cars</Link>
        <Link to="/tracks">Circuits</Link>
        <Link to="/quiz">Trivia</Link>
        <Link to="/profile">Profile</Link>

        {user?.role === "admin" && (
          <Link to="/admin">Manage DB</Link>
        )}
      </nav>

      <div className="nav-account">
        {user ? (
          <>
            <span className="nav-user">{user.username}</span>

            <button
              className="btn small"
              onClick={() => {
                onLogout();
                navigate("/login");
              }}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/signup" className="btn small red">
              Join
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
