import CryptoJS from 'crypto-js'

const PASSPHRASE = 'gulzeesh-tee-cart-v1'
const SALT = 'tee-salt'
const SECRET = `${PASSPHRASE}:${SALT}`

export const encryptPayload = async (value: unknown) => {
  const payload = JSON.stringify(value)
  return CryptoJS.AES.encrypt(payload, SECRET).toString()
}

export const decryptPayload = async <T,>(payload: string): Promise<T | null> => {
  try {
    const decrypted = CryptoJS.AES.decrypt(payload, SECRET)
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8)
    if (!decryptedText) return null
    return JSON.parse(decryptedText) as T
  } catch {
    return null
  }
}
