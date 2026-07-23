import { createServiceClient } from '@/lib/supabase-server'
import { isDevPreview } from '@/lib/config'

/**
 * Audit log kaydı ekler. Server action'lardan çağrılır.
 * Dev önizlemede sessizce geçer. Hata olsa bile ana işlemi bozmaz.
 */
export async function logAktivite({ eylem, ozet, hedefTur, hedefId, personelId, personelAd }) {
  if (isDevPreview()) return
  try {
    const supabase = createServiceClient()
    await supabase.from('aktiviteler').insert({
      personel_id: personelId || null,
      personel_ad: personelAd || null,
      eylem, ozet,
      hedef_tur: hedefTur || null,
      hedef_id: hedefId || null,
    })
  } catch {
    // audit hatası ana işlemi etkilemesin
  }
}
