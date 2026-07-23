'use client'

import { tl } from '@/lib/fiyat'

const ORANGE = '#F05A28'
const GREEN = '#059669'
const RED = '#DC2626'
const INK = 'var(--color-slate)'
const MUTED = 'var(--color-slate-medium)'

export default function RaporlarClient({ data }) {
  const { huni, ciroTur, nakitAkis, pnl } = data
  const toplamCiro = ciroTur.reduce((a, c) => a + c.tutar, 0)
  const toplamGelir = nakitAkis.reduce((a, n) => a + n.gelir, 0)
  const toplamGider = nakitAkis.reduce((a, n) => a + n.gider, 0)
  const toplamKar = pnl.reduce((a, p) => a + p.kar, 0)
  const donusum = huni.length >= 2 && huni[0].sayi ? Math.round((huni[huni.length - 1].sayi / huni[0].sayi) * 100) : 0

  return (
    <div style={{ padding: '2.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: ORANGE, marginBottom: '0.3rem' }}>Raporlama</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400, color: INK, margin: 0 }}>Raporlar & Analitik</h1>
      </div>

      {/* Stat tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <Tile etiket="Toplam Ciro (Teklif)" deger={tl(toplamCiro)} vurgu />
        <Tile etiket="Toplam Gelir" deger={tl(toplamGelir)} renk={GREEN} />
        <Tile etiket="Toplam Gider" deger={tl(toplamGider)} renk={RED} />
        <Tile etiket="Net Kâr" deger={tl(toplamKar)} renk={ORANGE} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.3rem' }} className="rapor-grid">
        {/* Dönüşüm Hunisi */}
        <Panel baslik="Dönüşüm Hunisi" alt={`Lead → Etkinlik dönüşümü: %${donusum}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {huni.map((h, i) => {
              const oran = huni[0].sayi ? (h.sayi / huni[0].sayi) : 0
              const oncekiOran = i > 0 && huni[i - 1].sayi ? Math.round((h.sayi / huni[i - 1].sayi) * 100) : null
              return (
                <div key={h.asama} title={`${h.asama}: ${h.sayi}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', fontWeight: 600, color: INK }}>{h.asama}</span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: MUTED }}>{h.sayi}{oncekiOran != null && <span style={{ color: ORANGE, marginLeft: '0.5rem', fontSize: '0.74rem' }}>%{oncekiOran}</span>}</span>
                  </div>
                  <div style={{ height: '26px', background: 'var(--color-cream)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.max(oran * 100, 4)}%`, background: ORANGE, borderRadius: '4px', transition: 'width 0.4s' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Panel>

        {/* Ciro / Etkinlik Türü */}
        <Panel baslik="Ciro / Etkinlik Türü">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {ciroTur.map(c => {
              const oran = ciroTur[0]?.tutar ? c.tutar / ciroTur[0].tutar : 0
              return (
                <div key={c.tur} title={`${c.tur}: ${tl(c.tutar)}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', fontWeight: 600, color: INK }}>{c.tur}</span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: MUTED }}>{tl(c.tutar)}</span>
                  </div>
                  <div style={{ height: '22px', background: 'var(--color-cream)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.max(oran * 100, 3)}%`, background: ORANGE, borderRadius: '4px' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Panel>

        {/* Aylık Nakit Akış */}
        <Panel baslik="Aylık Nakit Akış" genis>
          <div style={{ display: 'flex', gap: '1.2rem', marginBottom: '1rem' }}>
            <Lejant renk={GREEN} etiket="Gelir" />
            <Lejant renk={RED} etiket="Gider" />
          </div>
          <NakitAkisGrafik veri={nakitAkis} />
        </Panel>

        {/* Etkinlik P&L */}
        <Panel baslik="Etkinlik Kârlılığı" genis>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {pnl.map((p, i) => {
              const maxKar = Math.max(...pnl.map(x => x.kar), 1)
              const marj = p.gelir ? Math.round((p.kar / p.gelir) * 100) : 0
              return (
                <div key={i} title={`Gelir ${tl(p.gelir)} · Gider ${tl(p.gider)}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', fontWeight: 600, color: INK }}>{p.etkinlik}</span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: INK }}>{tl(p.kar)} <span style={{ color: marj >= 50 ? GREEN : ORANGE, fontSize: '0.74rem' }}>%{marj}</span></span>
                  </div>
                  <div style={{ height: '18px', background: 'var(--color-cream)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.max((p.kar / maxKar) * 100, 3)}%`, background: ORANGE, borderRadius: '4px' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Panel>
      </div>

      <style>{`@media (max-width: 900px) { .rapor-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}

function Tile({ etiket, deger, renk, vurgu }) {
  return (
    <div style={{ background: vurgu ? 'var(--color-slate-deep)' : '#fff', border: '1px solid var(--color-cream-dark)', padding: '1.3rem' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: vurgu ? 'rgba(246,243,234,0.6)' : MUTED, marginBottom: '0.5rem' }}>{etiket}</div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 600, color: vurgu ? ORANGE : (renk || INK) }}>{deger}</div>
    </div>
  )
}

function Panel({ baslik, alt, children, genis }) {
  return (
    <div style={{ background: '#fff', border: '1px solid var(--color-cream-dark)', padding: '1.5rem', gridColumn: genis ? '1 / -1' : 'auto' }}>
      <div style={{ marginBottom: '1.2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 500, color: INK, margin: 0 }}>{baslik}</h2>
        {alt && <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: MUTED, margin: '0.2rem 0 0' }}>{alt}</p>}
      </div>
      {children}
    </div>
  )
}

function Lejant({ renk, etiket }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: renk, display: 'inline-block' }} />
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: MUTED }}>{etiket}</span>
    </div>
  )
}

function NakitAkisGrafik({ veri }) {
  const max = Math.max(...veri.flatMap(v => [v.gelir, v.gider]), 1)
  const H = 200
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5rem', height: `${H + 30}px`, overflowX: 'auto', paddingTop: '0.5rem' }}>
      {veri.map(v => (
        <div key={v.ay} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 0 auto', minWidth: '54px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: `${H}px` }}>
            <div title={`Gelir: ${tl(v.gelir)}`} style={{ width: '18px', height: `${(v.gelir / max) * H}px`, background: GREEN, borderRadius: '4px 4px 0 0', minHeight: '2px' }} />
            <div title={`Gider: ${tl(v.gider)}`} style={{ width: '18px', height: `${(v.gider / max) * H}px`, background: RED, borderRadius: '4px 4px 0 0', minHeight: '2px' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, color: MUTED, marginTop: '0.5rem' }}>{v.ay}</div>
        </div>
      ))}
    </div>
  )
}
