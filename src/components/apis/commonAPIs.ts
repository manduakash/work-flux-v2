import { deleteCookie, getCookie } from "@/utils/cookies";
import { redirect } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function isJsonResponse(response: Response) {
  const contentType = response.headers.get('content-type');
  return contentType && contentType.includes('application/json');
}

function logApiUrl(url: string) {
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.log('[API] Request URL:', url);
  }
}

/**
 * Returns the UserID from the JWT token stored in cookies.
 */
export const getUserIdFromToken = () => {
  if (typeof window === "undefined") return null;
  const token = getCookie("token");
  if (!token) return null;
  try {
    const payloadBase64 = token.split(".")[1];
    const payload = JSON.parse(atob(payloadBase64));
    // Using UserID as seen in user's decoded example
    return payload.UserID || payload.userId || payload.id;
  } catch (error) {
    console.error("JWT Decode Failure:", error);
    return null;
  }
};

export const callAPI = async (url: string, body: any) => {
  const fullUrl = `${BASE_URL}${url}`;
  logApiUrl(fullUrl);
  const response = await fetch(fullUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (isJsonResponse(response)) {
      const errorData = await response.json();
      const message = errorData?.error?.message || errorData?.message || `Error ${response.status}: ${response.statusText}`;
      throw new Error(message);
    }
    let text = await response.text();
    throw new Error(`API Error: ${response.status} ${response.statusText}. Response: ${text.slice(0, 200)}`);
  }

  if (!isJsonResponse(response)) {
    let text = await response.text();
    throw new Error(`API did not return JSON. Response: ${text.slice(0, 200)}`);
  }
  return await response.json();
}

export const callAPIWithToken = async (url: string, body: any) => {
  const fullUrl = `${BASE_URL}${url}`;
  logApiUrl(fullUrl);
  const response = await fetch(fullUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getCookie('token')}` },
    body: JSON.stringify(body),
  });
  if (response.status === 401) {
    deleteCookie("token");
    deleteCookie("user");
    deleteCookie("role");
    deleteCookie("role_id");
    localStorage.clear();
    window.location.href = "/session-expired";
  }
  if (!response.ok) {
    let text = await response.text();
    throw new Error(`API Error: ${response.status} ${response.statusText}. Response: ${text.slice(0, 200)}`);
  }
  if (!isJsonResponse(response)) {
    let text = await response.text();
    throw new Error(`API did not return JSON. Response: ${text.slice(0, 200)}`);
  }
  return await response.json();
}

export const callGetAPIWithToken = async (url: string) => {
  const fullUrl = `${BASE_URL}${url}`;
  logApiUrl(fullUrl);
  const response = await fetch(fullUrl, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getCookie('token')}` },
  });
  if (response.status === 401) {
    deleteCookie("token");
    deleteCookie("user");
    deleteCookie("role");
    deleteCookie("role_id");
    localStorage.clear();
    window.location.href = "/session-expired";
  }
  if (!response.ok) {
    let text = await response.text();
    throw new Error(`API Error: ${response.status} ${response.statusText}. Response: ${text.slice(0, 200)}`);
  }
  if (!isJsonResponse(response)) {
    let text = await response.text();
    throw new Error(`API did not return JSON. Response: ${text.slice(0, 200)}`);
  }
  return await response.json();
}

export const uploadDocumentAPI = async (
  url: string,
  file: File,
  docDetails: any
) => {
  const fullUrl = `${BASE_URL}${url}`;
  logApiUrl(fullUrl);
  const formData = new FormData();
  formData.append('file', file);
  formData.append('docDetials', JSON.stringify(docDetails));

  const response = await fetch(fullUrl, {
    method: 'POST',
    headers: {
      accept: '*/*',
    },
    body: formData,
  });

  if (response.status === 401) {
    deleteCookie("ad_auth");
    throw new Error(`Aadhaar authentication expired. Please verify Aadhaar again.`);
  }

  if (!response.ok) {
    let text = await response.text();
    throw new Error(`Upload failed with status ${response.status}. Response: ${text.slice(0, 200)}`);
  }
  if (!isJsonResponse(response)) {
    let text = await response.text();
    throw new Error(`Upload did not return JSON. Response: ${text.slice(0, 200)}`);
  }
  return await response.json();
};

export const callPutAPIWithToken = async (url: string, body: any) => {
  const fullUrl = `${BASE_URL}${url}`;
  logApiUrl(fullUrl);
  const response = await fetch(fullUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getCookie('token')}` },
    body: JSON.stringify(body),
  });
  if (response.status === 401) {
    deleteCookie("token");
    deleteCookie("user");
    deleteCookie("role");
    deleteCookie("role_id");
    localStorage.clear();
    window.location.href = "/session-expired";
  }
  if (!response.ok) {
    let text = await response.text();
    throw new Error(`API Error: ${response.status} ${response.statusText}. Response: ${text.slice(0, 200)}`);
  }
  if (!isJsonResponse(response)) {
    let text = await response.text();
    throw new Error(`API did not return JSON. Response: ${text.slice(0, 200)}`);
  }
  return await response.json();
}
export const callPatchAPIWithToken = async (url: string, body: any) => {
  const fullUrl = `${BASE_URL}${url}`;
  logApiUrl(fullUrl);
  const response = await fetch(fullUrl, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getCookie('token')}` },
    body: JSON.stringify(body),
  });
  if (response.status === 401) {
    deleteCookie("token");
    deleteCookie("user");
    deleteCookie("role");
    deleteCookie("role_id");
    localStorage.clear();
    window.location.href = "/session-expired";
  }
  if (!response.ok) {
    let text = await response.text();
    throw new Error(`API Error: ${response.status} ${response.statusText}. Response: ${text.slice(0, 200)}`);
  }
  if (!isJsonResponse(response)) {
    let text = await response.text();
    throw new Error(`API did not return JSON. Response: ${text.slice(0, 200)}`);
  }
  return await response.json();
}
