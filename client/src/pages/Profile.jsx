
import React, { useEffect, useState } from 'react';
import SectionHeading from '../components/SectionHeading.jsx';
import MediaPlaceholder from '../components/MediaPlaceholder.jsx';

// Profile page:
// Allows authenticated users to customize their profile.
// Changes are sent to the parent component through onSave.

export default function Profile({ user, teams = [], onSave }) {
    const [bio, setBio] = useState(user?.bio || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [favorite, setFavorite] = useState(user?.favorite_team || '');

    const [message, setMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Update the form whenever the logged-in user changes.
    useEffect(() => {
        setBio(user?.bio || '');
        setAvatar(user?.avatar || '');
        setFavorite(user?.favorite_team || '');
        setMessage('');
    }, [user]);

    // Display a login message if nobody is authenticated.
    if (!user) {
        return (
            <main className="page">
                <SectionHeading
                    kicker="PROFILE"
                    title="Your profile"
                />

                <div className="notice">
                    Log in to personalize your profile.
                </div>
            </main>
        );
    }

    // Save profile information through the parent component.
    async function save(e) {
        e.preventDefault();

        if (isSaving) return;

        setIsSaving(true);
        setMessage('');

        try {
            if (typeof onSave !== 'function') {
                throw new Error('Profile saving is currently unavailable.');
            }

            await onSave({
                bio,
                avatar,
                favorite_team: favorite
            });

            setMessage('Profile updated successfully!');
        } catch (error) {
            console.error('Profile save error:', error);

            setMessage(
                error.message || 'Unable to save your profile. Please try again.'
            );
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <main className="page">

            {/* PAGE HEADING */}
            <SectionHeading
                kicker="F1 PAD / PERSONAL PROFILE"
                title="Your profile"
                description="Customize your identity in the paddock. Personalize your avatar, bio, and favorite team."
            />

            <div className="profile-layout">

                {/* PROFILE PREVIEW */}
                <div className="profile-preview">

                    <MediaPlaceholder
                        src={avatar}
                        label="Profile avatar"
                        className="avatar-preview"
                    />

                    <h2>{user.username}</h2>

                    <p>
                        {favorite || 'Favorite team not selected'}
                    </p>

                    <span className="profile-role">
                        {user.role || 'user'}
                    </span>

                </div>

                {/* PROFILE EDIT FORM */}
                <form
                    className="profile-form"
                    onSubmit={save}
                >

                    {/* AVATAR URL */}
                    <label>
                        Avatar image URL

                        <input
                            type="url"
                            value={avatar}
                            onChange={e => {
                                setAvatar(e.target.value);
                                setMessage('');
                            }}
                            placeholder="https://example.com/avatar.jpg"
                        />
                    </label>

                    {/* BIO */}
                    <label>
                        Short bio

                        <textarea
                            rows="4"
                            maxLength="240"
                            value={bio}
                            onChange={e => {
                                setBio(e.target.value);
                                setMessage('');
                            }}
                            placeholder="Tell the paddock about yourself..."
                        />

                        <small>
                            {bio.length}/240 characters
                        </small>
                    </label>

                    {/* FAVORITE TEAM */}
                    <label>
                        Favorite team

                        <select
                            value={favorite}
                            onChange={e => {
                                setFavorite(e.target.value);
                                setMessage('');
                            }}
                        >
                            <option value="">Choose a team</option>

                            {teams.map(team => (
                                <option
                                    key={team.id}
                                    value={team.name}
                                >
                                    {team.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    {/* SAVE BUTTON */}
                    <button
                        className="btn red"
                        type="submit"
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save profile'}
                    </button>

                    {/* SAVE FEEDBACK */}
                    {message && (
                        <span
                            className="success"
                            role="status"
                        >
                            {message}
                        </span>
                    )}

                </form>

            </div>

        </main>
    );
}
