interface RocketProgressProps {
  currentVal: number;
  maxVal: number;
}

export function RocketProgress({ currentVal, maxVal }: RocketProgressProps) {
  // Calculamos el porcentaje general
  const percentage = Math.min(100, Math.max(0, (currentVal / maxVal) * 100));
  
  // Fondeo escalar real para un contenedor de 220px
  // Superficie de la Tierra = 35px desde el fondo.
  // Superficie interior de la Luna = 220px - 48px(luna) - 38px(cohete) = ~134px max bottom
  const minBottom = 35;
  const maxBottom = 134;
  const rocketBottomPosition = minBottom + (percentage / 100) * (maxBottom - minBottom);

  return (
    <div style={{
      position: 'relative',
      height: '220px',
      width: '120px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      {/* Background Track (Cable espacial invisible o estela) */}
      <div style={{
        position: 'absolute',
        top: '24px',
        bottom: '24px',
        width: '4px',
        backgroundColor: 'rgba(255,255,255,0.1)',
        border: 'none',
        borderRight: '2px dashed rgba(255,255,255,0.3)',
        zIndex: 1
      }} />

      {/* Goal: La luna más detallada */}
      <div style={{
        position: 'absolute',
        top: 0,
        zIndex: 2,
        width: '48px',
        height: '48px',
        backgroundColor: '#dcdde1',
        borderRadius: '50%',
        border: '4px solid var(--cartoon-outline)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'inset -8px -8px 0px rgba(0,0,0,0.15)',
        overflow: 'hidden'
      }}>
        {/* Cráteres de la luna Cartoon (escalados) */}
        <div style={{ position: 'absolute', top: '10px', left: '8px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#b2bec3', border: '2px solid rgba(0,0,0,0.1)' }} />
        <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#b2bec3', border: '2px solid rgba(0,0,0,0.1)' }} />
        <div style={{ position: 'absolute', top: '25px', left: '18px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#b2bec3', border: '2px solid rgba(0,0,0,0.1)' }} />
      </div>

      {/* Elemento que sube: El Cohete Mejorado */}
      <div style={{
        position: 'absolute',
        bottom: `${rocketBottomPosition}px`,
        zIndex: 3,
        transition: 'bottom 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        filter: 'drop-shadow(4px 4px 0px rgba(0,0,0,0.9))',
        transform: 'scale(0.6)',
        transformOrigin: 'bottom center'
      }}>
        <svg width="48" height="64" viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Fuego Propulsor con animación de tamaño si quisieramos */}
          <path d="M16 50 C16 75, 32 75, 32 50 Z" fill="#FF4F00" stroke="black" strokeWidth="3" />
          <path d="M20 50 C20 65, 28 65, 28 50 Z" fill="#FFD500" stroke="black" strokeWidth="2" />
          
          {/* Alas laterales */}
          <path d="M6 35 L6 50 L16 45 Z" fill="#00a8ff" stroke="black" strokeWidth="3" strokeLinejoin="round" />
          <path d="M42 35 L42 50 L32 45 Z" fill="#00a8ff" stroke="black" strokeWidth="3" strokeLinejoin="round" />
          
          {/* Cuerpo Central */}
          <path d="M24 2 C10 14, 14 38, 14 48 L34 48 C34 38, 38 14, 24 2 Z" fill="#ffffff" stroke="black" strokeWidth="3" strokeLinejoin="round" />
          <path d="M24 2 C16 14, 20 20, 20 48" stroke="rgba(0,0,0,0.1)" strokeWidth="3" />
          
          {/* Ventanilla */}
          <circle cx="24" cy="22" r="7" fill="#005C8A" stroke="black" strokeWidth="3" />
          <circle cx="22" cy="20" r="2" fill="white" />
        </svg>
      </div>

      {/* Start: Planeta Tierra */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        zIndex: 2,
        width: '90px',
        height: '45px',
        backgroundColor: '#0a3d62', // Azul oscuro oceánico
        borderRadius: '45px 45px 0 0',
        border: '4px solid var(--cartoon-outline)',
        borderBottom: 'none',
        overflow: 'hidden',
        boxShadow: 'inset 8px 8px 0px rgba(0,0,0,0.2)'
      }}>
        {/* Continentes */}
        <div style={{ position: 'absolute', bottom: '-10px', left: '-5px', width: '40px', height: '30px', backgroundColor: '#2d9f45', borderRadius: '50%', border: '3px solid var(--cartoon-outline)' }} />
        <div style={{ position: 'absolute', top: '10px', right: '-10px', width: '50px', height: '40px', backgroundColor: '#2d9f45', borderRadius: '50%', border: '3px solid var(--cartoon-outline)' }} />
        <div style={{ position: 'absolute', top: '30px', left: '30px', width: '20px', height: '15px', backgroundColor: '#2d9f45', borderRadius: '50%', border: '3px solid var(--cartoon-outline)' }} />
      </div>
    </div>
  );
}
