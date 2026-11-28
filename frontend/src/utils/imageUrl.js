const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export function getImageUrl(imagePath) {
  if (!imagePath) return ''

  if (/^(https?:|data:|blob:)/i.test(imagePath)) {
    return imagePath
  }

  const serverOrigin = new URL(apiBaseUrl).origin
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`

  return `${serverOrigin}${normalizedPath}`
}
