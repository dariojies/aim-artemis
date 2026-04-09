import { useState, useEffect } from 'react';
import { useAuth } from '../core/AuthContext';
import { artemisApi } from '../services/api';
import { Zap, Rocket, Timer, Medal } from 'lucide-react';

type TabType = 'energia' | 'vuelo' | 'velocidad';

export function RankingSidebar() {
  const { userId } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('energia');
  const [rankings, setRankings] = useState<any[]>([]);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const data = await artemisApi.getRankings(activeTab);
        setRankings(data);
      } catch (e) {
        console.error("Error fetching rankings");
      }
    };
    fetchRankings();
  }, [activeTab]);

  const currentRankings = rankings;

  return (
    <div style={{
      backgroundColor: 'var(--space-light)',
      padding: '24px 16px',
      borderRadius: 'var(--radius-card)',
      border: 'var(--border-width-cartoon) solid var(--cartoon-outline)',
      boxShadow: '4px 6px 0px var(--cartoon-outline)',
      height: '100%',
      minHeight: '400px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <h2 style={{ textAlign: 'center', color: '#ffb703', margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <Medal size={32} /> Rankings
      </h2>

      {/* Selector de Pestañas */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button 
          onClick={() => setActiveTab('energia')}
          className={`btn-cartoon`}
          style={{ 
            padding: '8px', 
            flex: 1, 
            backgroundColor: activeTab === 'energia' ? 'var(--artemis-orange)' : 'var(--space-medium)',
            transform: activeTab === 'energia' ? 'translateY(4px)' : 'none',
            boxShadow: activeTab === 'energia' ? '0px 2px 0px var(--cartoon-outline)' : '4px 6px 0px var(--cartoon-outline)'
          }}
          title="Energía Total"
        >
          <Zap size={20} />
        </button>
        <button 
          onClick={() => setActiveTab('vuelo')}
          className={`btn-cartoon`}
          style={{ 
            padding: '8px', 
            flex: 1, 
            backgroundColor: activeTab === 'vuelo' ? 'var(--artemis-orange)' : 'var(--space-medium)',
            transform: activeTab === 'vuelo' ? 'translateY(4px)' : 'none',
            boxShadow: activeTab === 'vuelo' ? '0px 2px 0px var(--cartoon-outline)' : '4px 6px 0px var(--cartoon-outline)'
          }}
          title="Vuelo a la Luna"
        >
          <Rocket size={20} />
        </button>
        <button 
          onClick={() => setActiveTab('velocidad')}
          className={`btn-cartoon`}
          style={{ 
            padding: '8px', 
            flex: 1, 
            backgroundColor: activeTab === 'velocidad' ? 'var(--artemis-orange)' : 'var(--space-medium)',
            transform: activeTab === 'velocidad' ? 'translateY(4px)' : 'none',
            boxShadow: activeTab === 'velocidad' ? '0px 2px 0px var(--cartoon-outline)' : '4px 6px 0px var(--cartoon-outline)'
          }}
          title="Misión Memoria"
        >
          <Timer size={20} />
        </button>
      </div>

      {/* Lista de Ranking */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px', overflowY: 'auto' }}>
        {currentRankings.map((r, index) => {
          const isCurrentUser = r.id === userId?.toString() || r.id === '9021'; // Simulación
          const isTop = index < 3;
          let badgeColor = 'var(--space-dark)';
          if (index === 0) badgeColor = '#FFD700'; // Oro
          else if (index === 1) badgeColor = '#C0C0C0'; // Plata
          else if (index === 2) badgeColor = '#CD7F32'; // Bronce

          return (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              backgroundColor: isCurrentUser ? 'var(--space-dark)' : 'rgba(0,0,0,0.2)',
              border: isCurrentUser ? '2px solid var(--artemis-orange)' : '2px solid transparent',
              borderRadius: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '32px', height: '32px', 
                  backgroundColor: badgeColor, 
                  color: isTop ? '#000' : '#fff',
                  borderRadius: '50%',
                  fontWeight: 'bold',
                  border: isTop ? '2px solid #000' : 'none'
                }}>
                  {index + 1}
                </span>
                <span style={{ fontWeight: isCurrentUser ? 'bold' : 'normal', color: isCurrentUser ? 'var(--artemis-orange)' : '#fff' }}>
                  Astro #{r.id} {isCurrentUser && '(Tú)'}
                </span>
              </div>
              <span style={{ fontWeight: 'bold' }}>
                {r.score}
                {activeTab === 'energia' ? ' J' : activeTab === 'vuelo' ? ' km' : ' ms'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
