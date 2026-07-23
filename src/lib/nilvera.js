/**
 * Nilvera e-Fatura / e-Arşiv entegratör soyutlaması.
 * Docs: https://apidocs.nilvera.com/
 *
 * .env: NILVERA_API_KEY (ve opsiyonel NILVERA_BASE_URL) tanımlı değilse
 * fonksiyonlar STUB modda çalışır — sahte UUID döndürür, gerçek çağrı yapmaz.
 * Bu sayede backend/anahtar hazır olmadan tüm akış test edilebilir.
 */

const BASE_URL = process.env.NILVERA_BASE_URL || 'https://apitest.nilvera.com'

function stubMu() {
  return !process.env.NILVERA_API_KEY
}

function sahteUuid() {
  return 'stub-' + Math.random().toString(36).slice(2, 10) + '-' + Date.now().toString(36)
}

async function nilveraFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${process.env.NILVERA_API_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  if (!res.ok) {
    const metin = await res.text().catch(() => '')
    throw new Error(`Nilvera API ${res.status}: ${metin.slice(0, 200)}`)
  }
  return res.json().catch(() => ({}))
}

/**
 * Fatura kesme/gönderme.
 * @param {object} fatura - { fatura_no, tarih, tur, fatura_tipi('e_fatura'|'e_arsiv'),
 *   cari: { unvan, vergi_no, vergi_dairesi, adres, email }, kalemler: [{ad, adet, birim, birim_fiyat, kdv_orani}],
 *   kdv_haric, kdv, toplam }
 * @returns {Promise<{uuid, durum, faturaNo, pdfUrl?, stub?}>}
 */
export async function eFaturaKes(fatura) {
  if (stubMu()) {
    return {
      uuid: sahteUuid(),
      durum: 'gonderildi',
      faturaNo: fatura.fatura_no || ('IYI' + new Date().getFullYear() + Math.floor(1000 + Math.random() * 9000)),
      stub: true,
    }
  }

  // Gerçek çağrı — Nilvera'nın beklediği UBL/model'e map edilir.
  const payload = {
    InvoiceInfo: {
      InvoiceType: fatura.tur === 'iade' ? 'IADE' : 'SATIS',
      InvoiceProfile: fatura.fatura_tipi === 'e_fatura' ? 'TICARI' : 'EARSIVFATURA',
      IssueDate: fatura.tarih,
    },
    CustomerInfo: {
      TaxNumber: fatura.cari?.vergi_no,
      Name: fatura.cari?.unvan,
      TaxOffice: fatura.cari?.vergi_dairesi,
      Address: fatura.cari?.adres,
      Email: fatura.cari?.email,
    },
    InvoiceLines: (fatura.kalemler || []).map(k => ({
      Name: k.ad,
      Quantity: Number(k.adet) || 1,
      UnitType: k.birim || 'C62',
      Price: Number(k.birim_fiyat) || 0,
      KDVPercent: Number(k.kdv_orani) || 20,
    })),
  }

  const endpoint = fatura.fatura_tipi === 'e_fatura' ? '/einvoice/Send' : '/earchive/Send'
  const data = await nilveraFetch(endpoint, { method: 'POST', body: JSON.stringify(payload) })
  return {
    uuid: data.UUID || data.uuid,
    durum: 'gonderildi',
    faturaNo: data.InvoiceNumber || data.faturaNo || fatura.fatura_no,
    pdfUrl: data.PdfUrl || null,
  }
}

/**
 * Fatura durum sorgulama.
 * @returns {Promise<{durum, stub?}>}
 */
export async function eFaturaDurum(uuid) {
  if (stubMu() || String(uuid).startsWith('stub-')) {
    return { durum: 'onaylandi', stub: true }
  }
  const data = await nilveraFetch(`/einvoice/Status/${uuid}`)
  return { durum: (data.Status || 'gonderildi').toLowerCase() }
}
