
import React, { useMemo, useState } from 'react';
import SectionHeading from '../components/SectionHeading.jsx';
import MediaPlaceholder from '../components/MediaPlaceholder.jsx';

// Circuits page:
// Displays circuit records from the tracks table.
// Users can search by Grand Prix name, country, or circuit name.

export default function Tracks({ tracks = [] }) {
    const [query, setQuery] = useState('');

    // Keep the original database order and filter the circuits.
    const list = useMemo(() => {
        const search = query.trim().toLowerCase();

        return tracks.filter(t =>
            `${t.grand_prix || ''} ${t.country || ''} ${t.circuit || ''}`
                .toLowerCase()
                .includes(search)
        );
    }, [tracks, query]);

    return (
        <main className="page">

            {/* PAGE HEADING */}
            <SectionHeading
                kicker="WORLD TOUR / 2026 CALENDAR"
                title="Circuits"
                description="24 Grand Prix venues. Add missing circuit records or edit details in the local database."
            />

            {/* SEARCH BAR */}
            <div className="toolbar">
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search circuit or country..."
                />

                <span>
                    {list.length} {list.length === 1 ? 'circuit' : 'circuits'}
                </span>
            </div>

            {/* CIRCUIT CARDS */}
            <div className="track-grid">

                {list.length > 0 ? (
                    list.map(t => {

                        // Find the original round number before filtering.
                        const originalIndex = tracks.findIndex(
                            track => track.id === t.id
                        );

                        return (
                            <article className="track-card" key={t.id}>

                                {/* Circuit image */}
                                <MediaPlaceholder
                                    src={t.image}
                                    label={`${t.circuit || 'Circuit'} track`}
                                    className="track-photo"
                                />

                                <div className="track-details">

                                    {/* ROUND NUMBER */}
                                    <span className="track-round">
                                        ROUND {String(originalIndex + 1).padStart(2, '0')}
                                    </span>

                                    {/* GRAND PRIX NAME */}
                                    <h3>{t.grand_prix || 'Unknown Grand Prix'}</h3>

                                    {/* CIRCUIT NAME */}
                                    <p>{t.circuit || 'Circuit information unavailable'}</p>

                                    {/* COUNTRY */}
                                    <small>{t.country || 'Country unavailable'}</small>

                                    {/* CIRCUIT STATISTICS */}
                                    <div className="track-stats">

                                        <span>
                                            {t.length_km
                                                ? `${t.length_km} km`
                                                : 'Length TBD'}
                                        </span>

                                        <span>
                                            {t.laps
                                                ? `${t.laps} laps`
                                                : 'Lap count TBD'}
                                        </span>

                                    </div>

                                </div>
                            </article>
                        );
                    })
                ) : (
                    <div className="empty-state">
                        <h3>No circuits found</h3>
                        <p>
                            Try another circuit name, Grand Prix, or country.
                        </p>
                    </div>
                )}

            </div>

        </main>
    );
}
