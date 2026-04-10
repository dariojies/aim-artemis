import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Tabla de Usuarios Artemis (Puente)
    await client.query(`
      CREATE TABLE IF NOT EXISTS artemis_users (
        id SERIAL PRIMARY KEY,
        user_id UUID,
        astronaut_number VARCHAR(4) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE,
        full_name VARCHAR(255),
        phone_number VARCHAR(20),
        registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Migración manual: Asegurar que existan las nuevas columnas si la tabla ya existía
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='artemis_users' AND column_name='email') THEN
          ALTER TABLE artemis_users ADD COLUMN email VARCHAR(255) UNIQUE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='artemis_users' AND column_name='full_name') THEN
          ALTER TABLE artemis_users ADD COLUMN full_name VARCHAR(255);
        END IF;
        -- Hacer que phone_number sea opcional si no lo era
        ALTER TABLE artemis_users ALTER COLUMN phone_number DROP NOT NULL;
      END $$;
    `);

    // 2. Módulo 1: Misión Memoria
    await client.query(`
      CREATE TABLE IF NOT EXISTS artemis_mision_memoria (
        id SERIAL PRIMARY KEY,
        artemis_user_id INTEGER NOT NULL REFERENCES artemis_users(id) ON DELETE CASCADE,
        tiempo_exacto INTEGER NOT NULL,
        fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Módulo 2: Base Lunar (Sentadillas)
    await client.query(`
      CREATE TABLE IF NOT EXISTS artemis_base_lunar (
        id SERIAL PRIMARY KEY,
        artemis_user_id INTEGER NOT NULL REFERENCES artemis_users(id) ON DELETE CASCADE,
        sentadillas INTEGER NOT NULL CHECK (sentadillas > 0),
        fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Módulo 3: Rumbo a la Luna (Saltos)
    await client.query(`
      CREATE TABLE IF NOT EXISTS artemis_rumbo_luna (
        id SERIAL PRIMARY KEY,
        artemis_user_id INTEGER NOT NULL REFERENCES artemis_users(id) ON DELETE CASCADE,
        centimetros INTEGER NOT NULL CHECK (centimetros > 0),
        fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Módulo 4: Estado Global
    await client.query(`
      CREATE TABLE IF NOT EXISTS artemis_estado_global (
        id SERIAL PRIMARY KEY,
        total_km BIGINT NOT NULL DEFAULT 0,
        total_energia BIGINT NOT NULL DEFAULT 0,
        ultima_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insertar estado inicial si no existe
    const res = await client.query('SELECT COUNT(*) FROM artemis_estado_global');
    if (parseInt(res.rows[0].count) === 0) {
      await client.query('INSERT INTO artemis_estado_global (total_km, total_energia) VALUES (0, 0)');
    }

    await client.query('COMMIT');
    console.log('Base de datos Artemis II inicializada correctamente.');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Error inicializando base de datos:', e);
    throw e;
  } finally {
    client.release();
  }
}
