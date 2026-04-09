import Cookies from "js-cookie";

const TOKEN_KEY = "regulayer_token";

export function setToken(token: string) {
    Cookies.set(TOKEN_KEY, token, { expires: 7, secure: window.location.protocol === "https:" });
}

export function getToken() {
    return Cookies.get(TOKEN_KEY);
}

export function removeToken() {
    Cookies.remove(TOKEN_KEY);
}

export function isAuthenticated() {
    return !!getToken();
}
