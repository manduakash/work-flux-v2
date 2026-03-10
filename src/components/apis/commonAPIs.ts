import { deleteCookie, getCookie } from "@/utils/cookies";
import { redirect } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
  const response = await fetch(`${BASE_URL}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = await response?.json();
  return result;
}

export const callAPIWithToken = async (url: string, body: any) => {
  const response = await fetch(`${BASE_URL}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getCookie('token')}` },
    body: JSON.stringify(body),
  });
  const result = await response?.json();
  if (response?.status == 401) {
    deleteCookie("token");
    throw new Error(`Session expired. Please login again.`);
  }
  return result;
}

export const callGetAPIWithToken = async (url: string) => {
  const response = await fetch(`${BASE_URL}${url}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getCookie('token')}` },
  });
  const result = await response?.json();
  if (response?.status == 401) {
    deleteCookie("token");
    throw new Error(`Session expired. Please login again.`);
  }
  return result;
}

export const uploadDocumentAPI = async (
  url: string,
  file: File,
  docDetails: any
) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('docDetials', JSON.stringify(docDetails));

  const response = await fetch(`${BASE_URL}${url}`, {
    method: 'POST',
    headers: {
      accept: '*/*',
    },
    body: formData,
  });

  if (response?.status == 401) {
    deleteCookie("ad_auth");
    throw new Error(`Aadhaar authentication expired. Please verify Aadhaar again.`);
  }

  if (!response?.ok) {
    throw new Error(`Upload failed with status ${response?.status}`);
  }

  return await response?.json();
};

export const callPutAPIWithToken = async (url: string, body: any) => {
  const response = await fetch(`${BASE_URL}${url}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getCookie('token')}` },
    body: JSON.stringify(body),
  });
  const result = await response?.json();
  if (response?.status == 401) {
    deleteCookie("token");
    throw new Error(`Session expired. Please login again.`);
    redirect("/session-expired");
  }
  return result;
}
export const callPatchAPIWithToken = async (url: string, body: any) => {
  const response = await fetch(`${BASE_URL}${url}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getCookie('token')}` },
    body: JSON.stringify(body),
  });
  const result = await response?.json();
  if (response?.status == 401) {
    deleteCookie("token");
    throw new Error(`Session expired. Please login again.`);
  }
  return result;
}
