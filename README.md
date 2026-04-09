# 🚀 Artemis II - Plataforma Web Gamificada

**Artemis II** es una Aplicación Web Progresiva (PWA) de alto rendimiento orientada a eventos presenciales. Su objetivo principal es ofrecer a múltiples participantes un ecosistema inmersivo de juegos y recolección de datos físicos bajo una fuerte temática espacial estilo *"Cartoon"*.

---

## 🎨 Arquitectura y Estética
La plataforma persigue un diseño "Mobile-First" altamente responsivo donde la usabilidad táctil es crítica. 
Destaca por una colorida, brillante e iluminada temática espacial usando SVG nativos y animaciones por CSS, evadiendo bibliotecas pesadas de gráficos 3D para asegurar un tiempo de carga instantáneo en móviles de gamas bajas.

### **Stack Tecnológico:**
*   **Frontend:** React 18, Vite, TypeScript Estricto.
*   **Estilado:** Vanilla CSS3 puro + CSS Variables (`global.css`) como *Design Tokens*.
*   **Iconografía:** Paquete dinámico `lucide-react`.
*   **Gestión de Rutas:** React Router (`react-router-dom`).

---

## 👥 Roles de Plataforma 

El acceso a la app se condiciona a través de la simulación teórica de credenciales por QR y define dos arquitecturas completamente separadas:

### 1. Sistema Público (`Usuario Normal`)
Los usuarios logueados se encontrarán con el **Panel Gamificado (`UserProfile.tsx`)**:
- Sus métricas deportivas en vivo.
- **Rumbo a la Luna:** Un cohete vectorial dinámicamente animado mediante interpolación en pixeles donde el viaje de avance en línea recta dura los verdaderos `384,400 KM` espaciales obtenidos globalmente entre todos los participantes.
- **Base Lunar:** Un asentamiento humano hermosamente iluminado con seis luces protectoras. Las luces interactúan reaccionando ante un temporizador que drena una barra invisible de Julios de Vida para simular escasez de energía en tiempo real. 

### 2. Estaciones Base (`Superadmin`)
Los encargados y validadores del equipo se encuentran con un selector robusto de módulos de input manual, optimizando pantallas de tablets u ordenadores en locación:
- **Base Lunar Tracker:** Formulario para ingestar conteos de rutinas físicas (ej. Sentadillas comunitarias).
- **Rendimiento Físico Tracker:** Formulario numérico rápido para inyectar conteos de distancia temporal en CM avanzadas por los usuarios.
- **Misión Memoria:** Panel cooperativo sincrónico.

---

## 🧩 Ecosistema Misión Memoria
Se implementó de cero un innovador ecosistema de Pestañas cruzadas para simular el comportamiento *Socket/Multiplayer* antes de que un backend oficial con base de datos real (Supabase/PostgreSQL) integre WebSockets.

*   **Hook Nativo:** Se estructuró un enrutador interno (`useMemoriaSync.ts`) orquestado bajo el API `BroadcastChannel`. 
*   **Doble Visión Simultánea**: 
    1. **Visualizador**: Controla el inicio del tiempo y dicta sentencias criptográficas (ej: 9-0-4-1-8).
    2. **Receptor**: Panel inmersivo protegido por candado que recibe una señal inalámbrica de encendido que revela un enorme *Numpad* táctil programado desde cero. Valida sin latencias cualquier teclado erróneo del niño que intente adivinar la secuencia que dicta su compañero visualizador.

---

## 🛠️ Instalación y Uso

Dado el uso de `Vite`, el sistema puede inicializarse en un entorno de pruebas sin base de datos real en un abrir y cerrar de ojos, emulando los estados de carga.

Clona este repositorio e ingresa en su directorio:

\`\`\`bash
npm install
\`\`\`

\`\`\`bash
npm run dev
\`\`\`

Abre la URL proporcionada usualmente (ej. `http://localhost:5173/`).
Para testear la magia cooperativa local de Misión Memoria, recomendamos encarecidamente abrir la vista `/menu` en dos ventanas distintas del explorador en escritorio al unísono.

---

*Proyecto en desarrollo continuo por el equió arquitectónico de **Artemis**.*
