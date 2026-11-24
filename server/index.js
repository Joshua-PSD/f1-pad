import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, promoteConfiguredAdmin } from './database.js';
dotenv.config();
const app = express(); app.use(cors()); app.use(express.json());
const PORT = process.env.PORT || 3001; const SECRET = process.env.JWT_SECRET || 'dev-only-change-me';

// Auth middleware: verifies a bearer token and attaches the account to the request.
function auth(req,res,next){ const token=(req.headers.authorization||'').replace('Bearer ',''); try { req.user=jwt.verify(token,SECRET); next(); } catch { return res.status(401).json({error:'Please log in again.'}); } }
function admin(req,res,next){ if(req.user?.role!=='admin') return res.status(403).json({error:'Admin access required.'}); next(); }

// Register endpoint. Usernames matching ADMIN_USERNAME become admin accounts for local project setup.
app.post('/api/auth/register',async(req,res)=>{ const {username,email,password}=req.body; if(!username||!email||!password||password.length<6) return res.status(400).json({error:'Enter a username, email, and password (6+ characters).'}); try { const hash=await bcrypt.hash(password,10); const r=await db.run('INSERT INTO users(username,email,password_hash) VALUES(?,?,?)',[username,email,hash]); await promoteConfiguredAdmin(username); const user=await db.get('SELECT id,username,email,role,bio,avatar,favorite_team FROM users WHERE id=?',[r.lastID]); const token=jwt.sign({id:user.id,username:user.username,role:user.role},SECRET,{expiresIn:'7d'}); res.json({token,user}); } catch(e){res.status(400).json({error:'Username or email may already be in use.'});} });
// Login endpoint checks password hashes, then returns a signed token and profile.
app.post('/api/auth/login',async(req,res)=>{ const {username,password}=req.body; const user=await db.get('SELECT * FROM users WHERE username=? OR email=?',[username,username]); if(!user||!await bcrypt.compare(password||'',user.password_hash)) return res.status(401).json({error:'Invalid username/email or password.'}); const safe={id:user.id,username:user.username,email:user.email,role:user.role,bio:user.bio,avatar:user.avatar,favorite_team:user.favorite_team}; const token=jwt.sign({id:user.id,username:user.username,role:user.role},SECRET,{expiresIn:'7d'}); res.json({token,user:safe}); });
// Return current account profile.
app.get('/api/auth/me',auth,async(req,res)=>{ const user=await db.get('SELECT id,username,email,role,bio,avatar,favorite_team FROM users WHERE id=?',[req.user.id]); res.json({user}); });
// Profile update route: avatar is a URL, bio, and favorite team are user-editable.
app.put('/api/profile',auth,async(req,res)=>{ const {bio='',avatar='',favorite_team=''}=req.body; await db.run('UPDATE users SET bio=?,avatar=?,favorite_team=? WHERE id=?',[bio,avatar,favorite_team,req.user.id]); const user=await db.get('SELECT id,username,email,role,bio,avatar,favorite_team FROM users WHERE id=?',[req.user.id]); res.json({user}); });
// Public read routes for the F1 encyclopedia collections.
for (const collection of ['drivers','teams','cars','tracks']) app.get(`/api/${collection}`,async(req,res)=>{ res.json(await db.all(`SELECT * FROM ${collection} ORDER BY id`)); });
// Admin-only add/update/delete routes. Each uses a table whitelist to avoid arbitrary SQL table names.
const allowed={drivers:['name','number','country','team','image','notes'],teams:['name','country','color','image','notes'],cars:['team','model','season','image','notes'],tracks:['grand_prix','country','circuit','length_km','laps','image','notes']};
app.post('/api/admin/:collection',auth,admin,async(req,res)=>{ const table=req.params.collection, fields=allowed[table]; if(!fields)return res.status(404).json({error:'Unknown collection'}); const keys=fields.filter(k=>req.body[k]!==undefined); if(!keys.length)return res.status(400).json({error:'No fields provided'}); const vals=keys.map(k=>req.body[k]); const sql=`INSERT INTO ${table} (${keys.join(',')}) VALUES (${keys.map(()=>'?').join(',')})`; const r=await db.run(sql,vals); res.json({id:r.lastID}); });
app.put('/api/admin/:collection/:id',auth,admin,async(req,res)=>{ const table=req.params.collection, fields=allowed[table]; if(!fields)return res.status(404).json({error:'Unknown collection'}); const keys=fields.filter(k=>req.body[k]!==undefined); if(!keys.length)return res.status(400).json({error:'No fields provided'}); await db.run(`UPDATE ${table} SET ${keys.map(k=>`${k}=?`).join(',')} WHERE id=?`,[...keys.map(k=>req.body[k]),req.params.id]); res.json({ok:true}); });
app.delete('/api/admin/:collection/:id',auth,admin,async(req,res)=>{ const table=req.params.collection; if(!allowed[table])return res.status(404).json({error:'Unknown collection'}); await db.run(`DELETE FROM ${table} WHERE id=?`,[req.params.id]); res.json({ok:true}); });
app.listen(PORT,()=>console.log(`F1 Pad API listening on http://localhost:${PORT}`));
