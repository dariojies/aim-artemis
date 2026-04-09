import { useState, useEffect } from 'react';
import { Rocket, User } from 'lucide-react';
import { artemisApi } from '../../services/api';
import { useAuth } from '../../core/AuthContext';

export function RumboLunaGame() {
  const { role } = useAuth();
  const [jumpHeight, setJumpHeight] = useState<string>('');
  const [astronautNumber, setAstronautNumber] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Búsqueda de astronautas para admins
  useEffect(() => {
    if (role !== 'superadmin' || astronautNumber.length < 2) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await artemisApi.searchAstronaut(astronautNumber);
        setSearchResults(results);
      } catch (e) {
        console.error("Error buscando astronautas");
      } finally {
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [astronautNumber, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (jumpHeight && parseInt(jumpHeight) > 0 && astronautNumber) {
      try {
        await artemisApi.saveRumboLuna(astronautNumber, parseInt(jumpHeight));
        setIsSubmitted(true);
      } catch (e) {
        alert("Error al guardar marca. Verifica el número de astronauta.");
      }
    } else {
      alert("Por favor completa todos los campos.");
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <Rocket size={56} color="#005C8A" />
      <h2 style={{ fontSize: '2rem', marginTop: '16px' }}>Rumbo a la Luna</h2>
      <p style={{ opacity: 0.8, marginBottom: '32px' }}>
        Ingresa manualmente la altura máxima alcanzada (en centímetros).
      </p>

      {isSubmitted ? (
        <div style={{
          padding: '40px',
          backgroundColor: '#005C8A',
          borderRadius: 'var(--radius-card)',
          color: 'var(--cartoon-white)',
          border: '4px solid var(--cartoon-outline)'
        }}>
          <h3 style={{ fontSize: '3rem', margin: 0 }}>{jumpHeight} cm</h3>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>¡Kilómetros Avanzados!</p>
          <button 
            className="btn-cartoon" 
            style={{ marginTop: '24px', backgroundColor: 'var(--space-dark)' }}
            onClick={() => { setJumpHeight(''); setIsSubmitted(false); }}
          >
            Registrar nuevo salto
          </button>
        </div>
      ) : (
        <form 
          onSubmit={handleSubmit}
          style={{
            padding: '32px',
            border: '4px dashed var(--cartoon-outline)',
            borderRadius: '24px',
            backgroundColor: 'var(--space-medium)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            position: 'relative'
          }}
        >
          {/* Campo de Astronauta */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', position: 'relative' }}>
            <label style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={20} /> Nº de Astronauta (4 cifras):
            </label>
            <input
              type="text"
              maxLength={4}
              value={astronautNumber}
              onChange={(e) => setAstronautNumber(e.target.value)}
              placeholder="Ej: 4356"
              style={{
                fontSize: '1.5rem',
                padding: '12px',
                width: '200px',
                textAlign: 'center',
                borderRadius: '12px',
                border: '4px solid var(--cartoon-outline)',
                backgroundColor: 'var(--cartoon-white)',
                color: 'var(--space-dark)',
                fontWeight: 'bold'
              }}
              required
            />
            {/* Resultados de búsqueda flotantes */}
            {searchResults.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                backgroundColor: 'var(--space-light)',
                border: '2px solid black',
                borderRadius: '8px',
                width: '240px',
                marginTop: '4px'
              }}>
                {searchResults.map(res => (
                  <div 
                    key={res.id} 
                    onClick={() => { setAstronautNumber(res.astronaut_number); setSearchResults([]); }}
                    style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}
                  >
                    🚀 #{res.astronaut_number} - {res.phone_number}
                  </div>
                ))}
              </div>
            )}
            {isSearching && <small style={{ marginTop: '4px' }}>Buscando...</small>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label htmlFor="jumpInput" style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '16px' }}>
              Altura del Salto (cm):
            </label>
            <input
              id="jumpInput"
              type="number"
              min="1"
              value={jumpHeight}
              onChange={(e) => setJumpHeight(e.target.value)}
              placeholder="Ej: 45"
              style={{
                fontSize: '2rem',
                padding: '16px',
                width: '160px',
                textAlign: 'center',
                borderRadius: '16px',
                border: '4px solid var(--cartoon-outline)',
                backgroundColor: 'var(--cartoon-white)',
                color: 'var(--space-dark)',
                fontWeight: 'bold',
                outline: 'none'
              }}
              required
            />
          </div>
          <button type="submit" className="btn-cartoon" style={{ width: '100%', backgroundColor: '#005C8A' }}>
            Confirmar Despegue
          </button>
        </form>
      )}
    </div>
  );
}
