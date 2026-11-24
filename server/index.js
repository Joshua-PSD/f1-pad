
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, promoteConfiguredAdmin } from './database.js';

dotenv.config();

const app = express();

// ================================================
// SERVER CONFIGURATION
// ================================================

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const SECRET = process.env.JWT_SECRET || 'dev-only-change-me';

// ================================================
// AUTHENTICATION MIDDLEWARE
// ================================================

// Checks whether the request contains a valid login token.
function auth(req, res, next) {
    const token = (req.headers.authorization || '').replace('Bearer ', '');

    try {
        req.user = jwt.verify(token, SECRET);
        next();
    } catch {
        return res.status(401).json({
            error: 'Please log in again.'
        });
    }
}

// Checks whether the logged-in user is an administrator.
function admin(req, res, next) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({
            error: 'Admin access required.'
        });
    }

    next();
}

// ================================================
// USER REGISTRATION
// ================================================

// Handles username-and-password registration.
//
// Both /signup and /register are supported so the
// frontend can use either URL.
//
// The existing database appears to have an email column.
// We generate an internal placeholder email to keep that
// column compatible. Users do not need to enter an email.

async function register(req, res) {
    const username = String(req.body?.username || '').trim();
    const password = req.body?.password || '';

    // Validate username.
    if (!username || username.length < 3) {
        return res.status(400).json({
            error: 'Username must contain at least 3 characters.'
        });
    }

    // Validate password.
    if (typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({
            error: 'Password must contain at least 6 characters.'
        });
    }

    try {
        // Hash the password before saving it.
        const hash = await bcrypt.hash(password, 10);

        // Internal placeholder for compatibility with the
        // existing SQLite email column.
        const email = `${username.toLowerCase()}@f1pad.local`;

        // Insert the new account.
        const result = await db.run(
            `INSERT INTO users (username, email, password_hash)
             VALUES (?, ?, ?)`,
            [username, email, hash]
        );

        // Promote the account if its username matches
        // the configured administrator username.
        await promoteConfiguredAdmin(username);

        // Retrieve the newly created account.
        const user = await db.get(
            `SELECT id, username, role, bio, avatar, favorite_team
             FROM users
             WHERE id = ?`,
            [result.lastID]
        );

        // Generate login token.
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role
            },
            SECRET,
            { expiresIn: '7d' }
        );

        return res.status(201).json({
            token,
            user
        });

    } catch (error) {
        console.error('Registration error:', error);

        return res.status(400).json({
            error: 'Username is already taken or account creation failed.'
        });
    }
}

// Support both registration URLs.
app.post('/api/auth/signup', register);
app.post('/api/auth/register', register);

// ================================================
// USER LOGIN
// ================================================

app.post('/api/auth/login', async (req, res) => {
    const username = String(req.body?.username || '').trim();
    const password = req.body?.password || '';

    if (!username || !password) {
        return res.status(400).json({
            error: 'Enter your username and password.'
        });
    }

    try {
        // Find the account using its username only.
        const user = await db.get(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        // Verify the password.
        if (
            !user ||
            !await bcrypt.compare(password, user.password_hash)
        ) {
            return res.status(401).json({
                error: 'Invalid username or password.'
            });
        }

        // Never send the password hash to the frontend.
        const safeUser = {
            id: user.id,
            username: user.username,
            role: user.role,
            bio: user.bio,
            avatar: user.avatar,
            favorite_team: user.favorite_team
        };

        // Generate authentication token.
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role
            },
            SECRET,
            { expiresIn: '7d' }
        );

        return res.json({
            token,
            user: safeUser
        });

    } catch (error) {
        console.error('Login error:', error);

        return res.status(500).json({
            error: 'Unable to log in. Please try again.'
        });
    }
});

// ================================================
// GET CURRENT USER
// ================================================

app.get('/api/auth/me', auth, async (req, res) => {
    try {
        const user = await db.get(
            `SELECT id, username, role, bio, avatar, favorite_team
             FROM users
             WHERE id = ?`,
            [req.user.id]
        );

        if (!user) {
            return res.status(404).json({
                error: 'User not found.'
            });
        }

        return res.json({ user });

    } catch (error) {
        console.error('Profile retrieval error:', error);

        return res.status(500).json({
            error: 'Unable to retrieve profile.'
        });
    }
});

// ================================================
// UPDATE USER PROFILE
// ================================================

app.put('/api/profile', auth, async (req, res) => {
    try {
        const {
            bio = '',
            avatar = '',
            favorite_team = ''
        } = req.body;

        await db.run(
            `UPDATE users
             SET bio = ?, avatar = ?, favorite_team = ?
             WHERE id = ?`,
            [bio, avatar, favorite_team, req.user.id]
        );

        const user = await db.get(
            `SELECT id, username, role, bio, avatar, favorite_team
             FROM users
             WHERE id = ?`,
            [req.user.id]
        );

        return res.json({ user });

    } catch (error) {
        console.error('Profile update error:', error);

        return res.status(500).json({
            error: 'Profile update failed.'
        });
    }
});

// ================================================
// PUBLIC F1 DATABASE ROUTES
// ================================================

// Retrieves drivers, teams, cars, and tracks.
for (const collection of ['drivers', 'teams', 'cars', 'tracks']) {
    app.get(`/api/${collection}`, async (req, res) => {
        try {
            const records = await db.all(
                `SELECT * FROM ${collection} ORDER BY id`
            );

            return res.json(records);

        } catch (error) {
            console.error(`Error loading ${collection}:`, error);

            return res.status(500).json({
                error: `Unable to load ${collection}.`
            });
        }
    });
}

// ================================================
// ADMIN DATABASE MANAGEMENT
// ================================================

// Only these tables and fields can be modified.
const allowed = {
    drivers: [
        'name',
        'number',
        'country',
        'team',
        'image',
        'notes'
    ],

    teams: [
        'name',
        'country',
        'color',
        'image',
        'notes'
    ],

    cars: [
        'team',
        'model',
        'season',
        'image',
        'notes'
    ],

    tracks: [
        'grand_prix',
        'country',
        'circuit',
        'length_km',
        'laps',
        'image',
        'notes'
    ]
};

// ADD RECORD
app.post('/api/admin/:collection', auth, admin, async (req, res) => {
    try {
        const table = req.params.collection;
        const fields = allowed[table];

        if (!fields) {
            return res.status(404).json({
                error: 'Unknown collection.'
            });
        }

        const keys = fields.filter(
            key => req.body[key] !== undefined
        );

        if (!keys.length) {
            return res.status(400).json({
                error: 'No fields provided.'
            });
        }

        const values = keys.map(key => req.body[key]);

        const sql = `
            INSERT INTO ${table} (${keys.join(',')})
            VALUES (${keys.map(() => '?').join(',')})
        `;

        const result = await db.run(sql, values);

        return res.json({
            id: result.lastID
        });

    } catch (error) {
        console.error('Admin insert error:', error);

        return res.status(500).json({
            error: 'Unable to add record.'
        });
    }
});

// UPDATE RECORD
app.put('/api/admin/:collection/:id', auth, admin, async (req, res) => {
    try {
        const table = req.params.collection;
        const fields = allowed[table];

        if (!fields) {
            return res.status(404).json({
                error: 'Unknown collection.'
            });
        }

        const keys = fields.filter(
            key => req.body[key] !== undefined
        );

        if (!keys.length) {
            return res.status(400).json({
                error: 'No fields provided.'
            });
        }

        const values = keys.map(key => req.body[key]);

        await db.run(
            `UPDATE ${table}
             SET ${keys.map(key => `${key} = ?`).join(', ')}
             WHERE id = ?`,
            [...values, req.params.id]
        );

        return res.json({ ok: true });

    } catch (error) {
        console.error('Admin update error:', error);

        return res.status(500).json({
            error: 'Unable to update record.'
        });
    }
});

// DELETE RECORD
app.delete('/api/admin/:collection/:id', auth, admin, async (req, res) => {
    try {
        const table = req.params.collection;

        if (!allowed[table]) {
            return res.status(404).json({
                error: 'Unknown collection.'
            });
        }

        await db.run(
            `DELETE FROM ${table} WHERE id = ?`,
            [req.params.id]
        );

        return res.json({ ok: true });

    } catch (error) {
        console.error('Admin delete error:', error);

        return res.status(500).json({
            error: 'Unable to delete record.'
        });
    }
});

// ================================================
// UNKNOWN API ROUTES
// ================================================

// Return JSON instead of an HTML 404 page.
app.use('/api', (req, res) => {
    res.status(404).json({
        error: 'API endpoint not found.'
    });
});

// ================================================
// START SERVER
// ================================================

app.listen(PORT, () => {
    console.log(`F1 Pad API listening on http://localhost:${PORT}`);
});
