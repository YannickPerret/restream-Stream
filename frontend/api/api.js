import {useAuthStore} from "../stores/useAuthStore.js";

export default class Api {
  static baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  static getHeaders(options = undefined) {
    const _token = useAuthStore.getState().token

    let headers = {
      "Authorization": _token ? `Bearer ${_token.token}` : ''
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

