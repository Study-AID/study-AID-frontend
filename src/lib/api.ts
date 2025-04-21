import { client } from './axios';

export const api = {
  get: <T>(url: string, params?: unknown) =>
    client.get<T>(url, { params }).then((response) => response.data),

  post: <T>(url: string, data?: unknown) =>
    client.post<T>(url, data).then((response) => response.data),

  put: <T>(url: string, data?: unknown) =>
    client.put<T>(url, data).then((response) => response.data),

  delete: <T>(url: string) =>
    client.delete<T>(url).then((response) => response.data),
};
