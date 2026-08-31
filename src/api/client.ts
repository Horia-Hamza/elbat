import type { ApiResponse } from '../types/api';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

/** Base URL for static images served by the backend */
export const IMAGES_BASE_URL = import.meta.env.VITE_IMAGES_BASE_URL || 'https://api.elbatshop.com';

/**
 * Central fetch wrapper.
 * - Prepends /api to all paths
 * - Unwraps the { success, message, data } envelope
 * - Throws an Error on network failures or success:false responses
 * - Logs every request + response to the console for debugging
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('elbat_token') || localStorage.getItem('accessToken') || localStorage.getItem('token');

  const headers: Record<string, string> = {
    ...(token ? { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  // Only set Content-Type to JSON if body is NOT FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const method = options.method || 'GET';
  const url = `${BASE_URL}${path}`;

  // ── Log the outgoing request ──────────────────────────────────
  const requestGroup = `🌐 [${method}] ${path}`;
  console.groupCollapsed(requestGroup);
  console.log('📤 URL     :', url);
  console.log('📤 Method  :', method);
  console.log('📤 Headers :', headers);
  if (options.body) {
    if (options.body instanceof FormData) {
      const fd: Record<string, string> = {};
      (options.body as FormData).forEach((v, k) => { fd[k] = v instanceof File ? `[File: ${v.name} ${v.size}B]` : String(v); });
      console.log('📤 Body (FormData) :', fd);
    } else {
      try { console.log('📤 Body (JSON) :', JSON.parse(options.body as string)); }
      catch { console.log('📤 Body (raw)  :', options.body); }
    }
  }
  console.groupEnd();

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (networkErr) {
    console.error(`❌ [NETWORK ERROR] ${method} ${url}`, networkErr);
    throw networkErr;
  }

  // ── Handle 401 Unauthorized (Expired / Invalid Token) ──────
  if (res.status === 401) {
    console.warn('🔒 [401 Unauthorized] Token expired or invalid. Clearing all localStorage.');
    localStorage.clear();
    window.dispatchEvent(new Event('storage'));
  }

  // ── Try to parse JSON response ────────────────────────────────
  let rawText = '';
  try {
    rawText = await res.text();
  } catch {
    console.error(`❌ [READ ERROR] ${method} ${url} — status ${res.status}`);
    throw new Error(`[${res.status}] Failed to read response body`);
  }

  // 204 No Content or truly empty body — treat as success
  if (!rawText.trim()) {
    if (res.ok) {
      console.groupCollapsed(`✅ [${res.status}] ${path} (empty body)`);
      console.log('📥 Status  :', res.status, res.statusText);
      console.groupEnd();
      return undefined as unknown as T;
    } else {
      console.error(`❌ [${res.status}] ${path} — empty error body`);
      throw new Error(`HTTP ${res.status}`);
    }
  }

  // ── Try to parse JSON ─────────────────────────────────────────
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    // Non-JSON response (e.g. IIS HTML error page)
    if (!res.ok) {
      // Extract a readable message — for IIS pages, try to pull the status line
      const statusHint =
        res.status === 401 ? 'غير مصرح — يرجى تسجيل الدخول مجدداً'
        : res.status === 403 ? 'ممنوع — ليس لديك صلاحية لهذا الإجراء'
        : res.status === 404 ? 'العنصر غير موجود'
        : res.status === 500 ? 'خطأ في الخادم الداخلي'
        : `HTTP ${res.status}`;
      console.error(`❌ [${res.status}] ${method} ${url} — non-JSON body:`, rawText.substring(0, 300));
      throw new Error(statusHint);
    }
    // Non-JSON but ok (rare) — return raw text
    console.warn(`⚠️ [${res.status}] ${path} — non-JSON ok response`);
    return rawText as unknown as T;
  }

  // Handle bare primitives (true, false, number) — treat as success data
  if (typeof parsed !== 'object' || parsed === null) {
    if (res.ok) {
      console.groupCollapsed(`✅ [${res.status}] ${path} (bare value)`);
      console.log('📥 Status  :', res.status, res.statusText);
      console.log('📥 Value   :', parsed);
      console.groupEnd();
      return parsed as unknown as T;
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  }

  // Standard { success, message, data } envelope
  const json = parsed as ApiResponse<T> & { errors?: unknown };

  // ── Log the response ─────────────────────────────────────────
  const ok = res.ok && json.success;
  const responseGroup = ok
    ? `✅ [${res.status}] ${path}`
    : `❌ [${res.status}] ${path}`;

  console.groupCollapsed(responseGroup);
  console.log('📥 Status  :', res.status, res.statusText);
  console.log('📥 Success :', json.success);
  console.log('📥 Message :', json.message);
  if (json.errors) console.warn('📥 Errors  :', json.errors);
  console.log('📥 Data    :', json.data);
  console.log('📥 Full    :', json);
  console.groupEnd();

  if (!ok) {
    const errMsg = json.message
      || (json.errors ? JSON.stringify(json.errors) : null)
      || `HTTP ${res.status}`;
    throw new Error(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
  }

  return json.data;

}
