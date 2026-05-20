import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/services/api'

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/notifications/')
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data)
  }
})

export const markAllRead = createAsyncThunk('notifications/markAllRead', async () => {
  await api.post('/notifications/mark_all_read/')
})

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    list: [],
    unreadCount: 0,
    loading: false,
  },
  reducers: {
    addNotification: (state, action) => {
      state.list.unshift(action.payload)
      state.unreadCount += 1
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        const data = action.payload.results || action.payload
        state.list = data
        state.unreadCount = data.filter(n => !n.is_read).length
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.list = state.list.map(n => ({ ...n, is_read: true }))
        state.unreadCount = 0
      })
  },
})

export const { addNotification, setUnreadCount } = notificationsSlice.actions
export default notificationsSlice.reducer
