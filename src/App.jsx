import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Pacientes from './pages/Pacientes'
import PacienteDetalhes from './pages/PacienteDetalhes'
import Agendamentos from './pages/Agendamentos'
import Prontuarios from './pages/ProntuariosNovo'
import Financeiro from './pages/FinanceiroNovo'
import Atendimento from './pages/Atendimento'
import Usuarios from './pages/Usuarios'
import Configuracoes from './pages/Configuracoes'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
        
        <Route
          path="/*"
          element={
            session ? (
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/pacientes" element={<Pacientes />} />
                  <Route path="/pacientes/:id" element={<PacienteDetalhes />} />
                  <Route path="/agendamentos" element={<Agendamentos />} />
                  <Route path="/prontuarios" element={<Prontuarios />} />
                  <Route path="/atendimento" element={<Atendimento />} />
                  <Route path="/financeiro" element={<Financeiro />} />
                  <Route path="/usuarios" element={<Usuarios />} />
                  <Route path="/configuracoes" element={<Configuracoes />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  )
}

export default App
