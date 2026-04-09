import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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

app.post('/api/auth/register', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'El teléfono es obligatorio' });

  try {
    // 1. Ver si ya está en artemis_users
    const existingArtemis = await pool.query('SELECT * FROM artemis_users WHERE phone_number = $1', [phone]);
    if (existingArtemis.rowCount && existingArtemis.rowCount > 0) {
      return res.json(existingArtemis.rows[0]);
    }

    // 2. Ver si está en la tabla global users
    const existingGlobal = await pool.query('SELECT user_id FROM users WHERE phone = $1 LIMIT 1', [phone]);
    const userId = existingGlobal.rowCount && existingGlobal.rowCount > 0 ? existingGlobal.rows[0].user_id : null;

    // 3. Generar número de astronauta y registrar
    const astronautNumber = await generateUniqueAstronautNumber();
    const result = await pool.query(
      'INSERT INTO artemis_users (user_id, astronaut_number, phone_number) VALUES ($1, $2, $3) RETURNING *',
      [userId, astronautNumber, phone]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor durante el registro' });
  }
});

app.get('/api/auth/search-astronaut', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);

  try {
    const result = await pool.query(
      "SELECT id, astronaut_number, phone_number FROM artemis_users WHERE astronaut_number LIKE $1 OR phone_number LIKE $1 LIMIT 5",
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

app.listen(PORT, () => {
  console.log(`Servidor Artemis II corriendo en http://localhost:${PORT}`);
});
