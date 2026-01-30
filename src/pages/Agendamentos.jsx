import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  X,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

const Agendamentos = () => {
  const [agendamentos, setAgendamentos] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('day')

  const [formData, setFormData] = useState({
    paciente_id: '',
    data: '',
    hora_inicio: '',
    hora_fim: '',
    procedimento: '',
    observacoes: '',
    status: 'pendente'
  })

  useEffect(() => {
    carregarDados()
  }, [currentDate, viewMode])

  const carregarDados = async () => {
    try {
      const startDate = getStartDate()
      const endDate = getEndDate()

      const [agendamentosData, pacientesData] = await Promise.all([
        supabase
          .from('agendamentos')
          .select('*, pacientes(nome)')
          .gte('data', startDate)
          .lte('data', endDate)
          .order('data')
          .order('hora_inicio'),
        supabase.from('pacientes').select('id, nome').order('nome')
      ])

      setAgendamentos(agendamentosData.data || [])
      setPacientes(pacientesData.data || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStartDate = () => {
    if (viewMode === 'day') {
      return currentDate.toISOString().split('T')[0]
    } else if (viewMode === 'week') {
      const start = new Date(currentDate)
      start.setDate(start.getDate() - start.getDay())
      return start.toISOString().split('T')[0]
    } else {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      return start.toISOString().split('T')[0]
    }
  }

  const getEndDate = () => {
    if (viewMode === 'day') {
      return currentDate.toISOString().split('T')[0]
    } else if (viewMode === 'week') {
      const end = new Date(currentDate)
      end.setDate(end.getDate() - end.getDay() + 6)
      return end.toISOString().split('T')[0]
    } else {
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      return end.toISOString().split('T')[0]
    }
  }

  const handlePrevious = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() - 1)
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setMonth(newDate.getMonth() - 1)
    }
    setCurrentDate(newDate)
  }

  const handleNext = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + 1)
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const paciente = pacientes.find((p) => p.id === formData.paciente_id)
      const dataToInsert = {
        ...formData,
        paciente_nome: paciente?.nome
      }

      const { error } = await supabase.from('agendamentos').insert([dataToInsert])

      if (error) throw error

      setShowModal(false)
      resetForm()
      carregarDados()
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error)
      alert('Erro ao salvar agendamento: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return

    try {
      const { error } = await supabase.from('agendamentos').delete().eq('id', id)

      if (error) throw error
      carregarDados()
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error)
      alert('Erro ao excluir agendamento: ' + error.message)
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error
      carregarDados()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert('Erro ao atualizar status: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      paciente_id: '',
      data: '',
      hora_inicio: '',
      hora_fim: '',
      procedimento: '',
      observacoes: '',
      status: 'pendente'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmado':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'concluido':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmado':
        return <CheckCircle size={16} />
      case 'cancelado':
        return <XCircle size={16} />
      default:
        return <AlertCircle size={16} />
    }
  }

  const formatDateDisplay = () => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } else if (viewMode === 'week') {
      const start = new Date(currentDate)
      start.setDate(start.getDate() - start.getDay())
      const end = new Date(start)
      end.setDate(end.getDate() + 6)
      return `${start.toLocaleDateString('pt-BR')} - ${end.toLocaleDateString('pt-BR')}`
    } else {
      return currentDate.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' })
    }
  }

  const horariosDisponiveis = [
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00'
  ]

  const getAgendamentosPorHorario = (horario) => {
    return agendamentos.filter((a) => a.hora_inicio === horario)
  }

  if (loading && agendamentos.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Agendamentos</h1>
          <p className="text-gray-600 mt-1">Gerencie sua agenda</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setFormData({ ...formData, data: currentDate.toISOString().split('T')[0] })
            setShowModal(true)
          }}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Novo Agendamento
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevious}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="text-center min-w-[300px]">
              <h2 className="text-xl font-semibold text-gray-800 capitalize">
                {formatDateDisplay()}
              </h2>
            </div>
            <button
              onClick={handleNext}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={24} />
            </button>
            <button
              onClick={handleToday}
              className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
            >
              Hoje
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'day'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Dia
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'week'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'month'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Mês
            </button>
          </div>
        </div>

        {viewMode === 'day' && (
          <div className="space-y-2">
            {horariosDisponiveis.map((horario) => {
              const agendamentosHorario = getAgendamentosPorHorario(horario)
              return (
                <div key={horario} className="flex gap-4">
                  <div className="w-20 text-sm font-medium text-gray-600 pt-2">{horario}</div>
                  <div className="flex-1">
                    {agendamentosHorario.length === 0 ? (
                      <div className="h-16 border-2 border-dashed border-gray-200 rounded-lg"></div>
                    ) : (
                      <div className="space-y-2">
                        {agendamentosHorario.map((agendamento) => (
                          <div
                            key={agendamento.id}
                            className={`p-3 rounded-lg border-2 ${getStatusColor(
                              agendamento.status
                            )}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <User size={16} />
                                  <span className="font-medium">
                                    {agendamento.pacientes?.nome || agendamento.paciente_nome}
                                  </span>
                                </div>
                                <p className="text-sm">{agendamento.procedimento}</p>
                                <div className="flex items-center gap-2 text-xs mt-1">
                                  <Clock size={14} />
                                  <span>
                                    {agendamento.hora_inicio} - {agendamento.hora_fim}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <select
                                  value={agendamento.status}
                                  onChange={(e) =>
                                    handleStatusChange(agendamento.id, e.target.value)
                                  }
                                  className="text-xs px-2 py-1 border border-gray-300 rounded"
                                >
                                  <option value="pendente">Pendente</option>
                                  <option value="confirmado">Confirmado</option>
                                  <option value="concluido">Concluído</option>
                                  <option value="cancelado">Cancelado</option>
                                </select>
                                <button
                                  onClick={() => handleDelete(agendamento.id)}
                                  className="p-1 hover:bg-red-200 rounded transition-colors"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {(viewMode === 'week' || viewMode === 'month') && (
          <div className="space-y-3">
            {agendamentos.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-600">Nenhum agendamento neste período</p>
              </div>
            ) : (
              agendamentos.map((agendamento) => (
                <div
                  key={agendamento.id}
                  className={`p-4 rounded-lg border-2 ${getStatusColor(agendamento.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm font-medium">
                          {new Date(agendamento.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-xs text-gray-600">
                          {agendamento.hora_inicio} - {agendamento.hora_fim}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User size={16} />
                          <span className="font-medium">
                            {agendamento.pacientes?.nome || agendamento.paciente_nome}
                          </span>
                        </div>
                        <p className="text-sm">{agendamento.procedimento}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(agendamento.status)}
                        <span className="text-sm font-medium capitalize">{agendamento.status}</span>
                      </div>
                      <select
                        value={agendamento.status}
                        onChange={(e) => handleStatusChange(agendamento.id, e.target.value)}
                        className="text-xs px-2 py-1 border border-gray-300 rounded ml-2"
                      >
                        <option value="pendente">Pendente</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="concluido">Concluído</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                      <button
                        onClick={() => handleDelete(agendamento.id)}
                        className="p-2 hover:bg-red-200 rounded transition-colors ml-2"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Novo Agendamento</h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paciente *
                  </label>
                  <select
                    value={formData.paciente_id}
                    onChange={(e) => setFormData({ ...formData, paciente_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Selecione um paciente</option>
                    {pacientes.map((paciente) => (
                      <option key={paciente.id} value={paciente.id}>
                        {paciente.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data *</label>
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="confirmado">Confirmado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora Início *
                  </label>
                  <input
                    type="time"
                    value={formData.hora_inicio}
                    onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora Fim *
                  </label>
                  <input
                    type="time"
                    value={formData.hora_fim}
                    onChange={(e) => setFormData({ ...formData, hora_fim: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Procedimento *
                  </label>
                  <input
                    type="text"
                    value={formData.procedimento}
                    onChange={(e) => setFormData({ ...formData, procedimento: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ex: Limpeza, Restauração, Canal..."
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows="3"
                    placeholder="Observações adicionais..."
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Agendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Agendamentos
