import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, initDatabase } from './db.js';
import { OAuth2Client } from 'google-auth-library';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

if (!GOOGLE_CLIENT_ID) {
  console.warn("ADVERTENCIA: No se ha configurado GOOGLE_CLIENT_ID. El login de Google fallará.");
}
app.use(cors());
app.use(express.json());

// Definir __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializar DB al arrancar
initDatabase().catch(err => {
  console.error("Fallo crítico inicializando la DB:", err);
});

// --- HELPERS ---

/**
 * Genera un número de astronauta de 4 cifras (0000 - 9999) que no exista aún.
 */
async function generateUniqueAstronautNumber(): Promise<string> {
  let isUnique = false;
  let num = "";
  
  while (!isUnique) {
    num = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const res = await pool.query('SELECT 1 FROM artemis_users WHERE astronaut_number = $1', [num]);
    if (res.rowCount === 0) isUnique = true;
  }
  
  return num;
}

// --- ENDPOINTS DE AUTENTICACIÓN / REGISTRO ---

app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'Falta credencial de Google' });

  try {
    // 1. Verificar el token de Google
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) return res.status(401).json({ error: 'Token inválido' });

    const email = payload.email;
    const name = payload.name || '';

    // 2. Buscar o Crear en artemis_users
    let artemisUser;
    const existingArtemis = await pool.query('SELECT * FROM artemis_users WHERE email = $1', [email]);
    
    if (existingArtemis.rowCount && existingArtemis.rowCount > 0) {
      artemisUser = existingArtemis.rows[0];
    } else {
      // Registrar nuevo
      const astronautNumber = await generateUniqueAstronautNumber();
      // Intentar vincular con tabla global users para guardar el UUID original si existe por email
      const globalRes = await pool.query('SELECT user_id FROM users WHERE email = $1 LIMIT 1', [email]);
      const userId = globalRes.rowCount && globalRes.rowCount > 0 ? globalRes.rows[0].user_id : null;

      const insertRes = await pool.query(
        'INSERT INTO artemis_users (email, full_name, astronaut_number, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [email, name, astronautNumber, userId]
      );
      artemisUser = insertRes.rows[0];
    }

    // 3. Determinar el ROL (Superadmin si está en la tabla global users con dev_role)
    let role: 'user' | 'superadmin' = 'user';
    const devRoleRes = await pool.query('SELECT dev_role FROM users WHERE email = $1 LIMIT 1', [email]);
    
    if (devRoleRes.rowCount && devRoleRes.rowCount > 0) {
      if (devRoleRes.rows[0].dev_role === 'superadmin') {
        role = 'superadmin';
      }
    }

    res.json({
      ...artemisUser,
      role
    });
  } catch (err) {
    console.error("Error validando Google Token:", err);
    res.status(500).json({ error: 'Error de autenticación con Google' });
  }
});

app.get('/api/auth/search-astronaut', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);

  try {
    const result = await pool.query(
      "SELECT id, astronaut_number, email FROM artemis_users WHERE astronaut_number LIKE $1 OR email LIKE $1 LIMIT 5",
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error buscando astronauta' });
  }
});

// --- ENDPOINTS DE JUEGOS ---

app.post('/api/memoria', async (req, res) => {
  const { artemis_user_id, tiempo_exacto } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO artemis_mision_memoria (artemis_user_id, tiempo_exacto) VALUES ($1, $2) RETURNING *',
      [artemis_user_id, tiempo_exacto]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error guardando tiempo' });
  }
});

app.post('/api/base-lunar', async (req, res) => {
  const { astronaut_number, sentadillas } = req.body;
  try {
    // Buscar id por número de astronauta
    const userRes = await pool.query('SELECT id FROM artemis_users WHERE astronaut_number = $1', [astronaut_number]);
    if (userRes.rowCount === 0) return res.status(404).json({ error: 'Astronauta no encontrado' });
    
    const artemisUserId = userRes.rows[0].id;
    const result = await pool.query(
      'INSERT INTO artemis_base_lunar (artemis_user_id, sentadillas) VALUES ($1, $2) RETURNING *',
      [artemisUserId, sentadillas]
    );

    // Actualizar cache global (Energía: 1 sentadilla = 1 Julio/Energía)
    await pool.query('UPDATE artemis_estado_global SET total_energia = total_energia + $1', [sentadillas]);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error guardando sentadillas' });
  }
});

app.post('/api/rumbo-luna', async (req, res) => {
  const { astronaut_number, centimetros } = req.body;
  try {
    const userRes = await pool.query('SELECT id FROM artemis_users WHERE astronaut_number = $1', [astronaut_number]);
    if (userRes.rowCount === 0) return res.status(404).json({ error: 'Astronauta no encontrado' });
    
    const artemisUserId = userRes.rows[0].id;
    const result = await pool.query(
      'INSERT INTO artemis_rumbo_luna (artemis_user_id, centimetros) VALUES ($1, $2) RETURNING *',
      [artemisUserId, centimetros]
    );

    // Actualizar cache global (Vuelo: 1 cm = 1 km)
    await pool.query('UPDATE artemis_estado_global SET total_km = total_km + $1', [centimetros]);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error guardando salto' });
  }
});

// --- RANKINGS Y STATUS ---

app.get('/api/status/global', async (req, res) => {
  try {
    const status = await pool.query('SELECT total_km, total_energia FROM artemis_estado_global LIMIT 1');
    res.json(status.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo estado global' });
  }
});

app.get('/api/rankings/:type', async (req, res) => {
  const { type } = req.params;
  let query = '';

  try {
    if (type === 'energia') {
      query = `
        SELECT u.astronaut_number as id, SUM(b.sentadillas) as score 
        FROM artemis_users u
        JOIN artemis_base_lunar b ON u.id = b.artemis_user_id
        GROUP BY u.id
        ORDER BY score DESC LIMIT 10
      `;
    } else if (type === 'vuelo') {
      query = `
        SELECT u.astronaut_number as id, SUM(r.centimetros) as score 
        FROM artemis_users u
        JOIN artemis_rumbo_luna r ON u.id = r.artemis_user_id
        GROUP BY u.id
        ORDER BY score DESC LIMIT 10
      `;
    } else if (type === 'velocidad') {
      query = `
        SELECT u.astronaut_number as id, MIN(m.tiempo_exacto) as score 
        FROM artemis_users u
        JOIN artemis_mision_memoria m ON u.id = m.artemis_user_id
        GROUP BY u.id
        ORDER BY score ASC LIMIT 10
      `;
    } else {
      return res.status(400).json({ error: 'Tipo de ranking no válido' });
    }

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo ranking' });
  }
});

// --- SERVIR FRONTEND EN PRODUCCIÓN ---
// El servidor corre desde server/dist, el frontend está en /dist (raíz)
const frontendPath = path.join(__dirname, '../../dist');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor Artemis II corriendo en el puerto ${PORT}`);
});
