import axios from 'axios'

export const api = axios.create({
  timeout: 25_000,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
      return Promise.reject(error)
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.reason ||
      error.message ||
      'Ошибка запроса'

    return Promise.reject(new Error(message))
  },
)
