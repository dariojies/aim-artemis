import { useAuth } from '../core/AuthContext';
import { RocketProgress } from '../components/visuals/RocketProgress';
import { LunarBaseLights } from '../components/visuals/LunarBaseLights';
import { RankingSidebar } from '../components/RankingSidebar';
import { artemisApi } from '../services/api';
import { Star, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

export function UserProfile() {
  const { userId } = useAuth();
  
  // Datos mockeados y dinámicos para la vista
  const [energySeconds, setEnergySeconds] = useState(0); 
  const [totalKm, setTotalKm] = useState(0);
  
  const globalStats = {
    totalKm: totalKm,
    goalKm: 384400,  // Distancia real a la Luna
    goalEnergia: 10000 // Capacidad máxima de la batería en segundos
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const status = await artemisApi.getGlobalStatus();
        setTotalKm(Number(status.total_km) || 0);
        setEnergySeconds(Number(status.total_energia) || 0);
      } catch (e) {
        console.error("Error fetching global status");
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000); // Actualizar cada 5s
    return () => clearInterval(interval);
  }, []);

  // Formateador Helper (Segundos a HH:MM:SS)
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-main">
        {/* Tarjeta de Progreso Personal */}
      <section style={{
        backgroundColor: 'var(--space-light)',
        padding: '16px',
        borderRadius: 'var(--radius-card)',
        border: 'var(--border-width-cartoon) solid var(--cartoon-outline)',
        boxShadow: '4px 6px 0px var(--cartoon-outline)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <h2 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--cartoon-white)' }}>
          Astronauta #{userId}
        </h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', backgroundColor: '#005C8A', borderRadius: '50%', border: '2px solid black' }}>
              <Star fill="white" size={24} />
            </div>
            <p style={{ fontWeight: 'bold', margin:0, fontSize: '1.1rem' }}>12 km</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', backgroundColor: '#1F6A40', borderRadius: '50%', border: '2px solid black' }}>
              <Zap fill="white" size={24} />
            </div>
            <p style={{ fontWeight: 'bold', margin:0, fontSize: '1.1rem' }}>150 ⚡</p>
          </div>
        </div>
      </section>

      <h1 style={{ fontSize: '2rem', textAlign: 'center', margin: '8px 0', color: 'var(--artemis-orange)' }}>
        Misión Global Artemis II
      </h1>

      {/* Grid de gamificación comunitaria */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        
        {/* Rumbo Lunar */}
        <div style={{
          backgroundColor: '#0a0a0a',
          padding: '16px',
          borderRadius: 'var(--radius-card)',
          border: 'var(--border-width-cartoon) solid var(--cartoon-outline)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', color: '#00a8ff' }}>Progreso de Vuelo</h3>
          <p style={{ marginBottom: '16px', marginTop: 0, fontWeight: 'bold' }}>{globalStats.totalKm.toLocaleString()} / {globalStats.goalKm.toLocaleString()} km</p>
          <RocketProgress currentVal={globalStats.totalKm} maxVal={globalStats.goalKm} />
        </div>

        {/* Base Lunar */}
        <div style={{
          backgroundColor: '#0a0a0a',
          padding: '16px',
          borderRadius: 'var(--radius-card)',
          border: 'var(--border-width-cartoon) solid var(--cartoon-outline)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', color: '#ffd500' }}>Energía de la Base</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {energySeconds.toLocaleString()} J
            </p>
            <p style={{ margin:0, fontWeight: 'bold', fontSize: '1.1rem', color: energySeconds <= 0 ? 'red' : '#cccccc' }}>
              Tiempo vital: {formatTime(energySeconds)}
            </p>
          </div>

          <LunarBaseLights currentVal={energySeconds} />
        </div>

      </div>
      </div>
      
      <div className="dashboard-sidebar">
        <RankingSidebar />
      </div>
    </div>
  );
}
