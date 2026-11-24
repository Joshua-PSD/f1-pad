
import React, { useMemo, useState } from "react";
import SectionHeading from "../components/SectionHeading.jsx";
import MediaPlaceholder from "../components/MediaPlaceholder.jsx";

// Drivers page: searchable driver list.
// Each driver card is generated from database records.
export default function Drivers({ drivers = [] }) {
  // Stores the search input.
  const [search, setSearch] = useState("");

  // Filters drivers based on name, country, or team.
  const filtered = useMemo(() => {
    return drivers.filter((d) =>
      `${d.name} ${d.country} ${d.team}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [drivers, search]);

  return (
    <main className="page">

      {/* Page heading */}
      <SectionHeading
        kicker="2026 GRID / 22 DRIVERS"
        title="Drivers"
        description="Browse the confirmed 2026 grid. Search by name, nationality, or team."
      />

      {/* Search toolbar */}
      <div className="toolbar">
        <input
          placeholder="Search drivers, countries, teams…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <span>{filtered.length} drivers</span>
      </div>

      {/* Driver cards */}
      <div className="driver-grid">
        {filtered.map((d) => (
          <article className="driver-card" key={d.id}>

            <div className="driver-top">
              <span className="number">
                {String(d.number).padStart(2, "0")}
              </span>

              <span className="team-tag">{d.team}</span>
            </div>

            <MediaPlaceholder
              src={d.image}
              label={`${d.name} portrait`}
              className="driver-image"
            />

            <div className="driver-info">
              <h3>{d.name}</h3>
              <p>{d.country}</p>

              <div className="line-meta">
                <span>2026 DRIVER</span>
                <span>#{d.number}</span>
              </div>
            </div>

          </article>
        ))}
      </div>

      {/* Empty search result */}
      {filtered.length === 0 && (
        <p className="muted">No drivers found.</p>
      )}

    </main>
  );
}
