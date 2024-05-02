import {useSessionStore} from "../stores/useSessionStore";
import Api from "./api";

export default class AuthApi extends Api{

  static async login(credentials){
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!response.ok) throw new Error(response.statusText);
    return await response.json()
  }

  static async logout() {
    const session = useSessionStore.getState().session

    console.log(session.token.type, session.token.token)
    const response = await fetch(`${this.baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": session ? `${session.token.type} ${session.token.token}` : ''
      }
    });
    if (!response.ok) throw new Error(response.statusText);
    return response.ok
  }
}