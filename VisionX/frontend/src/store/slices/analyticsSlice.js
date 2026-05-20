import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/services/api'

export const fetchDashboard = createAsyncThunk('analytics/dashboard', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/analytics/dashboard/')
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data)
  }
})

export const fetchMonthlyTrend = createAsyncThunk('analytics/monthlyTrend', async (months = 6, { rejectWithValue }) => {
  try {
    const response = await api.get('/analytics/monthly-trend/', { params: { months } })
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data)
  }
})

export const fetchDepartmentAnalytics = createAsyncThunk('analytics/departments', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/analytics/departments/')
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data)
  }
})

export const fetchHeatmap = createAsyncThunk('analytics/heatmap', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/analytics/heatmap/')
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data)
  }
})

export const fetchOfficerPerformance = createAsyncThunk('analytics/officers', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/analytics/officers/')
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data)
  }
})

export const fetchTransparency = createAsyncThunk('analytics/transparency', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/analytics/transparency/')
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data)
  }
})

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    dashboard: null,
    monthlyTrend: [],
    departments: [],
    heatmap: [],
    officers: [],
    transparency: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => { state.loading = true })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false
        state.dashboard = action.payload
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchMonthlyTrend.fulfilled, (state, action) => {
        state.monthlyTrend = action.payload
      })
      .addCase(fetchDepartmentAnalytics.fulfilled, (state, action) => {
        state.departments = action.payload
      })
      .addCase(fetchHeatmap.fulfilled, (state, action) => {
        state.heatmap = action.payload
      })
      .addCase(fetchOfficerPerformance.fulfilled, (state, action) => {
        state.officers = action.payload
      })
      .addCase(fetchTransparency.fulfilled, (state, action) => {
        state.transparency = action.payload
      })
  },
})

export default analyticsSlice.reducer
