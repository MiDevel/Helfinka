import { Route, Routes } from 'react-router-dom'

import AppLayout from '@/components/layout/AppLayout'
import DashboardPage from '@/routes/DashboardPage'
import EventsListPage from '@/routes/EventsListPage'
import EventCreatePage from '@/routes/EventCreatePage'
import SummaryPage from '@/routes/SummaryPage'
import AuthLoginPage from '@/routes/AuthLoginPage'

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/events" element={<EventsListPage />} />
        <Route path="/events/new" element={<EventCreatePage />} />
        <Route path="/summary" element={<SummaryPage />} />
        <Route path="/auth/login" element={<AuthLoginPage />} />
      </Routes>
    </AppLayout>
  )
}

export default App
