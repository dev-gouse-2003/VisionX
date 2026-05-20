import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/services/api'

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/login/', credentials)
    const { access, refresh, user } = response.data
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    return { access, refresh, user }
  } catch (error) {
    return rejectWithValue(error.response?.data || { detail: 'Login failed' })
  }
})

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/register/', data)
    const { tokens, user } = response.data
    localStorage.setItem('access_token', tokens.access)
    localStorage.setItem('refresh_token', tokens.refresh)
    return { access: tokens.access, refresh: tokens.refresh, user }
  } catch (error) {
    return rejectWithValue(error.response?.data || { detail: 'Registration failed' })
  }
})

export const logout = createAsyncThunk('auth/logout', async (_, { getState }) => {
  try {
    const refresh = localStorage.getItem('refresh_token')
    await api.post('/auth/logout/', { refresh })
  } catch (e) {}
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
})

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/auth/profile/')
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data)
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: localStorage.getItem('access_token'),
    isAuthenticated: !!localStorage.getItem('access_token'),
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null },
    setCredentials: (state, action) => {
      state.user = action.payload.user
      state.accessToken = action.payload.access
      state.isAuthenticated = true
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.accessToken = action.payload.access
        state.isAuthenticated = true
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(register.pending, (state) => { state.loading = true; state.error = null })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.accessToken = action.payload.access
        state.isAuthenticated = true
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.accessToken = null
        state.isAuthenticated = false
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload
      })
  },
})

export const { clearError, setCredentials } = authSlice.actions
export default authSlice.reducer
