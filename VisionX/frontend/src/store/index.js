import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import complaintsReducer from './slices/complaintsSlice'
import analyticsReducer from './slices/analyticsSlice'
import notificationsReducer from './slices/notificationsSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    complaints: complaintsReducer,
    analytics: analyticsReducer,
    notifications: notificationsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/setCredentials'],
      },
    }),
})
