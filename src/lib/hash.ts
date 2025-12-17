/**
 * Hash a string using SHA-256
 * @param value - The string to hash
 * @returns Hexadecimal hash string
 */
export async function hashValue(value: string): Promise<string> {
  // Use Web Crypto API (available in all modern browsers)
  const encoder = new TextEncoder()
  const data = encoder.encode(value)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  
  // Convert buffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return hashHex
}

/**
 * Compare a plain text value with a hashed value
 * @param plainText - The plain text value to check
 * @param hashedValue - The stored hash to compare against
 * @returns True if they match, false otherwise
 */
export async function verifyHash(plainText: string, hashedValue: string): Promise<boolean> {
  const hash = await hashValue(plainText)
  return hash === hashedValue
}
