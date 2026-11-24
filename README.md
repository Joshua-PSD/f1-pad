# F1 Pad — React + Express + SQLite

A learning-friendly Formula 1 encyclopedia and trivia project. Data is local and editable.

## Requirements
- Node.js 18+
- npm

## Start
1. Open this folder in VS Code / terminal.
2. Run `npm install` (root) then `npm run install:all`.
3. Run `npm run dev` at the root. React runs at `http://localhost:5173`, API at `http://localhost:3001`.
4. Register an account. To enable the admin tools, create an account whose username matches `ADMIN_USERNAME` in `server/.env` (default `admin`), then log in. Set a strong local password and keep this local project private.


## Project map
- `client/src/theme.css`: all theme variables, neutral gray/red starter colors, borders, spacing, backgrounds, and card styling. Customize this file first.
- `client/src/data/seedData.js`: starter drivers, teams, cars, tracks, and trivia data. Images are intentionally placeholders (`image: ""`) so you can add your own artwork.
- `server/database.js`: SQLite tables and initial seed data. The API can edit/delete/add drivers, teams, cars, and tracks.
- `client/src/pages/`: page components.
- `client/src/components/`: reusable UI components.


## Notes
- This is an educational local project, not a production authentication system. JWT is stored in localStorage, so do not reuse real passwords.
- Images can be replaced by editing each database record's `image` field. Leave blank to show a text placeholder.
- The quiz is 10 questions. Correct answers are worth 10 points each, so score ranges 0–100. The title bands: 90–100 World Champion, 70–89 Runner-up, 50–69 Third Place, 20–49 Out of Points.
- Calendar list is based on the announced 2026 calendar. Madrid's event was marked subject to homologation in the published calendar.

## Install commands in detail
From the project root:
```bash
npm install
npm run install:all
npm run dev
```
If `npm run install:all` is interrupted, run the two installs separately:
```bash
npm install --prefix server
npm install --prefix client
```
For admin tools, optional local config:
```bash
cp server/.env.example server/.env
```
Then edit `server/.env`. The configured username defaults to `admin`; register that username to receive admin privileges.
