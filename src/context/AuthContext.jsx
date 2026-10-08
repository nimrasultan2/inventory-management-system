import { createContext, useContext, useState } from 'react';
import api from '../api/axios';

// Decode a JWT payload without an extra dependency.
// JWT structure: header.payload.signature — each part is base64url-encoded.
function decodeJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1];
    // base64url ? base64: replace URL-safe chars, then pad
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

const STORAGE_KEYS = {
  token: 'token',
  role: 'role',
  userId: 'userId',
  fullName: 'fullName',
};

function loadFromStorage() {
  return {
    token:    localStorage.getItem(STORAGE_KEYS.token)    ?? null,
    role:     localStorage.getItem(STORAGE_KEYS.role)     ?? null,
    userId:   localStorage.getItem(STORAGE_KEYS.userId)   ?? null,
    fullName: localStorage.getItem(STORAGE_KEYS.fullName) ?? null,
  };
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(loadFromStorage);

  async function login(email, password) {
    // Throws on non-2xx so callers can catch and show the error
    const { data } = await api.post('/auth/login', { email, password });
    const { token } = data;

    const payload = decodeJwtPayload(token);
    const userId = String(payload?.userId ?? '');
    const role   = payload?.role ?? '';

    // Store the token first so the interceptor can attach it to the next call
    localStorage.setItem(STORAGE_KEYS.token,  token);
    localStorage.setItem(STORAGE_KEYS.role,   role);
    localStorage.setItem(STORAGE_KEYS.userId, userId);

    // Fetch the real fullName from the DB — the interceptor will attach the
    // freshly stored token automatically
    const { data: me } = await api.get('/users/me');
    const fullName = me.fullName ?? '';

    localStorage.setItem(STORAGE_KEYS.fullName, fullName);

    setAuth({ token, role, userId, fullName });
  }

  function logout() {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    setAuth({ token: null, role: null, userId: null, fullName: null });
  }

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
