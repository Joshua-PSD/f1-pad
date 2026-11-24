import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';

// SQLite connection helper. The DB file is created automatically in this folder.
export const db = await open({ filename: './f1-pad.sqlite', driver: sqlite3.Database });

// Database schema: users, drivers, teams, cars, tracks, and editable profile fields.
await db.exec(`
CREATE TABLE IF NOT EXISTS users (
 id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, email TEXT UNIQUE NOT NULL,
 password_hash TEXT NOT NULL, role TEXT DEFAULT 'user', bio TEXT DEFAULT '', avatar TEXT DEFAULT '', favorite_team TEXT DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS drivers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, number INTEGER, country TEXT, team TEXT, image TEXT DEFAULT '', notes TEXT DEFAULT '');
CREATE TABLE IF NOT EXISTS teams (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, country TEXT, color TEXT DEFAULT '#b8b8b8', image TEXT DEFAULT '', notes TEXT DEFAULT '');
CREATE TABLE IF NOT EXISTS cars (id INTEGER PRIMARY KEY AUTOINCREMENT, team TEXT, model TEXT, season INTEGER DEFAULT 2026, image TEXT DEFAULT '', notes TEXT DEFAULT '');
CREATE TABLE IF NOT EXISTS tracks (id INTEGER PRIMARY KEY AUTOINCREMENT, grand_prix TEXT, country TEXT, circuit TEXT, length_km REAL, laps INTEGER, image TEXT DEFAULT '', notes TEXT DEFAULT '');
`);

// Seed records only when tables are empty. Edit seedData.js in the frontend as a reference,
// or edit rows directly in this SQLite database after the first run.
const driverCount = await db.get('SELECT COUNT(*) AS n FROM drivers');
if (!driverCount.n) {
 const teams = [
  ['McLaren','United Kingdom','#ff8700'],['Mercedes','Germany','#00a19b'],['Red Bull Racing','Austria','#1e41ff'],['Ferrari','Italy','#dc0000'],['Williams','United Kingdom','#005aff'],['Racing Bulls','Italy','#6692ff'],['Aston Martin','United Kingdom','#00665e'],['Haas','United States','#ffffff'],['Audi','Germany','#d30000'],['Alpine','France','#ff69b4'],['Cadillac','United States','#222222']
 ];
 for (const t of teams) await db.run('INSERT INTO teams(name,country,color) VALUES(?,?,?)', t);
 const drivers = [
 ['Lando Norris',1,'United Kingdom','McLaren'],['Oscar Piastri',81,'Australia','McLaren'],['George Russell',63,'United Kingdom','Mercedes'],['Kimi Antonelli',12,'Italy','Mercedes'],['Max Verstappen',3,'Netherlands','Red Bull Racing'],['Isack Hadjar',6,'France','Red Bull Racing'],['Charles Leclerc',16,'Monaco','Ferrari'],['Lewis Hamilton',44,'United Kingdom','Ferrari'],['Alexander Albon',23,'Thailand','Williams'],['Carlos Sainz',55,'Spain','Williams'],['Liam Lawson',30,'New Zealand','Racing Bulls'],['Arvid Lindblad',41,'United Kingdom','Racing Bulls'],['Fernando Alonso',14,'Spain','Aston Martin'],['Lance Stroll',18,'Canada','Aston Martin'],['Esteban Ocon',31,'France','Haas'],['Oliver Bearman',87,'United Kingdom','Haas'],['Nico Hülkenberg',27,'Germany','Audi'],['Gabriel Bortoleto',5,'Brazil','Audi'],['Pierre Gasly',10,'France','Alpine'],['Franco Colapinto',43,'Argentina','Alpine'],['Sergio Pérez',11,'Mexico','Cadillac'],['Valtteri Bottas',77,'Finland','Cadillac']
 ];
 for (const d of drivers) await db.run('INSERT INTO drivers(name,number,country,team) VALUES(?,?,?,?)', d);
 const cars = teams.map(([team])=>[team, `${team} 2026 car`, 2026]);
 for (const c of cars) await db.run('INSERT INTO cars(team,model,season) VALUES(?,?,?)', c);
 const tracks = [
 ['Australian Grand Prix','Australia','Albert Park Grand Prix Circuit',5.278,58],['Chinese Grand Prix','China','Shanghai International Circuit',5.451,56],['Japanese Grand Prix','Japan','Suzuka International Racing Course',5.807,53],['Bahrain Grand Prix','Bahrain','Bahrain International Circuit',5.412,57],['Saudi Arabian Grand Prix','Saudi Arabia','Jeddah Corniche Circuit',6.174,50],['Miami Grand Prix','United States','Miami International Autodrome',5.412,57],['Canadian Grand Prix','Canada','Circuit Gilles-Villeneuve',4.361,70],['Monaco Grand Prix','Monaco','Circuit de Monaco',3.337,78],['Barcelona-Catalunya Grand Prix','Spain','Circuit de Barcelona-Catalunya',4.657,66],['Austrian Grand Prix','Austria','Red Bull Ring',4.318,71],['British Grand Prix','United Kingdom','Silverstone Circuit',5.891,52],['Belgian Grand Prix','Belgium','Circuit de Spa-Francorchamps',7.004,44],['Hungarian Grand Prix','Hungary','Hungaroring',4.381,70],['Dutch Grand Prix','Netherlands','Circuit Zandvoort',4.259,72],['Italian Grand Prix','Italy','Autodromo Nazionale Monza',5.793,53],['Spanish Grand Prix','Spain','Madring',null,null],['Azerbaijan Grand Prix','Azerbaijan','Baku City Circuit',6.003,51],['Singapore Grand Prix','Singapore','Marina Bay Street Circuit',4.940,62],['United States Grand Prix','United States','Circuit of The Americas',5.513,56],['Mexico City Grand Prix','Mexico','Autódromo Hermanos Rodríguez',4.304,71],['São Paulo Grand Prix','Brazil','Interlagos',4.309,71],['Las Vegas Grand Prix','United States','Las Vegas Strip Circuit',6.201,50],['Qatar Grand Prix','Qatar','Lusail International Circuit',5.419,57],['Abu Dhabi Grand Prix','United Arab Emirates','Yas Marina Circuit',5.281,58]
 ];
 for (const t of tracks) await db.run('INSERT INTO tracks(grand_prix,country,circuit,length_km,laps) VALUES(?,?,?,?,?)', t);
}

// Admin role is assigned to the configured username at registration.
export async function promoteConfiguredAdmin(username) {
 const configured = process.env.ADMIN_USERNAME || 'admin';
 if (username.toLowerCase() === configured.toLowerCase()) await db.run('UPDATE users SET role="admin" WHERE username=?', username);
}
