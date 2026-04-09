-- ==========================================
-- PROYECTO ARTEMIS II - SCHEMA DE BASE DE DATOS
-- ==========================================
-- Nota: La tabla 'users' ya existe en el esquema donde `id` es el escaneo numérico del QR.

-- MÓDULO 1: Misión Memoria
CREATE TABLE artemis_mision_memoria (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tiempo_exacto INTEGER NOT NULL, -- Tiempo almacenado en milisegundos para alta precisión
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE artemis_mision_memoria IS 'Registro de tiempos del contrarreloj (teclado)';
COMMENT ON COLUMN artemis_mision_memoria.user_id IS 'ID numérico extraído del código QR del usuario (FK a users)';
COMMENT ON COLUMN artemis_mision_memoria.tiempo_exacto IS 'Milisegundos totales (para el ranking de menor tiempo)';

-- MÓDULO 2: Base Lunar (Sentadillas)
CREATE TABLE artemis_base_lunar (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sentadillas INTEGER NOT NULL CHECK (sentadillas > 0),
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE artemis_base_lunar IS 'Acumulable de energía generada mediante sentadillas';
COMMENT ON COLUMN artemis_base_lunar.user_id IS 'ID numérico extraído del código QR del usuario (FK a users)';
COMMENT ON COLUMN artemis_base_lunar.sentadillas IS 'Cantidad de sentadillas válidas realizadas por sesión';

-- MÓDULO 3: Rumbo a la Luna (Saltos)
CREATE TABLE artemis_rumbo_luna (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    centimetros INTEGER NOT NULL CHECK (centimetros > 0),
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE artemis_rumbo_luna IS 'Registro de avance espacial basado en saltos verticales';
COMMENT ON COLUMN artemis_rumbo_luna.user_id IS 'ID numérico extraído del código QR del usuario (FK a users)';
COMMENT ON COLUMN artemis_rumbo_luna.centimetros IS 'Altura de salto vertical (1 cm = 1 km de avance)';

-- MÓDULO 4: Estado Global (Caché Comunitario)
CREATE TABLE artemis_estado_global (
    id SERIAL PRIMARY KEY,
    total_km BIGINT NOT NULL DEFAULT 0,
    total_energia BIGINT NOT NULL DEFAULT 0,
    ultima_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE artemis_estado_global IS 'Materialized cache para métricas en tiempo real de toda la comunidad';

-- Insertamos el estado inicial en cero
INSERT INTO artemis_estado_global (total_km, total_energia) VALUES (0, 0);
