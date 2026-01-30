import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPacientes: 0,
    consultasHoje: 0,
    faturamentoMes: 0,
    taxaCrescimento: 0
  })
  const [agendamentosHoje, setAgendamentosHoje] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      const hoje = new Date().toISOString().split('T')[0]
      const primeiroDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split('T')[0]

      const [pacientes, agendamentos, pagamentos] = await Promise.all([
        supabase.from('pacientes').select('id', { count: 'exact' }),
        supabase
          .from('agendamentos')
          .select('*')
          .eq('data', hoje)
          .order('hora_inicio'),
        supabase
          .from('pagamentos')
          .select('valor')
          .gte('data_pagamento', primeiroDiaMes)
          .eq('status', 'pago')
      ])

      const totalFaturamento = pagamentos.data?.reduce((sum, p) => sum + (p.valor || 0), 0) || 0

      setStats({
        totalPacientes: pacientes.count || 0,
        consultasHoje: agendamentos.data?.length || 0,
        faturamentoMes: totalFaturamento,
        taxaCrescimento: 12.5
      })

      setAgendamentosHoje(agendamentos.data || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const dadosFaturamento = [
    { mes: 'Jan', valor: 15000 },
    { mes: 'Fev', valor: 18000 },
    { mes: 'Mar', valor: 22000 },
    { mes: 'Abr', valor: 19000 },
    { mes: 'Mai', valor: 25000 },
    { mes: 'Jun', valor: 28000 }
  ]

  const dadosProcedimentos = [
    { nome: 'Limpeza', valor: 35 },
    { nome: 'Restauração', valor: 25 },
    { nome: 'Canal', valor: 15 },
    { nome: 'Extração', valor: 12 },
    { nome: 'Outros', valor: 13 }
  ]

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmado':
        return 'bg-green-100 text-green-800'
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmado':
        return <CheckCircle size={16} />
      case 'pendente':
        return <Clock size={16} />
      case 'cancelado':
        return <XCircle size={16} />
      default:
        return <AlertCircle size={16} />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Visão geral da sua clínica</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Pacientes</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalPacientes}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Consultas Hoje</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.consultasHoje}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Faturamento do Mês</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                R$ {stats.faturamentoMes.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Crescimento</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">+{stats.taxaCrescimento}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Faturamento Mensal</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosFaturamento}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip
                formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="valor"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Faturamento"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Procedimentos Realizados</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dadosProcedimentos}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ nome, valor }) => `${nome}: ${valor}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="valor"
              >
                {dadosProcedimentos.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Agendamentos de Hoje</h2>
        </div>
        <div className="p-6">
          {agendamentosHoje.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600">Nenhum agendamento para hoje</p>
            </div>
          ) : (
            <div className="space-y-3">
              {agendamentosHoje.map((agendamento) => (
                <div
                  key={agendamento.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-800">
                        {agendamento.hora_inicio}
                      </p>
                      <p className="text-xs text-gray-500">
                        {agendamento.hora_fim}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{agendamento.paciente_nome}</p>
                      <p className="text-sm text-gray-600">{agendamento.procedimento}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(agendamento.status)}`}>
                    {getStatusIcon(agendamento.status)}
                    <span className="capitalize">{agendamento.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
