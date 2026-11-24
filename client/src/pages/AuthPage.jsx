
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function AuthPage({ mode, onAuth }) {
    const signup = mode === 'signup';
    const nav = useNavigate();

    // Form fields
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Password visibility
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Form status
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Handle login and signup.
    async function submit(e) {
        e.preventDefault();

        if (loading) return;

        setError('');

        // Validate username.
        if (!username.trim()) {
            setError('Please enter your username.');
            return;
        }

        if (username.trim().length < 3) {
            setError('Username must contain at least 3 characters.');
            return;
        }

        // Validate password.
        if (!password) {
            setError('Please enter your password.');
            return;
        }

        if (password.length < 6) {
            setError('Password must contain at least 6 characters.');
            return;
        }

        // Confirm password during signup.
        if (signup && password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            if (typeof onAuth !== 'function') {
                throw new Error('Authentication function is unavailable.');
            }

            // Send username and password to App.jsx.
            await onAuth(mode, {
                username: username.trim(),
                password
            });

            // Redirect after successful authentication.
            nav('/');
        } catch (err) {
            setError(
                err.message || 'Authentication failed. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="auth-page">

            {/* LEFT SIDE */}
            <div className="auth-side">
                <p className="kicker">F1 PAD / MEMBER ACCESS</p>

                <h1>
                    WELCOME
                    <br />
                    <span>TO THE PADDOCK.</span>
                </h1>

                <p>
                    Join the F1 Pad paddock. Customize your profile,
                    explore the grid, and test your Formula 1 knowledge.
                </p>
            </div>

            {/* AUTHENTICATION FORM */}
            <form className="auth-card" onSubmit={submit}>

                <p className="kicker">ACCOUNT</p>

                <h2>
                    {signup ? 'Create account' : 'Log in'}
                </h2>

                {/* USERNAME */}
                <label>
                    Username

                    <input
                        type="text"
                        value={username}
                        onChange={e => {
                            setUsername(e.target.value);
                            setError('');
                        }}
                        placeholder="Enter your username"
                        autoComplete="username"
                        minLength={3}
                        required
                    />
                </label>

                {/* PASSWORD */}
                <label>
                    Password

                    <div className="password-field">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={e => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            placeholder="At least 6 characters"
                            autoComplete={
                                signup ? 'new-password' : 'current-password'
                            }
                            minLength={6}
                            required
                        />

                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>
                </label>

                {/* CONFIRM PASSWORD - SIGNUP ONLY */}
                {signup && (
                    <label>
                        Confirm Password

                        <div className="password-field">
                            <input
                                type={
                                    showConfirmPassword ? 'text' : 'password'
                                }
                                value={confirmPassword}
                                onChange={e => {
                                    setConfirmPassword(e.target.value);
                                    setError('');
                                }}
                                placeholder="Enter your password again"
                                autoComplete="new-password"
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                            >
                                {showConfirmPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </label>
                )}

                {/* ERROR MESSAGE */}
                {error && (
                    <p className="error" role="alert">
                        {error}
                    </p>
                )}

                {/* SUBMIT BUTTON */}
                <button
                    className="btn red full"
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? 'Please wait...'
                        : signup
                        ? 'Create account →'
                        : 'Log in →'}
                </button>

                {/* SWITCH LOGIN / SIGNUP */}
                <p className="auth-switch">
                    {signup
                        ? 'Already registered?'
                        : 'New to F1 Pad?'}

                    {' '}

                    <Link to={signup ? '/login' : '/signup'}>
                        {signup ? 'Log in' : 'Sign up'}
                    </Link>
                </p>

            </form>
        </main>
    );
}
