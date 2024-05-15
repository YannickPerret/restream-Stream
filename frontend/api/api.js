import {useSessionStore} from "../stores/useSessionStore";

export default class Api {
  static baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  static getHeaders(options = undefined) {
    const session = useSessionStore.getState().session;
    let headers = {
      "Authorization": session ? `Bearer ${session.token.token}` : ''
    };

    if (options) {
      headers = { ...headers, ...options };
    } else {
      headers['Content-Type'] = 'application/json';
      headers['Accept'] = 'application/json';
    }

    return headers;
  }
}

