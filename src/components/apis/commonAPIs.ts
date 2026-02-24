import { deleteCookie, getCookie } from "@/utils/cookies";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
