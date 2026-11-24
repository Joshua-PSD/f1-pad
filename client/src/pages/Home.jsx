
import React from "react";
import { Link } from "react-router-dom";
import SectionHeading from "../components/SectionHeading.jsx";

// Dashboard page: displays quick links,
// database counts, and the welcome section.
export default function Home({ data, user }) {
  return (
    <main className="page">

      {/* Main hero section */}
      <section className="hero">
        <div>
          <p className="kicker">2026 SEASON • FAN HUB</p>

          <h1>
            THE WORLD OF<br />
            <span>FORMULA 1.</span>
          </h1>

          <p className="hero-copy">
            Your personal F1 paddock. Explore the grid, teams,
            cars, circuits, and test your race knowledge.
          </p>

          <Link to="/drivers" className="btn red">
            Explore the grid →
          </Link>
        </div>

        <div className="hero-visual">
          <div className="hero-graphic">
            <span>F1</span>
            <div className="track-line"></div>
            <small>PAD / 2026</small>
          </div>
        </div>
      </section>

      {/* Directory heading */}
      <SectionHeading
        kicker="PAD DIRECTORY"
        title="Explore the paddock"
        description="Your starting point for the 2026 Formula 1 season."
      />

      {/* Database statistics */}
      <div className="stat-grid">
        <div className="stat-card">
          <strong>{data.drivers.length || 22}</strong>
          <span>DRIVERS</span>
        </div>

        <div className="stat-card">
          <strong>{data.teams.length || 11}</strong>
          <span>TEAMS</span>
        </div>

        <div className="stat-card">
          <strong>{data.cars.length || 11}</strong>
          <span>CAR RECORDS</span>
        </div>

        <div className="stat-card">
          <strong>{data.tracks.length || 24}</strong>
          <span>GRAND PRIX</span>
        </div>
      </div>

      {/* Main navigation cards */}
      <div className="feature-grid">

        <Link to="/drivers" className="feature-card">
          <span>01 / GRID</span>
          <h2>Drivers</h2>
          <p>
            Meet all 22 drivers and see their race numbers,
            nationality, and team.
          </p>
          <b>View drivers ↗</b>
        </Link>

        <Link to="/teams" className="feature-card">
          <span>02 / GARAGE</span>
          <h2>Teams & cars</h2>
          <p>
            Explore the 11 constructors and their 2026 car profiles.
          </p>
          <b>Enter the garage ↗</b>
        </Link>

        <Link to="/tracks" className="feature-card">
          <span>03 / CIRCUITS</span>
          <h2>Tracks</h2>
          <p>
            Discover the locations and details of the 24 Grand Prix circuits.
          </p>
          <b>Explore circuits ↗</b>
        </Link>

        <Link to="/quiz" className="feature-card quiz-feature">
          <span>04 / CHALLENGE</span>
          <h2>F1 Trivia</h2>
          <p>
            Ten questions. Race for a perfect score and earn your title.
          </p>
          <b>Start the quiz ↗</b>
        </Link>

      </div>

      {/* Welcome and profile section */}
      <div className="welcome-strip">
        <div>
          <p className="kicker">DRIVER PROFILE</p>

          <h3>
            {user
              ? `Welcome back, ${user.username}.`
              : "Your F1 journey starts here."}
          </h3>

          <p className="muted">
            Personalize your profile, set your favorite team,
            and track your trivia results.
          </p>
        </div>

        <Link to="/profile" className="btn">
          Open profile →
        </Link>
      </div>

    </main>
  );
}
