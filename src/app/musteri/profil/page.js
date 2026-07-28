'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase-client'
import toast from 'react-hot-toast'

export default function ProfilPage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '', email: '' })
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' })
  const fileInputRef = useRef(null)

  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile(data)
      setForm({
        full_name: data.full_name || '',
        phone: data.phone || '',
        email: data.email || '',
      })
    }
    setLoading(false)
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Fotoğraf 2MB\'dan küçük olmalı')
      return
    }

    setUploadingAvatar(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${profile.id}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatarlar')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('avatarlar')
        .getPublicUrl(fileName)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', profile.id)

      if (updateError) throw updateError

      setProfile({ ...profile, avatar_url: urlData.publicUrl })
      toast.success('Profil fotoğrafı güncellendi')
    } catch (err) {
      toast.error('Fotoğraf yüklenirken hata oluştu: ' + err.message)
    }
    setUploadingAvatar(false)
  }

  async function handleSaveProfile(e) {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        phone: form.phone,
      })
      .eq('id', profile.id)

    if (error) {
      toast.error('Profil güncellenirken hata oluştu')
    } else {
      toast.success('Profil güncellendi')
      setProfile({ ...profile, ...form })
    }
    setSaving(false)
  }

  async function handleChangePassword(e) {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Şifreler eşleşmiyor')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Şifre en az 6 karakter olmalı')
      return
    }

    setChangingPassword(true)

    const { error } = await supabase.auth.updateUser({
      password: passwordForm.newPassword,
    })

    if (error) {
      toast.error('Şifre güncellenirken hata oluştu')
    } else {
      toast.success('Şifre güncellendi')
      setPasswordForm({ newPassword: '', confirmPassword: '' })
    }
    setChangingPassword(false)
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="skeleton" style={{ width: '200px', height: '32px', marginBottom: '2rem' }} />
        <div className="skeleton" style={{ width: '100%', height: '300px', borderRadius: '12px' }} />
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

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{
        fontFamily: 'var(--font-serif)', fontSize: '1.8rem',
        color: 'var(--color-slate-deep)', marginBottom: '2rem',
      }}>
        Profilim
      </h1>

      {/* Avatar Section */}
      <div style={{
        background: 'white', borderRadius: '12px', padding: '2rem',
        border: '1px solid rgba(0,0,0,0.05)', marginBottom: '1.5rem',
        display: 'flex', alignItems: 'center', gap: '1.5rem',
      }}>
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: profile?.avatar_url ? 'transparent' : 'var(--color-orange-light)',
            border: '2px solid rgba(240,90,40,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', overflow: 'hidden', position: 'relative',
            flexShrink: 0,
          }}
        >
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <i className="fas fa-user" style={{ color: 'var(--color-orange)', fontSize: '1.5rem' }} />
          )}
          {uploadingAvatar && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className="fas fa-spinner fa-spin" style={{ color: 'white' }} />
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          style={{ display: 'none' }}
        />
        <div>
          <div style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.95rem', fontWeight: 600,
            color: 'var(--color-slate-deep)', marginBottom: '0.3rem',
          }}>
            {profile?.full_name || 'Müşteri'}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-sans)', fontSize: '0.8rem',
              color: 'var(--color-orange)', padding: 0,
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}
          >
            <i className="fas fa-camera" style={{ fontSize: '0.75rem' }} />
            {uploadingAvatar ? 'Yükleniyor...' : 'Fotoğraf Değiştir'}
          </button>
        </div>
      </div>

      {/* Profile Form */}
      <div style={{
        background: 'white', borderRadius: '12px', padding: '2rem',
        border: '1px solid rgba(0,0,0,0.05)', marginBottom: '1.5rem',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 600,
          letterSpacing: '0.05em', textTransform: 'uppercase',
          color: 'var(--color-slate)', marginBottom: '1.5rem',
        }}>
          Kişisel Bilgiler
        </h2>

        <form onSubmit={handleSaveProfile}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block', fontFamily: 'var(--font-sans)', fontSize: '0.8rem',
              fontWeight: 500, color: 'var(--color-slate)', marginBottom: '0.4rem',
            }}>
              Ad Soyad
            </label>
            <input
              type="text"
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              style={{
                width: '100%', padding: '0.7rem 1rem', borderRadius: '8px',
                border: '1px solid rgba(0,0,0,0.1)', fontSize: '0.9rem',
                fontFamily: 'var(--font-sans)',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block', fontFamily: 'var(--font-sans)', fontSize: '0.8rem',
              fontWeight: 500, color: 'var(--color-slate)', marginBottom: '0.4rem',
            }}>
              Telefon
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="05XX XXX XX XX"
              style={{
                width: '100%', padding: '0.7rem 1rem', borderRadius: '8px',
                border: '1px solid rgba(0,0,0,0.1)', fontSize: '0.9rem',
                fontFamily: 'var(--font-sans)',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block', fontFamily: 'var(--font-sans)', fontSize: '0.8rem',
              fontWeight: 500, color: 'var(--color-slate)', marginBottom: '0.4rem',
            }}>
              E-posta
            </label>
            <input
              type="email"
              value={form.email}
              disabled
              style={{
                width: '100%', padding: '0.7rem 1rem', borderRadius: '8px',
                border: '1px solid rgba(0,0,0,0.1)', fontSize: '0.9rem',
                fontFamily: 'var(--font-sans)', background: '#f5f5f5',
                color: '#666', cursor: 'not-allowed',
                boxSizing: 'border-box',
              }}
            />
            <span style={{
              fontFamily: 'var(--font-sans)', fontSize: '0.72rem',
              color: 'rgba(0,0,0,0.4)', marginTop: '0.3rem', display: 'block',
            }}>
              E-posta adresi değiştirilemez
            </span>
          </div>

          <button type="submit" disabled={saving} style={{
            width: '100%', padding: '0.8rem', borderRadius: '8px',
            background: 'var(--color-slate-deep)', color: 'var(--color-cream)',
            border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 600,
            letterSpacing: '0.05em', textTransform: 'uppercase',
            opacity: saving ? 0.6 : 1,
          }}>
            {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </form>
      </div>

      {/* Password Form */}
      <div style={{
        background: 'white', borderRadius: '12px', padding: '2rem',
        border: '1px solid rgba(0,0,0,0.05)',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 600,
          letterSpacing: '0.05em', textTransform: 'uppercase',
          color: 'var(--color-slate)', marginBottom: '1.5rem',
        }}>
          Şifre Değiştir
        </h2>

        <form onSubmit={handleChangePassword}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block', fontFamily: 'var(--font-sans)', fontSize: '0.8rem',
              fontWeight: 500, color: 'var(--color-slate)', marginBottom: '0.4rem',
            }}>
              Yeni Şifre
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              minLength={6}
              style={{
                width: '100%', padding: '0.7rem 1rem', borderRadius: '8px',
                border: '1px solid rgba(0,0,0,0.1)', fontSize: '0.9rem',
                fontFamily: 'var(--font-sans)',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block', fontFamily: 'var(--font-sans)', fontSize: '0.8rem',
              fontWeight: 500, color: 'var(--color-slate)', marginBottom: '0.4rem',
            }}>
              Yeni Şifre (Tekrar)
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              minLength={6}
              style={{
                width: '100%', padding: '0.7rem 1rem', borderRadius: '8px',
                border: '1px solid rgba(0,0,0,0.1)', fontSize: '0.9rem',
                fontFamily: 'var(--font-sans)',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button type="submit" disabled={changingPassword} style={{
            width: '100%', padding: '0.8rem', borderRadius: '8px',
            background: 'var(--color-orange)', color: 'white',
            border: 'none', cursor: changingPassword ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 600,
            letterSpacing: '0.05em', textTransform: 'uppercase',
            opacity: changingPassword ? 0.6 : 1,
          }}>
            {changingPassword ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
          </button>
        </form>
      </div>
    </div>
  )
}
