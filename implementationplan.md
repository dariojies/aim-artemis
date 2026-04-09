# Fase 4: Sidebar de Rankings (Leaderboards)

El objetivo ahora es inyectar un panel competitivo donde los usuarios puedan ver el desempeño global de sus compañeros para fomentar el uso iterado de las estaciones.

## Proposed Changes

### [MODIFY] `src/pages/UserProfile.tsx`
Modificaré el contenedor principal de esta página. Pasará de ser una columna centrada a una disposición en **dos columnas** (Layout tipo *Dashboard Empresarial*).
- **Izquierda (70%)**: Contendrá la tarjeta personal y la "Misión Global Artemis II" que ya tenemos funcionando y adaptada "Above-the-fold".
- **Derecha (30%)**: Un nuevo componente lateral reservado para la competición.
- *Nota Responsiva*: Fieles al concepto Mobile-First, en pantallas de celular (tablets pequeñas o teléfonos) el Sidebar bajará y se colocará debajo del todo. En laptops se verá al lado derecho sin problema.

### [NEW] `src/components/RankingSidebar.tsx`
Crearé este componente exclusivo para la tabla de posiciones.
- Tendrá un estado interno `activeTab` para cambiar entre 3 listados:
  1. ⚡ **Energía** (Julios aportados - Base Lunar)
  2. 🚀 **Vuelo** (Distancia - Rumbo a la Luna)
  3. ⏱️ **Velocidad** (Tiempo en Segundos - Misión Memoria)
- Inyectaré una Lista "Mock" (falsa temporalmente mientras conectamos PostgreSQL) con 5 Astronautas generados aleatoriamente y resaltando al usuario actual (`#9021`) si se encuentra en el top.
- Aplicará el estilo *Cartoon* con medallas u opacidades para el Top 1, 2 y 3.

## User Review Required

> [!WARNING]
> **Espacio Visual (Layout Crítico)**
> Para que el cohete y la base lunar continúen encajando perfectamente sin necesidad de "Scroll Vertical" como acabamos de lograr, ¿Estás de acuerdo con que la Barra Lateral (Sidebar) sea compacta y ocupe el 30% del ancho de banda derecho? De esta forma, lo que ya tenemos se comprimirá un poco horizontalmente hacia la izquierda sin aplastarse verticalmente.

Si estás de acuerdo con esta arquitectura visual, envíame la confirmación y comienzo a construir el Sidebar y las insignias de Ranking.
