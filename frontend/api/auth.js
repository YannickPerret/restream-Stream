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
}