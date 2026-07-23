import crypto from 'crypto'

/**
 * PayTR Sanal POS Iframe API entegrasyonu
 * Docs: https://dev.paytr.com/iframe-api
 */

const PAYTR_API_URL = 'https://www.paytr.com/odeme/api/get-token'
const PAYTR_IFRAME_URL = 'https://www.paytr.com/odeme/guvenli'

/**
 * PayTR ödeme token'ı oluştur
 * @param {Object} params
 * @param {string} params.merchantOid - Benzersiz sipariş ID (max 50 karakter)
 * @param {string} params.email - Müşteri e-postası
 * @param {number} params.paymentAmount - Ödeme tutarı (kuruş olarak, ör: 10000 = 100₺)
 * @param {string} params.userIp - Kullanıcı IP'si
 * @param {string} params.userName - Müşteri adı soyadı
 * @param {string} params.userPhone - Müşteri telefonu
 * @param {string} params.userAddress - Müşteri adresi
 * @param {Object[]} params.basketItems - Sepet içeriği
 */
export async function createPayTRToken({
  merchantOid,
  email,
  paymentAmount,
  userIp,
  userName,
  userPhone,
  userAddress = 'İstanbul, Türkiye',
  basketItems = [],
  currency = 'TL',
  testMode = process.env.NODE_ENV !== 'production' ? '1' : '0',
}) {
  const merchantId = process.env.PAYTR_MERCHANT_ID
  const merchantKey = process.env.PAYTR_MERCHANT_KEY
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT
  const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/odeme/basarili`
  const failUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/odeme/basarisiz`

  // Sepeti JSON'a çevir
  const userBasket = Buffer.from(
    JSON.stringify(
      basketItems.length > 0
        ? basketItems
        : [['Etkinlik Hizmeti', (paymentAmount / 100).toFixed(2), 1]]
    )
  ).toString('base64')

  // PayTR hash hesaplama
  const hashStr = `${merchantId}${userIp}${merchantOid}${email}${paymentAmount}${userBasket}${testMode}${currency}`
  const paytrToken = crypto
    .createHmac('sha256', `${merchantKey}${merchantSalt}`)
    .update(hashStr)
    .digest('base64')

  const formData = new URLSearchParams({
    merchant_id: merchantId,
    user_ip: userIp,
    merchant_oid: merchantOid,
    email: email,
    payment_amount: paymentAmount.toString(),
    paytr_token: paytrToken,
    user_basket: userBasket,
    debug_on: '0',
    no_installment: '0',
    max_installment: '0',
    user_name: userName,
    user_address: userAddress,
    user_phone: userPhone,
    merchant_ok_url: successUrl,
    merchant_fail_url: failUrl,
    timeout_limit: '30',
    currency: currency,
    test_mode: testMode,
    lang: 'tr',
  })

  const response = await fetch(PAYTR_API_URL, {
    method: 'POST',
    body: formData,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

  const data = await response.json()

  if (data.status !== 'success') {
    throw new Error(`PayTR Token hatası: ${data.reason}`)
  }

  return {
    token: data.token,
    iframeUrl: `${PAYTR_IFRAME_URL}/${data.token}`,
  }
}

/**
 * PayTR callback doğrulama (webhook)
 * @param {Object} body - PayTR'dan gelen POST body
 */
export function verifyPayTRCallback(body) {
  const merchantKey = process.env.PAYTR_MERCHANT_KEY
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT

  const { merchant_oid, status, total_amount, hash } = body

  const hashStr = `${merchant_oid}${merchantSalt}${status}${total_amount}`
  const expectedHash = crypto
    .createHmac('sha256', `${merchantKey}${merchantSalt}`)
    .update(hashStr)
    .digest('base64')

  return expectedHash === hash
}
