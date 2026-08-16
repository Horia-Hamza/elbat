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
  const token = localStorage.getItem('elbat_token');

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

  // ── Try to parse JSON response ────────────────────────────────
  let json: ApiResponse<T>;
  let rawText = '';
  try {
    rawText = await res.text();
    json = JSON.parse(rawText);
  } catch {
    console.error(`❌ [PARSE ERROR] ${method} ${url} — status ${res.status}`, rawText);
    throw new Error(`[${res.status}] Response is not valid JSON: ${rawText.substring(0, 200)}`);
  }

  // ── Log the response ─────────────────────────────────────────
  const ok = res.ok && json.success;
  const responseGroup = ok
    ? `✅ [${res.status}] ${path}`
    : `❌ [${res.status}] ${path}`;

  console.groupCollapsed(responseGroup);
  console.log('📥 Status  :', res.status, res.statusText);
  console.log('📥 Success :', json.success);
  console.log('📥 Message :', json.message);
  if ((json as any).errors) console.warn('📥 Errors  :', (json as any).errors);
  console.log('📥 Data    :', json.data);
  console.log('📥 Full    :', json);
  console.groupEnd();

  if (!ok) {
    const errMsg = json.message
      || ((json as any).errors ? JSON.stringify((json as any).errors) : null)
      || `HTTP ${res.status}`;
    throw new Error(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
  }

  return json.data;
}
