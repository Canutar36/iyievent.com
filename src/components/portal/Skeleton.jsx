'use client'

export function SkeletonCard() {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid rgba(0,0,0,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ width: '60%', height: '16px', marginBottom: '8px' }} />
          <div className="skeleton" style={{ width: '40%', height: '12px' }} />
        </div>
      </div>
      <div className="skeleton" style={{ width: '100%', height: '12px', marginBottom: '8px' }} />
      <div className="skeleton" style={{ width: '80%', height: '12px', marginBottom: '8px' }} />
      <div className="skeleton" style={{ width: '40%', height: '12px' }} />

      <style>{`
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite;
          border-radius: 4px;
        }
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}

export function SkeletonList({ count = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid rgba(0,0,0,0.05)',
    }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{
          display: 'flex', gap: '1rem', marginBottom: i < rows - 1 ? '1rem' : 0,
          paddingBottom: i < rows - 1 ? '1rem' : 0,
          borderBottom: i < rows - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
        }}>
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="skeleton" style={{
              flex: 1, height: '14px',
              width: j === 0 ? '30%' : j === cols - 1 ? '20%' : '25%',
            }} />
          ))}
        </div>
      ))}

      <style>{`
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite;
          border-radius: 4px;
        }
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
