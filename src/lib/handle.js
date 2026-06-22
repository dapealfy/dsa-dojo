const KEY = 'algodeck:v1:handle'

export function getHandle() {
  try {
    return localStorage.getItem(KEY) || null
  } catch {
    return null
  }
}

export function setHandle(handle) {
  const clean = handle.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 24)
  if (!clean) throw new Error('Handle must be at least 1 character')
  try {
    localStorage.setItem(KEY, clean)
  } catch (e) {
    console.error('Failed to save handle:', e)
  }
  return clean
}

export function clearHandle() {
  try { localStorage.removeItem(KEY) } catch {}
}