export const metadata = {
  title: 'Kişisel Verilerin Korunması Kanunu | iyi event',
  description: 'iyi event aydınlatma metni ve KVKK kapsamında bilgilendirme.',
}

export default function KVKKPage() {
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
        }}>Kişisel Verilerin Korunması Kanunu Aydınlatma Metni</h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--color-slate-medium)', marginBottom: '3rem' }}>
          Son Güncelleme: 28 Temmuz 2026
        </p>

        <div style={style}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, marginTop: '2.5rem', marginBottom: '1rem' }}>
            1. Veri Sorumlusu
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, veri sorumlusu olarak:<br />
            <strong>İyi Event Organizasyon Hizmetleri</strong><br />
            Adres: İstanbul, Türkiye<br />
            E-posta: bilgi@iyievent.com<br />
            Telefon: 0212 993 99 39
          </p>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, marginTop: '2.5rem', marginBottom: '1rem' }}>
            2. Kişisel Verilerin İşlenme Amaçı
          </h2>
          <p style={{ marginBottom: '0.5rem' }}>
            Kişisel verileriniz, aşağıdaki amaçlarla işlenmektedir:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Müşteri kaydı ve kimlik doğrulama</li>
            <li>Etkinlik organizasyonu hizmetlerinin planlanması ve yürütülmesi</li>
            <li>Sözleşme yapılması ve ifa edilmesi</li>
            <li>Ödeme işlemlerinin yürütülmesi</li>
            <li>Müşteri iletişimi (e-posta, SMS, telefon)</li>
            <li>Davetiye gönderimi ve misafir yönetimi</li>
            <li>Fatura ve muhasebe işlemlerinin yürütülmesi</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            <li>Müşteri memnuniyeti ve şikayet yönetimi</li>
          </ul>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, marginTop: '2.5rem', marginBottom: '1rem' }}>
            3. İşlenen Kişisel Veriler
          </h2>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, e-posta adresi, telefon numarası</li>
            <li><strong>Finansal Bilgiler:</strong> Ödeme geçmişi, fatura bilgileri (kredi kartı bilgileri saklanmaz)</li>
            <li><strong>Etkinlik Bilgileri:</strong> Etkinlik türü, tarih, mekan, misafir listesi, fotoğraflar</li>
            <li><strong>Hesap Bilgileri:</strong> Kullanıcı adı, şifre (şifrelenerek saklanır),hesap oluşturma tarihi</li>
            <li><strong>İletişim Bilgileri:</strong> Gönderilen e-posta ve SMS kayıtları</li>
          </ul>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, marginTop: '2.5rem', marginBottom: '1rem' }}>
            4. Kişisel Verilerin Aktarılması
          </h2>
          <p style={{ marginBottom: '0.5rem' }}>
            Kişisel verileriniz, aşağıdaki taraflara aktarılabilir:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong>Hizmet Sağlayıcılar:</strong> Supabase (veritabanı), PayTR (ödeme), Netgsm (SMS), Google (e-posta ve kimlik doğrulama)</li>
            <li><strong>Mekan ve Tedarikçiler:</strong> Etkinlik koordinasyonu için gerekli bilgiler</li>
            <li><strong>Yetkili Kamu Kurumları:</strong> Yasal zorunluluk hallerinde</li>
          </ul>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, marginTop: '2.5rem', marginBottom: '1rem' }}>
            5. Kişisel Verilerin Saklanması
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Kişisel verileriniz, işlenme amacının gerektirdiği süre boyunca saklanır. Hesabınız silindiğinde,
            verileriniz 30 gün içinde anonimleştirilir veya silinir. Fatura ve muhasebe verileri yasal saklama
            süresi olan 10 yıl boyunca saklanır.
          </p>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, marginTop: '2.5rem', marginBottom: '1rem' }}>
            6. KVKK Kapsamındaki Haklarınız
          </h2>
          <p style={{ marginBottom: '0.5rem' }}>
            6698 sayılı KVKK'nın 11. maddesi gereği aşağıdaki haklara sahipsiniz:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>Kişisel verileriniz işleniyorsa bunun hakkında bilgi talep etme</li>
            <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
            <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
            <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme</li>
            <li>Düzeltme ve silme işlemlerinin paylaşıldığı üçüncü kişilere bildirilmesini isteme</li>
            <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
            <li>Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
          </ul>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, marginTop: '2.5rem', marginBottom: '1rem' }}>
            7. Haklarınızı Nasıl Kullanabilirsiniz?
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            KVKK kapsamındaki taleplerinizi bilgi@iyievent.com adresine e-posta atarak iletebilirsiniz.
            Talebiniz en geç 30 gün içinde değerlendirilerek yanıtlanacaktır.
          </p>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, marginTop: '2.5rem', marginBottom: '1rem' }}>
            8. Çerez Politikası
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Web sitemiz yalnızca oturum çerezleri kullanmaktadır. Oturum çerezleri, oturumunuzun sürdürülmesi
            ve kimlik doğrulama işlemleri için zorunludur. Reklam veya analitik amaçlı çerez kullanılmamaktadır.
          </p>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, marginTop: '2.5rem', marginBottom: '1rem' }}>
            9. Güvenlik
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Kişisel verilerinizin güvenliği için teknik ve idari tedbirler alınmaktadır. Verileriniz SSL/TLS
            ile şifreli olarak iletilir, veritabanı düzeyinde erişim kontrolü uygulanır ve düzenli güvenlik
            denetimleri yapılır.
          </p>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, marginTop: '2.5rem', marginBottom: '1rem' }}>
            10. Değişiklikler
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Bu aydınlatma metninde yapılacak değişiklikler web sitemizde yayınlanacaktır.
            Önemli değişiklikler size e-posta ile bildirilecektir.
          </p>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, marginTop: '2.5rem', marginBottom: '1rem' }}>
            11. İletişim
          </h2>
          <p>
            KVKK ve kişisel verilerinizle ilgili sorularınız için:<br />
            E-posta: bilgi@iyievent.com<br />
            Telefon: 0212 993 99 39
          </p>
        </div>
      </div>
    </div>
  )
}
