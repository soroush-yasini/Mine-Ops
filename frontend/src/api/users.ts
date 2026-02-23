import apiClient from './client'

export interface User {
  id: number
  username: string
  full_name: string
  role: string
  is_active: boolean
  created_at: string
}

export interface UserCreate {
  username: string
  full_name: string
  password: string
  role: string
  is_active?: boolean
}

export interface UserUpdate {
  full_name?: string
  role?: string
  is_active?: boolean
  password?: string
}

export interface PaginatedUsers {
  items: User[]
  total: number
  page: number
  size: number
}

export const getUsers = (params?: Record<string, unknown>) =>
  apiClient.get<PaginatedUsers>('/users', { params }).then(r => r.data)

export const getUser = (id: number) =>
  apiClient.get<User>(`/users/${id}`).then(r => r.data)

export const createUser = (data: UserCreate) =>
  apiClient.post<User>('/users', data).then(r => r.data)

export const updateUser = (id: number, data: UserUpdate) =>
  apiClient.put<User>(`/users/${id}`, data).then(r => r.data)

export const deleteUser = (id: number) =>
  apiClient.delete(`/users/${id}`)
