import apiClient from './client'

export async function login(username: string, password: string) {
  const formData = new FormData()
  formData.append('username', username)
  formData.append('password', password)
  const res = await apiClient.post('/auth/login', formData)
  return res.data as { access_token: string; token_type: string; role: string }
}
