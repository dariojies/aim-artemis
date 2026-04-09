interface LunarBaseLightsProps {
  currentVal: number;
}

export function LunarBaseLights({ currentVal }: LunarBaseLightsProps) {
  // Sin energía máxima, definimos que cada 1200 Julios (20 Minutos) se enciende una ventana.
  // 7200 Julios (2 horas de energía humana) encienden las 6 ventanas.
  const joulesPerWindow = 1200;
  
  const totalWindows = 6;
  const activeWindows = Math.min(totalWindows, Math.floor(currentVal / joulesPerWindow));

  // Paleta generativa
  const lightOff = '#4a4a4a';
  const lightOn = '#FFD500';

  return (
    <div style={{
      position: 'relative',
      height: '180px',
      width: '100%',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
    }}>
      
      {/* Suelo Lunar Detallado */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        height: '50px',
        width: '100%',
        backgroundColor: '#dcdde1',
        borderRadius: '25px',
        border: '4px solid var(--cartoon-outline)',
        zIndex: 1,
        overflow: 'hidden'
      }}>
         {/* Cráteres decorativos */}
         <div style={{ position: 'absolute', top: '15px', left: '10%', width: '25px', height: '8px', backgroundColor: '#b2bec3', borderRadius: '50%' }} />
         <div style={{ position: 'absolute', top: '5px', left: '30%', width: '15px', height: '5px', backgroundColor: '#b2bec3', borderRadius: '50%' }} />
         <div style={{ position: 'absolute', top: '25px', right: '25%', width: '35px', height: '12px', backgroundColor: '#b2bec3', borderRadius: '50%' }} />
         <div style={{ position: 'absolute', top: '10px', right: '8%', width: '15px', height: '5px', backgroundColor: '#b2bec3', borderRadius: '50%' }} />
      </div>

      {/* Domo Principal de la Base */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        bottom: '25px',
        filter: 'drop-shadow(6px 6px 0px rgba(0,0,0,0.8))'
      }}>
        <svg width="220" height="150" viewBox="0 0 220 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Estructura Izquierda secundaria */}
          <path d="M10 110 C10 80, 50 80, 50 110 Z" fill="#b2bec3" stroke="black" strokeWidth="4" strokeLinejoin="round" />
          
          {/* Tubo conector derecho */}
          <path d="M160 100 L200 100 L200 130 L160 130 Z" fill="#9e9e9e" stroke="black" strokeWidth="4" strokeLinejoin="round" />
          <path d="M160 115 L200 115" stroke="black" strokeWidth="2" strokeDasharray="4 4" />
          
          {/* Domo principal */}
          <path d="M30 130 C30 30, 170 30, 170 130 Z" fill="#ffffff" stroke="black" strokeWidth="5" strokeLinejoin="round" />
          
          {/* Antena Parabólica */}
          <path d="M100 50 L100 10 M80 20 C90 0, 110 0, 120 20" stroke="black" strokeWidth="5" strokeLinecap="round" />
          <circle cx="100" cy="15" r="5" fill="#FF4F00" stroke="black" strokeWidth="2"/>
          
          {/* Ventanas */}
          {[...Array(totalWindows)].map((_, index) => {
            const isLit = index < activeWindows;
            const isTopRow = index < 3;
            const x = 60 + (index % 3) * 40;
            const y = isTopRow ? 80 : 115;
            
            return (
              <circle 
                key={index}
                cx={x} 
                cy={y} 
                r="12" 
                fill={isLit ? lightOn : lightOff} 
                stroke="black" 
                strokeWidth="4" 
                style={{
                  transition: 'fill 1s ease, filter 1s ease',
                  filter: isLit ? 'drop-shadow(0px 0px 10px rgba(255, 213, 0, 0.9))' : 'none'
                }}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
