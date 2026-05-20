import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/services/api'

export const fetchComplaints = createAsyncThunk(
  'complaints/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/complaints/', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const fetchComplaintById = createAsyncThunk(
  'complaints/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/complaints/${id}/`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const submitComplaint = createAsyncThunk(
  'complaints/submit',
  async (data, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'attachments' && Array.isArray(value)) {
          value.forEach(file => formData.append('attachments', file))
        } else if (value !== null && value !== undefined) {
          formData.append(key, value)
        }
      })
      const response = await api.post('/complaints/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const updateComplaint = createAsyncThunk(
  'complaints/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/complaints/${id}/`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data)
    }
  }
)

export const fetchComplaintStats = createAsyncThunk(
  'complaints/stats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/complaints/stats/')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data)
    }
  }
)

const complaintsSlice = createSlice({
  name: 'complaints',
  initialState: {
    list: [],
    current: null,
    stats: null,
    pagination: { count: 0, next: null, previous: null },
    loading: false,
    submitting: false,
    error: null,
    filters: { status: '', priority: '', category: '', search: '' },
  },
  reducers: {
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload } },
    clearCurrent: (state) => { state.current = null },
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplaints.pending, (state) => { state.loading = true })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.results) {
          state.list = action.payload.results
          state.pagination = {
            count: action.payload.count,
            next: action.payload.next,
            previous: action.payload.previous,
          }
        } else {
          state.list = action.payload
        }
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchComplaintById.fulfilled, (state, action) => {
        state.current = action.payload
      })
      .addCase(submitComplaint.pending, (state) => { state.submitting = true })
      .addCase(submitComplaint.fulfilled, (state, action) => {
        state.submitting = false
        state.list.unshift(action.payload)
      })
      .addCase(submitComplaint.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
      })
      .addCase(updateComplaint.fulfilled, (state, action) => {
        const idx = state.list.findIndex(c => c.id === action.payload.id)
        if (idx !== -1) state.list[idx] = action.payload
        if (state.current?.id === action.payload.id) state.current = action.payload
      })
      .addCase(fetchComplaintStats.fulfilled, (state, action) => {
        state.stats = action.payload
      })
  },
})

export const { setFilters, clearCurrent, clearError } = complaintsSlice.actions
export default complaintsSlice.reducer
