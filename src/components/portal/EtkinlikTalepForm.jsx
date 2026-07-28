'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { KATEGORILER } from '@/lib/demo-katalog'
import { IL_ILCE } from '@/lib/il-ilce'
import toast from 'react-hot-toast'

const ILLER = Object.keys(IL_ILCE)

export default function EtkinlikTalepForm({ isOpen, onClose }) {
  const [step, setStep] = useState(1)
  const [hizmetler, setHizmetler] = useState([])
  const [ekstralar, setEkstralar] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    kategori: '',
    ozel_talep: '',
    hizmet_id: '',
    il: '',
    ilce: '',
    tahmini_misafir: '',
    tarih: '',
    saat: '',
    ekstralar: [],
    notlar: '',
  })

  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      loadKatalog()
      setStep(1)
      setForm({ kategori: '', ozel_talep: '', hizmet_id: '', il: '', ilce: '', tahmini_misafir: '', tarih: '', saat: '', ekstralar: [], notlar: '' })
    }
  }, [isOpen])

  async function loadKatalog() {
    const [hizmetRes, ekstraRes] = await Promise.all([
      supabase.from('hizmetler').select('*').eq('aktif', true).order('siralama'),
      supabase.from('ekstralar').select('*').eq('aktif', true).order('siralama'),
    ])
    if (hizmetRes.data?.length) setHizmetler(hizmetRes.data)
    if (ekstraRes.data?.length) setEkstralar(ekstraRes.data)
    setLoading(false)
  }

  function toggleEkstra(ekstraId) {
    setForm(prev => ({
      ...prev,
      ekstralar: prev.ekstralar.includes(ekstraId)
        ? prev.ekstralar.filter(id => id !== ekstraId)
        : [...prev.ekstralar, ekstraId],
    }))
  }

  const filteredHizmetler = form.kategori
    ? hizmetler.filter(h => h.kategori === form.kategori)
    : []

  const groupedEkstralar = ekstralar.reduce((acc, e) => {
    const grup = e.grup || 'Genel'
    if (!acc[grup]) acc[grup] = []
    acc[grup].push(e)
    return acc
  }, {})

  const isOzelTalep = form.kategori === '__ozel__' && form.ozel_talep.trim() !== ''

  const canNext = () => {
    switch (step) {
      case 1: return form.kategori !== ''
      case 2: return form.hizmet_id !== '' || isOzelTalep
      case 3: return form.il !== ''
      case 4: return true
      case 5: return true
      default: return true
    }
  }

  function handleNext() {
    if (!canNext()) return
    if (step === 1 && isOzelTalep) {
      setStep(3)
    } else {
      setStep(step + 1)
    }
  }

  async function handleSubmit() {
    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Oturum bulunamadı')
      setSubmitting(false)
      return
    }

    const secilenHizmet = hizmetler.find(h => h.id === form.hizmet_id)
    const secilenEkstralar = ekstralar.filter(e => form.ekstralar.includes(e.id))

    const notlarParts = []
    if (form.ozel_talep) notlarParts.push(`Özel Talep: ${form.ozel_talep}`)
    if (secilenHizmet) notlarParts.push(`Hizmet: ${secilenHizmet.ad}`)
    if (form.il) notlarParts.push(`İl: ${form.il}${form.ilce ? ' / ' + form.ilce : ''}`)
    if (form.tahmini_misafir) notlarParts.push(`Misafir: ${form.tahmini_misafir}`)
    if (form.tarih) notlarParts.push(`Tarih: ${form.tarih}`)
    if (form.saat) notlarParts.push(`Saat: ${form.saat}`)
    if (secilenEkstralar.length) notlarParts.push(`Ekstralar: ${secilenEkstralar.map(e => e.ad).join(', ')}`)
    if (form.notlar) notlarParts.push(`Ek Notlar: ${form.notlar}`)

    const kategoriLabel = KATEGORILER.find(k => k.key === form.kategori)?.label || form.kategori

    const { error } = await supabase
      .from('etkinlikler')
      .insert({
        musteri_id: user.id,
        ad: form.ozel_talep ? `Özel Talep — ${kategoriLabel}` : `${kategoriLabel} — ${secilenHizmet?.ad || ''}`,
        tur: kategoriLabel,
        tarih: form.tarih || null,
        saat: form.saat || null,
        tahmini_misafir_sayisi: form.tahmini_misafir ? Number(form.tahmini_misafir) : null,
        durum: 'talep',
        notlar: notlarParts.join('\n') || null,
      })

    if (error) {
      toast.error('Talep oluşturulurken hata oluştu')
    } else {
      toast.success('Etkinlik talebiniz alındı!')
      onClose()
      window.location.href = '/musteri/etkinlikler'
    }
    setSubmitting(false)
  }

  if (!isOpen) return null

  const stepTitles = [
    'Etkinlik Türü',
    'Hizmet Seçimi',
    'Etkinlik Detayları',
    'Ekstra Hizmetler',
    'Ek Notlar',
  ]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 5000,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'white', borderRadius: '16px', width: '100%', maxWidth: '560px',
        maxHeight: '90vh', overflow: 'auto', padding: '0',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.2rem 1.5rem', borderBottom: '1px solid rgba(0,0,0,0.06)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--color-slate-deep)', margin: 0 }}>
              Etkinlik Talep Et
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)', margin: '0.2rem 0 0' }}>
              Adım {step} / {stepTitles.length}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '1.1rem', color: 'rgba(0,0,0,0.3)', padding: '0.4rem',
          }}>
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ padding: '0 1.5rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            {stepTitles.map((_, i) => (
              <div key={i} style={{
                flex: 1, height: '3px', borderRadius: '2px',
                background: i < step ? 'var(--color-orange)' : 'rgba(0,0,0,0.08)',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: '0.65rem', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--color-orange)', marginTop: '0.6rem', marginBottom: '0.5rem',
          }}>
            {stepTitles[step - 1]}
          </div>
        </div>

        {/* Step Content */}
        <div style={{ padding: '0.5rem 1.5rem 1.5rem', minHeight: '320px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(0,0,0,0.4)' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem', marginBottom: '0.8rem', display: 'block' }} />
              Yükleniyor...
            </div>
          ) : (
            <>
              {/* Step 1: Etkinlik Türü */}
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {KATEGORILER.map(kat => (
                    <button key={kat.key} type="button"
                      onClick={() => setForm({ ...form, kategori: kat.key, ozel_talep: '' })}
                      style={{
                        padding: '0.9rem 1rem', borderRadius: '10px', textAlign: 'left',
                        background: form.kategori === kat.key ? 'rgba(240,90,40,0.08)' : '#F9FAFB',
                        border: form.kategori === kat.key ? '1.5px solid var(--color-orange)' : '1.5px solid rgba(0,0,0,0.06)',
                        cursor: 'pointer', transition: 'all 0.15s',
                        display: 'flex', alignItems: 'center', gap: '0.8rem',
                      }}
                    >
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '8px',
                        background: form.kategori === kat.key ? 'var(--color-orange)' : 'rgba(0,0,0,0.04)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: form.kategori === kat.key ? 'white' : 'rgba(0,0,0,0.3)',
                        fontSize: '0.85rem', flexShrink: 0,
                      }}>
                        <i className={getCategoryIcon(kat.key)} />
                      </div>
                      <span style={{
                        fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 500,
                        color: form.kategori === kat.key ? 'var(--color-slate-deep)' : 'var(--color-slate)',
                      }}>
                        {kat.label}
                      </span>
                    </button>
                  ))}

                  {/* Özel Talep */}
                  <div style={{
                    marginTop: '0.5rem', padding: '0.9rem 1rem', borderRadius: '10px',
                    background: form.kategori === '__ozel__' ? 'rgba(240,90,40,0.08)' : '#F9FAFB',
                    border: form.kategori === '__ozel__' ? '1.5px solid var(--color-orange)' : '1.5px dashed rgba(0,0,0,0.15)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                    onClick={() => setForm({ ...form, kategori: '__ozel__', ozel_talep: '' })}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '8px',
                        background: form.kategori === '__ozel__' ? 'var(--color-orange)' : 'rgba(0,0,0,0.04)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: form.kategori === '__ozel__' ? 'white' : 'rgba(0,0,0,0.3)',
                        fontSize: '0.85rem', flexShrink: 0,
                      }}>
                        <i className="fas fa-pen" />
                      </div>
                      <span style={{
                        fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 500,
                        color: form.kategori === '__ozel__' ? 'var(--color-slate-deep)' : 'var(--color-slate)',
                      }}>
                        İstediğim etkinlik listede yok
                      </span>
                    </div>
                    {form.kategori === '__ozel__' && (
                      <textarea
                        value={form.ozel_talep}
                        onChange={e => setForm({ ...form, ozel_talep: e.target.value })}
                        placeholder="Hayalinizdeki etkinliği detaylıca açıklayın..."
                        rows={4}
                        onClick={e => e.stopPropagation()}
                        style={{
                          width: '100%', marginTop: '0.8rem', padding: '0.7rem',
                          borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)',
                          fontFamily: 'var(--font-sans)', fontSize: '0.85rem',
                          resize: 'vertical', boxSizing: 'border-box',
                        }}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Hizmet Seçimi */}
              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {filteredHizmetler.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(0,0,0,0.4)' }}>
                      Bu kategoride hizmet bulunamadı
                    </div>
                  ) : (
                    filteredHizmetler.map(hizmet => (
                      <button key={hizmet.id} type="button"
                        onClick={() => setForm({ ...form, hizmet_id: hizmet.id })}
                        style={{
                          padding: '0.8rem 1rem', borderRadius: '10px', textAlign: 'left',
                          background: form.hizmet_id === hizmet.id ? 'rgba(240,90,40,0.08)' : '#F9FAFB',
                          border: form.hizmet_id === hizmet.id ? '1.5px solid var(--color-orange)' : '1.5px solid rgba(0,0,0,0.06)',
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-slate-deep)' }}>
                            {hizmet.ad}
                          </span>
                          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--color-orange)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {hizmet.fiyatlandirma_tipi === 'sabit'
                              ? `${Number(hizmet.birim_fiyat).toLocaleString('tr-TR')}'den başlayan`
                              : hizmet.fiyatlandirma_tipi === 'kisi_basi'
                                ? `Kişi başı ${Number(hizmet.birim_fiyat).toLocaleString('tr-TR')}'den başlayan`
                                : 'Kademeli fiyat'}
                          </span>
                        </div>
                        {hizmet.aciklama && (
                          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)', margin: '0.3rem 0 0' }}>
                            {hizmet.aciklama}
                          </p>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* Step 3: Detaylar */}
              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                    <div>
                      <label style={labelStyle}>İl *</label>
                      <select value={form.il} onChange={e => setForm({ ...form, il: e.target.value, ilce: '' })} style={inputStyle}>
                        <option value="">İl seçin</option>
                        {ILLER.map(il => <option key={il} value={il}>{il}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>İlçe</label>
                      <select
                        value={form.ilce}
                        onChange={e => setForm({ ...form, ilce: e.target.value })}
                        style={{ ...inputStyle, opacity: form.il ? 1 : 0.5 }}
                        disabled={!form.il}
                      >
                        <option value="">{form.il ? 'İlçe seçin' : 'Önce il seçin'}</option>
                        {form.il && IL_ILCE[form.il]?.map(ilce => (
                          <option key={ilce} value={ilce}>{ilce}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Özel Tarih Seçici */}
                  <div>
                    <label style={labelStyle}>Tahmini Tarih</label>
                    <CustomDatePicker value={form.tarih} onChange={v => setForm({ ...form, tarih: v })} />
                  </div>

                  {/* Özel Saat Seçici */}
                  <div>
                    <label style={labelStyle}>Saat</label>
                    <CustomTimePicker value={form.saat} onChange={v => setForm({ ...form, saat: v })} />
                  </div>

                  <div>
                    <label style={labelStyle}>Tahmini Misafir Sayısı</label>
                    <input type="number" value={form.tahmini_misafir} onChange={e => setForm({ ...form, tahmini_misafir: e.target.value })}
                      placeholder="Örn: 100" min="0" style={inputStyle} />
                  </div>
                </div>
              )}

              {/* Step 4: Ekstralar */}
              {step === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {Object.entries(groupedEkstralar).map(([grup, grupEkstralari]) => (
                    <div key={grup}>
                      <div style={{
                        fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700,
                        letterSpacing: '0.1em', textTransform: 'uppercase',
                        color: 'rgba(0,0,0,0.35)', marginBottom: '0.4rem',
                      }}>
                        {grup}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
                        {grupEkstralari.map(ekstra => (
                          <button key={ekstra.id} type="button"
                            onClick={() => toggleEkstra(ekstra.id)}
                            style={{
                              padding: '0.55rem 0.7rem', borderRadius: '8px', textAlign: 'left',
                              background: form.ekstralar.includes(ekstra.id) ? 'rgba(240,90,40,0.08)' : '#F9FAFB',
                              border: form.ekstralar.includes(ekstra.id) ? '1.5px solid var(--color-orange)' : '1.5px solid rgba(0,0,0,0.06)',
                              cursor: 'pointer', transition: 'all 0.15s',
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            }}
                          >
                            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--color-slate)' }}>
                              {ekstra.ad}
                            </span>
                            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', color: 'var(--color-orange)', fontWeight: 500 }}>
                              {Number(ekstra.birim_fiyat).toLocaleString('tr-TR')} ₺
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 5: Ek Notlar */}
              {step === 5 && (
                <div>
                  <label style={labelStyle}>Ek Notlar / Özel İstekler</label>
                  <textarea
                    value={form.notlar}
                    onChange={e => setForm({ ...form, notlar: e.target.value })}
                    rows={8}
                    placeholder="Hayalinizdeki etkinlikle ilgili özel isteklerinizi, konsept detaylarını veya merak ettiklerinizi buraya yazabilirsiniz..."
                    style={{
                      width: '100%', padding: '0.8rem', borderRadius: '10px',
                      border: '1px solid rgba(0,0,0,0.1)', fontFamily: 'var(--font-sans)',
                      fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box',
                      lineHeight: 1.6, minHeight: '180px',
                    }}
                  />
                  <p style={{
                    fontFamily: 'var(--font-sans)', fontSize: '0.72rem',
                    color: 'rgba(0,0,0,0.35)', marginTop: '0.5rem',
                  }}>
                    Ekibimiz talebinizi inceleyerek sizinle en kısa sürede iletişime geçecektir.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem', borderTop: '1px solid rgba(0,0,0,0.06)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.8rem',
        }}>
          {step > 1 ? (
            <button type="button" onClick={() => setStep(step - 1)} style={{
              padding: '0.6rem 1.2rem', borderRadius: '8px',
              background: 'transparent', border: '1px solid rgba(0,0,0,0.1)',
              cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.8rem',
              color: 'var(--color-slate)',
            }}>
              <i className="fas fa-arrow-left" style={{ marginRight: '0.4rem', fontSize: '0.7rem' }} />
              Geri
            </button>
          ) : <div />}

          {step < 5 ? (
            <button type="button" onClick={handleNext}
              disabled={!canNext()} style={{
                padding: '0.6rem 1.5rem', borderRadius: '8px',
                background: canNext() ? 'var(--color-orange)' : 'rgba(0,0,0,0.1)',
                color: canNext() ? 'white' : 'rgba(0,0,0,0.3)',
                border: 'none', cursor: canNext() ? 'pointer' : 'not-allowed',
                fontFamily: 'var(--font-sans)', fontSize: '0.8rem', fontWeight: 600,
              }}>
              Sıradaki
              <i className="fas fa-arrow-right" style={{ marginLeft: '0.4rem', fontSize: '0.7rem' }} />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={submitting} style={{
              padding: '0.6rem 1.5rem', borderRadius: '8px',
              background: submitting ? 'rgba(0,0,0,0.1)' : 'var(--color-orange)',
              color: submitting ? 'rgba(0,0,0,0.3)' : 'white',
              border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-sans)', fontSize: '0.8rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}>
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin" /> Gönderiliyor...
                </>
              ) : (
                <>
                  Talebi Gönder <i className="fas fa-check" style={{ fontSize: '0.7rem' }} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function getCategoryIcon(key) {
  const icons = {
    kurumsal: 'fas fa-building',
    bireysel: 'fas fa-heart',
    tematik: 'fas fa-sun',
    cocuk: 'fas fa-birthday-cake',
    dini: 'fas fa-mosque',
  }
  return icons[key] || 'fas fa-calendar'
}

const labelStyle = {
  display: 'block', fontFamily: 'var(--font-display)', fontSize: '0.65rem', fontWeight: 700,
  letterSpacing: '0.1em', textTransform: 'uppercase',
  color: 'var(--color-slate-medium)', marginBottom: '0.35rem',
}

const inputStyle = {
  width: '100%', padding: '0.55rem 0.7rem', borderRadius: '8px',
  border: '1px solid rgba(0,0,0,0.1)', fontSize: '0.85rem',
  fontFamily: 'var(--font-sans)', boxSizing: 'border-box',
}

const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
const GUNLER = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

function CustomDatePicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const today = new Date()
  const [viewDate, setViewDate] = useState(value ? new Date(value + 'T00:00:00') : new Date(today.getFullYear(), today.getMonth(), 1))

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startDay = firstDay === 0 ? 6 : firstDay - 1

  const days = []
  for (let i = 0; i < startDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const selectedDate = value ? new Date(value + 'T00:00:00') : null
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  function selectDate(day) {
    if (!day) return
    const d = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    onChange(d)
    setOpen(false)
  }

  const displayValue = value
    ? `${selectedDate.getDate()} ${AYLAR[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
    : ''

  return (
    <div style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(!open)} style={{
        ...inputStyle, textAlign: 'left', cursor: 'pointer', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
        background: value ? '#fff' : '#F9FAFB',
      }}>
        <span style={{ color: value ? 'var(--color-slate-deep)' : 'rgba(0,0,0,0.35)' }}>
          {displayValue || 'Tarih seçin'}
        </span>
        <i className="fas fa-calendar-alt" style={{ color: 'var(--color-orange)', fontSize: '0.85rem' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 1000,
          background: 'white', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          padding: '1rem', width: '100%', minWidth: '280px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem 0.5rem', fontSize: '0.85rem', color: 'var(--color-slate)' }}>
              <i className="fas fa-chevron-left" />
            </button>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-slate-deep)' }}>
              {AYLAR[month]} {year}
            </span>
            <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem 0.5rem', fontSize: '0.85rem', color: 'var(--color-slate)' }}>
              <i className="fas fa-chevron-right" />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center', marginBottom: '0.4rem' }}>
            {GUNLER.map(g => (
              <div key={g} style={{ fontFamily: 'var(--font-display)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.05em', color: 'rgba(0,0,0,0.35)', padding: '0.3rem 0' }}>
                {g}
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {days.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const isPast = dateStr < todayStr
              const isSelected = value === dateStr
              const isToday = dateStr === todayStr
              return (
                <button key={i} type="button" onClick={() => !isPast && selectDate(day)}
                  style={{
                    padding: '0.45rem', borderRadius: '8px', border: 'none', cursor: isPast ? 'not-allowed' : 'pointer',
                    background: isSelected ? 'var(--color-orange)' : isToday ? 'rgba(240,90,40,0.08)' : 'transparent',
                    color: isSelected ? 'white' : isPast ? 'rgba(0,0,0,0.2)' : 'var(--color-slate-deep)',
                    fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: isSelected || isToday ? 600 : 400,
                    transition: 'all 0.15s',
                  }}>
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function CustomTimePicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [hour, setHour] = useState(value ? value.split(':')[0] : '')
  const [minute, setMinute] = useState(value ? value.split(':')[1] : '')

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
  const minutes = ['00', '15', '30', '45']

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':')
      setHour(h)
      setMinute(m)
    }
  }, [value])

  function selectTime(h, m) {
    setHour(h)
    setMinute(m)
    onChange(`${h}:${m}`)
    setOpen(false)
  }

  const displayValue = value ? `${hour}:${minute}` : ''

  return (
    <div style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(!open)} style={{
        ...inputStyle, textAlign: 'left', cursor: 'pointer', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
        background: value ? '#fff' : '#F9FAFB',
      }}>
        <span style={{ color: value ? 'var(--color-slate-deep)' : 'rgba(0,0,0,0.35)' }}>
          {displayValue || 'Saat seçin'}
        </span>
        <i className="fas fa-clock" style={{ color: 'var(--color-orange)', fontSize: '0.85rem' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 1000,
          background: 'white', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          padding: '1rem', width: '100%', minWidth: '240px',
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)', marginBottom: '0.6rem' }}>
            Saat Seçin
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            {/* Saat */}
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.05em', color: 'rgba(0,0,0,0.35)', marginBottom: '0.3rem', textAlign: 'center' }}>
                SAAT
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '3px', maxHeight: '180px', overflowY: 'auto' }}>
                {hours.map(h => (
                  <button key={h} type="button" onClick={() => { setHour(h); if (minute) selectTime(h, minute) }}
                    style={{
                      padding: '0.35rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
                      background: hour === h ? 'var(--color-orange)' : '#F9FAFB',
                      color: hour === h ? 'white' : 'var(--color-slate-deep)',
                      fontFamily: 'var(--font-sans)', fontSize: '0.7rem', fontWeight: hour === h ? 600 : 400,
                      transition: 'all 0.15s',
                    }}>
                    {h}
                  </button>
                ))}
              </div>
            </div>
            {/* Dakika */}
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.05em', color: 'rgba(0,0,0,0.35)', marginBottom: '0.3rem', textAlign: 'center' }}>
                DAKİKA
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '3px' }}>
                {minutes.map(m => (
                  <button key={m} type="button" onClick={() => { setMinute(m); if (hour) selectTime(hour, m) }}
                    style={{
                      padding: '0.35rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
                      background: minute === m ? 'var(--color-orange)' : '#F9FAFB',
                      color: minute === m ? 'white' : 'var(--color-slate-deep)',
                      fontFamily: 'var(--font-sans)', fontSize: '0.7rem', fontWeight: minute === m ? 600 : 400,
                      transition: 'all 0.15s',
                    }}>
                    :{m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
