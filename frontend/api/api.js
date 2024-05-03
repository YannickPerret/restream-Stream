'use client'
import {useSessionStore} from "../stores/useSessionStore";

export default class Api {
  static baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  static getHeaders() {
    const session = useSessionStore.getState().session;
    return {
      'Content-Type': "application/json",
      'Accept': "application/json",
      "Authorization": session ? `Bearer ${session.token.token}` : ''
    }
  }
}

