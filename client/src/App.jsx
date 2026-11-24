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
// 2. API CONFIGURATION
// ================================================

// Backend API address.
// Change this if you decide to use another port.
const API = "http://localhost:3001/api";

// Initial empty database collections.
// These will be populated using the Express API.
const empty = {
  drivers: [],
  teams: [],
  cars: [],
  tracks: []
};


// ================================================
// 3. MAIN APP COMPONENT
// ================================================

export default function App() {

  // ----------------------------------------------
  // USER AUTHENTICATION STATES
  // ----------------------------------------------

  // Retrieve the saved user from localStorage.
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("f1pad_user") || "null")
  );

  // Retrieve the saved authentication token.
  const [token, setToken] = useState(() =>
    localStorage.getItem("f1pad_token") || ""
  );


  // ----------------------------------------------
  // DATABASE STATES
  // ----------------------------------------------

  // Stores all F1 database information.
  const [data, setData] = useState(empty);

  // Tracks whether the database is still loading.
  const [loading, setLoading] = useState(true);

  // Stores API error messages.
  const [error, setError] = useState("");


  // ==============================================
  // 4. LOAD DATABASE INFORMATION
  // ==============================================

  // Fetch drivers, teams, cars, and tracks
  // from the Express backend.
  const refresh = useCallback(async () => {

    try {

      // Request all four database collections.
      const [drivers, teams, cars, tracks] =
        await Promise.all(

          ["drivers", "teams", "cars", "tracks"].map(
            async (collection) => {

              const response = await fetch(
                `${API}/${collection}`
              );

              // Check whether the request was successful.
              if (!response.ok) {
                throw new Error(
                  `Failed to load ${collection}`
                );
              }

              return response.json();
            }
          )
        );

      // Save the retrieved information in React state.
      setData({
        drivers,
        teams,
        cars,
        tracks
      });

      // Clear previous API errors.
      setError("");

    } catch (err) {

      // Display an error if the backend is unavailable.
      console.error("Database loading error:", err);

      setError(
        "Cannot reach the API. Make sure the backend server is running on port 3001."
      );

    } finally {

      // Stop displaying the loading screen.
      setLoading(false);

    }

  }, []);


  // ==============================================
  // 5. LOAD DATABASE WHEN APP STARTS
  // ==============================================

  useEffect(() => {

    // Load all database collections.
    refresh();

  }, [refresh]);


  // ==============================================
  // 6. LOGIN AND REGISTRATION
  // ==============================================

  // Handles both login and account registration.
  async function auth(mode, payload) {

    // Send authentication information to Express.
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

    // Convert the response into JSON.
    const result = await response.json();

    // Handle authentication errors.
    if (!response.ok) {
      throw new Error(
        result.error || "Authentication failed."
      );
    }

    // Save the authentication token.
    setToken(result.token);

    // Save the logged-in user.
    setUser(result.user);

    // Persist the session locally.
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
  // 7. LOGOUT FUNCTION
  // ==============================================

  function logout() {

    // Clear authentication states.
    setToken("");
    setUser(null);

    // Remove saved session information.
    localStorage.removeItem("f1pad_token");
    localStorage.removeItem("f1pad_user");

  }


  // ==============================================
  // 8. UPDATE USER PROFILE
  // ==============================================

  async function saveProfile(payload) {

    // Send updated profile information to Express.
    const response = await fetch(
      `${API}/profile`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",

          // Authentication token for protected requests.
          Authorization: `Bearer ${token}`
        },

        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();

    // Handle profile update errors.
    if (!response.ok) {
      throw new Error(
        result.error || "Profile update failed."
      );
    }

    // Update the current user information.
    setUser(result.user);

    // Update the saved user information.
    localStorage.setItem(
      "f1pad_user",
      JSON.stringify(result.user)
    );

  }


  // ==============================================
  // 9. APPLICATION USER INTERFACE
  // ==============================================

  return (

    <>

      {/* ------------------------------------------
          NAVIGATION BAR
          Displays navigation and user information.
      ------------------------------------------ */}

      <NavBar
        user={user}
        onLogout={logout}
      />


      {/* ------------------------------------------
          API ERROR MESSAGE
          Appears when the backend cannot be reached.
      ------------------------------------------ */}

      {error && (
        <div className="api-banner">
          {error}
        </div>
      )}


      {/* ------------------------------------------
          DATABASE LOADING SCREEN
          Displayed while database information loads.
      ------------------------------------------ */}

      {loading ? (

        <main className="page loading">
          Loading F1 Pad database…
        </main>

      ) : (

        /* ----------------------------------------
           APPLICATION ROUTES
           Controls which page the user can access.
        ---------------------------------------- */

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


          {/* TRIVIA QUIZ PAGE */}
          <Route
            path="/quiz"
            element={<Quiz />}
          />


          {/* USER PROFILE PAGE */}
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


          {/* SIGN UP PAGE */}
          <Route
            path="/signup"
            element={
              user ? (
                <Navigate to="/" replace />
              ) : (
                <AuthPage
                  mode="register"
                  onAuth={auth}
                />
              )
            }
          />


          {/* ADMIN / DATABASE MANAGEMENT PAGE */}
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
          {/* Redirect invalid URLs to the homepage. */}
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
