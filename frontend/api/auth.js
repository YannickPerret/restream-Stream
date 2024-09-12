import Api from "./api";

export default class AuthApi extends Api{

  static async login(credentials){
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(credentials)
    });
    if (!response.ok) throw new Error(response.statusText);
    return await response.json()
  }

  static async logout() {
    const response = await fetch(`${this.baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: this.getHeaders()
    });
    if (!response.ok) throw new Error(response.statusText);
    return response.ok
  }

  static async register(credentials){
    const response = await fetch(`${this.baseUrl}/api/auth/register`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(credentials)
    });
    if (!response.ok) throw new Error(response.statusText);
    return await response.json()
  }

  static async verify(token){
    const response = await fetch(`${this.baseUrl}/api/auth/verify-account`, {
      method: "POST",
      headers: this.getHeaders(),
        body: JSON.stringify({token})
    });
    if (!response.ok) throw new Error(response.statusText);
    return await response.json()
  }

  static async refreshToken() {
    const response = await fetch(`${this.baseUrl}/api/auth/refreshToken`, {
      method: "POST",
      headers: this.getHeaders(),
    })
    if (!response.ok) throw new Error(response.statusText);
    return await response.json()
  }

  static async getCurrentUser() {
    const response = await fetch(`${this.baseUrl}/api/auth/current-user`, {
      method: 'GET',
      headers: this.getHeaders(),
    })
    if (!response.ok) throw new Error(response.statusText);
    return await response.json()
  }
}