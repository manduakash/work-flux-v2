export const setCookie = (name: string, value: any, days = 1) => {
  if (typeof window === "undefined") return;

  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const encoded = btoa(JSON.stringify(value));

  document.cookie = `${name}=${encoded}; expires=${expires}; path=/`;
};

export const getCookie = (name: string) => {
  if (typeof window === "undefined") return null;

  const match = document.cookie.match(
    new RegExp("(^| )" + name + "=([^;]+)")
  );

  if (!match) return null;

  try {
    return JSON.parse(atob(match[2]));
  } catch {
    return null;
  }
};

export const deleteCookie = (name: string) => {
  document.cookie = `${name}=; Max-Age=0; path=/`;
};

export const deleteAllCookies = () => {
  if (typeof window === "undefined") return;

  const domains = [
    window.location.hostname,
    "." + window.location.hostname,
  ];

  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0].trim();

    domains.forEach((domain) => {
      document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}`;
    });
  });
};
