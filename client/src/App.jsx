
// Import React and React hooks
import React, {
  useCallback,
  useEffect,
  useState
} from "react";

// Import React Router components
import {
  Routes,
  Route,
  Navigate
} from "react-router-dom";

// Import reusable components
import NavBar from "./components/NavBar.jsx";

// Import application pages
import Home from "./pages/Home.jsx";
import Drivers from "./pages/Drivers.jsx";
import Teams from "./pages/Teams.jsx";
import Tracks from "./pages/Tracks.jsx";
import Quiz from "./pages/Quiz.jsx";
import Profile from "./pages/Profile.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import Admin from "./pages/Admin.jsx";

// ================================================
// API CONFIGURATION
// ================================================

const API = "http://localhost:3001/api";

// Initial empty database collections
const empty = {
  drivers: [],
  teams: [],
  cars: [],
  tracks: []
};

// ================================================
// MAIN APP COMPONENT
// ================================================

export default function App() {

  // ----------------------------------------------
  // USER AUTHENTICATION STATES
  // ----------------------------------------------

  // Retrieve saved user from localStorage
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("f1pad_user") || "null")
  );

  // Retrieve saved authentication token
  const [token, setToken] = useState(() =>
    localStorage.getItem("f1pad_token") || ""
  );

  // ----------------------------------------------
  // DATABASE STATES
  // ----------------------------------------------

  const [data, setData] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==============================================
  // LOAD DATABASE INFORMATION
  // ==============================================

  const refresh = useCallback(async () => {
    try {

      // Fetch all database collections
      const [drivers, teams, cars, tracks] =
        await Promise.all(

          ["drivers", "teams", "cars", "tracks"].map(
            async (collection) => {

              const response = await fetch(
                `${API}/${collection}`
              );

              if (!response.ok) {
                throw new Error(
                  `Failed to load ${collection}`
                );
              }

              return response.json();
            }
          )
        );

      // Store database information
      setData({
        drivers,
        teams,
        cars,
        tracks
      });

      setError("");

    } catch (err) {

      console.error("Database loading error:", err);

      setError(
        "Cannot reach the API. Make sure the backend server is running on port 3001."
      );

    } finally {
      setLoading(false);
    }

  }, []);

  // Load database when application starts
  useEffect(() => {
    refresh();
  }, [refresh]);

  // ==============================================
  // LOGIN AND REGISTRATION
  // ==============================================

  async function auth(mode, payload) {

    // Send username and password to Express
    const response = await fetch(
      `${API}/auth/${mode}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    // Read server response
    const result = await response.json();

    // Handle authentication errors
    if (!response.ok) {
      throw new Error(
        result.error || "Authentication failed."
      );
    }

    // Save authentication information
    setToken(result.token);
    setUser(result.user);

    // Persist login session
    localStorage.setItem(
      "f1pad_token",
      result.token
    );

    localStorage.setItem(
      "f1pad_user",
      JSON.stringify(result.user)
    );

  }

  // ==============================================
  // LOGOUT
  // ==============================================

  function logout() {

    setToken("");
    setUser(null);

    localStorage.removeItem("f1pad_token");
    localStorage.removeItem("f1pad_user");

  }

  // ==============================================
  // UPDATE USER PROFILE
  // ==============================================

  async function saveProfile(payload) {

    const response = await fetch(
      `${API}/profile`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || "Profile update failed."
      );
    }

    // Update current user
    setUser(result.user);

    // Update saved user
    localStorage.setItem(
      "f1pad_user",
      JSON.stringify(result.user)
    );

  }

  // ==============================================
  // APPLICATION USER INTERFACE
  // ==============================================

  return (
    <>

      {/* NAVIGATION BAR */}
      <NavBar
        user={user}
        onLogout={logout}
      />

      {/* API ERROR MESSAGE */}
      {error && (
        <div className="api-banner">
          {error}
        </div>
      )}

      {/* DATABASE LOADING SCREEN */}
      {loading ? (

        <main className="page loading">
          Loading F1 Pad database…
        </main>

      ) : (

        <Routes>

          {/* HOME PAGE */}
          <Route
            path="/"
            element={
              <Home
                data={data}
                user={user}
              />
            }
          />

          {/* DRIVERS PAGE */}
          <Route
            path="/drivers"
            element={
              <Drivers
                drivers={data.drivers}
              />
            }
          />

          {/* TEAMS AND CARS PAGE */}
          <Route
            path="/teams"
            element={
              <Teams
                teams={data.teams}
                cars={data.cars}
                drivers={data.drivers}
              />
            }
          />

          {/* TRACKS PAGE */}
          <Route
            path="/tracks"
            element={
              <Tracks
                tracks={data.tracks}
              />
            }
          />

          {/* TRIVIA QUIZ */}
          <Route
            path="/quiz"
            element={<Quiz />}
          />

          {/* USER PROFILE */}
          <Route
            path="/profile"
            element={
              <Profile
                user={user}
                teams={data.teams}
                onSave={saveProfile}
              />
            }
          />

          {/* LOGIN PAGE */}
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/" replace />
              ) : (
                <AuthPage
                  mode="login"
                  onAuth={auth}
                />
              )
            }
          />

          {/* SIGNUP PAGE */}
          <Route
            path="/signup"
            element={
              user ? (
                <Navigate to="/" replace />
              ) : (
                <AuthPage
                  mode="signup"
                  onAuth={auth}
                />
              )
            }
          />

          {/* ADMIN PAGE */}
          <Route
            path="/admin"
            element={
              <Admin
                user={user}
                token={token}
                data={data}
                refresh={refresh}
              />
            }
          />

          {/* UNKNOWN ROUTES */}
          <Route
            path="*"
            element={
              <Navigate to="/" replace />
            }
          />

        </Routes>

      )}

    </>
  );
}
