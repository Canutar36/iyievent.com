export const metadata = {
  title: 'Gizlilik Politikası | iyi event',
  description: 'iyi event gizlilik politikası ve kişisel veri işleme metni.',
}

export default function GizlilikPolitikasiPage() {
  const style = {
    fontFamily: 'var(--font-sans)',
    color: 'var(--color-slate)',
    lineHeight: 1.8,
    fontSize: '0.95rem',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-cream)' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '4rem 2rem 6rem' }}>
        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400,
          color: 'var(--color-slate)', marginBottom: '0.5rem',
        }}>Gizlilik Politikası</h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--color-slate-medium)', marginBottom: '3rem' }}>
          Son Güncelleme: 28 Temmuz 2026
        </p>

        <div style={style}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, marginTop: '2.5rem', marginBottom: '1rem' }}>
            1. Veri Sorumlusu
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Bu gizlilik politikası kapsamında veri sorumlusu:<br />
            <strong>İyi Event Organizasyon Hizmetleri</strong><br />
            Adres: İstanbul, Türkiye<br />
            E-posta: bilgi@iyievent.com<br />
            Telefon: 0212 993 99 39
          </p>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, marginTop: '2.5rem', marginBottom: '1rem' }}>
            2. Toplanan Kişisel Veriler
          </h2>
          <p style={{ marginBottom: '0.5rem' }}>Hizmetlerimizi kullanırken aşağıdaki kişisel verileriniz toplanabilir:</p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Ad, soyad, e-posta adresi, telefon numarası</li>
            <li>Ödeme bilgileri (kredi kartı bilgileri saklanmaz, PayTR üzerinden işlenir)</li>
            <li>Etkinlik detayları (tarih, mekan, misafir listesi vb.)</li>
            <li>Yüklenen fotoğraflar ve belgeler</li>
            <li>Google hesabı ile giriş yapılması durumunda Google profil bilgileriniz (ad, e-posta, profil fotoğrafı)</li>
          </ul>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, marginTop: '2.5rem', marginBottom: '1rem' }}>
            3. Verilerin Kullanım Amacı
          </h2>
          <p style={{ marginBottom: '0.5rem' }}>Toplanan veriler aşağıdaki amaçlarla kullanılır:</p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Etkinlik organizasyonu hizmetlerinin sunulması</li>
            <li>Müşteri iletişimi ve destek sağlanması</li>
            <li>Ödeme işlemlerinin yürütülmesi</li>
            <li>Davetiye ve bildirim gönderimi</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            <li>Hizmet kalitesinin artırılması</li>
          </ul>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, marginTop: '2.5rem', marginBottom: '1rem' }}>
            4. Verilerin Saklanması
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Kişisel verileriniz, hizmetin sunulduğu sürece ve yasal saklama süreleri boyunca saklanır.
            Hesabınızı sildiğinizde verileriniz 30 gün içinde anonimleştirilir veya silinir.
          </p>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, marginTop: '2.5rem', marginBottom: '1rem' }}>
            5. Verilerin Paylaşılması
          </h2>
          <p style={{ marginBottom: '0.5rem' }}>Kişisel verileriniz yalnızca aşağıdaki durumlarda paylaşılabilir:</p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Açık rızanızın bulunması</li>
            <li>Yasal bir zorunluluk olması</li>
            <li>Hizmet sağlayıcılarla (Supabase, PayTR, Netgsm vb.) hizmetin sunulması için gerekli ölçüde</li>
            <li>Etkinlik mekanlarıyla lojistik koordinasyon için gerekli bilgiler</li>
          </ul>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, marginTop: '2.5rem', marginBottom: '1rem' }}>
            6. Çerezler ve İzleme Teknolojileri
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Web sitemiz oturum çerezleri kullanır. Oturum çerezleri, giriş işlemlerini ve oturumunuzu sürdürmek için gereklidir.
            Üçüncü taraf reklam çerezi kullanılmamaktadır.
          </p>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, marginTop: '2.5rem', marginBottom: '1rem' }}>
            7. Haklarınız (KVKK)
          </h2>
          <p style={{ marginBottom: '0.5rem' }}>6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aşağıdaki haklara sahipsiniz:</p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Kişisel verilerinizin yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
            <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
            <li>Kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
            <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
            <li>Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
          </ul>
          <p style={{ marginBottom: '1rem' }}>
            Haklarınızı kullanmak için bizimle bilgi@iyievent.com adresinden iletişime geçebilirsiniz.
          </p>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, marginTop: '2.5rem', marginBottom: '1rem' }}>
            8. İletişim
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Bu gizlilik politikası hakkında sorularınız için:<br />
            E-posta: bilgi@iyievent.com<br />
            Telefon: 0212 993 99 39
          </p>
        </div>
      </div>
    </div>
  )
}
