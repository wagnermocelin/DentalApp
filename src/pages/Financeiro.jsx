import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
  DollarSign,
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  X,
  Filter,
  Download
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const Financeiro = () => {
  const [pagamentos, setPagamentos] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [filteredPagamentos, setFilteredPagamentos] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPagamento, setEditingPagamento] = useState(null)

  const [formData, setFormData] = useState({
    paciente_id: '',
    descricao: '',
    valor: '',
    data_vencimento: '',
    data_pagamento: '',
    forma_pagamento: '',
    status: 'pendente',
    observacoes: ''
  })

  const [stats, setStats] = useState({
    totalRecebido: 0,
    totalPendente: 0,
    totalAtrasado: 0,
    totalMes: 0
  })

  useEffect(() => {
    carregarDados()
  }, [])

  useEffect(() => {
    let filtered = pagamentos.filter(
      (p) =>
        (p.pacientes?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    if (statusFilter !== 'todos') {
      filtered = filtered.filter((p) => p.status === statusFilter)
    }

    setFilteredPagamentos(filtered)
  }, [searchTerm, statusFilter, pagamentos])

  const carregarDados = async () => {
    try {
      const [pagamentosData, pacientesData] = await Promise.all([
        supabase
          .from('pagamentos')
          .select('*, pacientes(nome)')
          .order('data_vencimento', { ascending: false }),
        supabase.from('pacientes').select('id, nome').order('nome')
      ])

      const pagamentosArray = pagamentosData.data || []
      setPagamentos(pagamentosArray)
      setFilteredPagamentos(pagamentosArray)
      setPacientes(pacientesData.data || [])

      const hoje = new Date()
      const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

      const totalRecebido = pagamentosArray
        .filter((p) => p.status === 'pago')
        .reduce((sum, p) => sum + (p.valor || 0), 0)

      const totalPendente = pagamentosArray
        .filter((p) => p.status === 'pendente')
        .reduce((sum, p) => sum + (p.valor || 0), 0)

      const totalAtrasado = pagamentosArray
        .filter((p) => {
          if (p.status !== 'pendente') return false
          const vencimento = new Date(p.data_vencimento + 'T00:00:00')
          return vencimento < hoje
        })
        .reduce((sum, p) => sum + (p.valor || 0), 0)

      const totalMes = pagamentosArray
        .filter((p) => {
          if (p.status !== 'pago' || !p.data_pagamento) return false
          const dataPagamento = new Date(p.data_pagamento + 'T00:00:00')
          return dataPagamento >= primeiroDiaMes
        })
        .reduce((sum, p) => sum + (p.valor || 0), 0)

      setStats({
        totalRecebido,
        totalPendente,
        totalAtrasado,
        totalMes
      })
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const dataToSave = {
        ...formData,
        valor: parseFloat(formData.valor)
      }

      if (editingPagamento) {
        const { error } = await supabase
          .from('pagamentos')
          .update(dataToSave)
          .eq('id', editingPagamento.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from('pagamentos').insert([dataToSave])

        if (error) throw error
      }

      setShowModal(false)
      setEditingPagamento(null)
      resetForm()
      carregarDados()
    } catch (error) {
      console.error('Erro ao salvar pagamento:', error)
      alert('Erro ao salvar pagamento: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este pagamento?')) return

    try {
      const { error } = await supabase.from('pagamentos').delete().eq('id', id)

      if (error) throw error
      carregarDados()
    } catch (error) {
      console.error('Erro ao excluir pagamento:', error)
      alert('Erro ao excluir pagamento: ' + error.message)
    }
  }

  const handleEdit = (pagamento) => {
    setEditingPagamento(pagamento)
    setFormData({
      paciente_id: pagamento.paciente_id || '',
      descricao: pagamento.descricao || '',
      valor: pagamento.valor?.toString() || '',
      data_vencimento: pagamento.data_vencimento || '',
      data_pagamento: pagamento.data_pagamento || '',
      forma_pagamento: pagamento.forma_pagamento || '',
      status: pagamento.status || 'pendente',
      observacoes: pagamento.observacoes || ''
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      paciente_id: '',
      descricao: '',
      valor: '',
      data_vencimento: '',
      data_pagamento: '',
      forma_pagamento: '',
      status: 'pendente',
      observacoes: ''
    })
  }

  const getStatusColor = (status, dataVencimento) => {
    if (status === 'pago') return 'bg-green-100 text-green-800 border-green-200'
    if (status === 'cancelado') return 'bg-gray-100 text-gray-800 border-gray-200'
    
    const hoje = new Date()
    const vencimento = new Date(dataVencimento + 'T00:00:00')
    
    if (vencimento < hoje) return 'bg-red-100 text-red-800 border-red-200'
    return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }

  const getStatusText = (status, dataVencimento) => {
    if (status === 'pago') return 'Pago'
    if (status === 'cancelado') return 'Cancelado'
    
    const hoje = new Date()
    const vencimento = new Date(dataVencimento + 'T00:00:00')
    
    if (vencimento < hoje) return 'Atrasado'
    return 'Pendente'
  }

  const dadosGrafico = [
    { mes: 'Jan', valor: 15000 },
    { mes: 'Fev', valor: 18000 },
    { mes: 'Mar', valor: 22000 },
    { mes: 'Abr', valor: 19000 },
    { mes: 'Mai', valor: 25000 },
    { mes: 'Jun', valor: stats.totalMes }
  ]

  if (loading && pagamentos.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-800">Financeiro</h1>
          <p className="text-gray-600 mt-1">Controle de pagamentos e recebimentos</p>
        </div>
        <button
          onClick={() => {
            setEditingPagamento(null)
            resetForm()
            setShowModal(true)
          }}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Novo Pagamento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Recebido</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                R$ {stats.totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">A Receber</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">
                R$ {stats.totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
              <p className="text-sm text-gray-600">Atrasados</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                R$ {stats.totalAtrasado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Recebido no Mês</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                R$ {stats.totalMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Faturamento Mensal</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dadosGrafico}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
            <Legend />
            <Bar dataKey="valor" fill="#3b82f6" name="Faturamento" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por paciente ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('todos')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === 'todos'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter('pago')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === 'pago'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pagos
            </button>
            <button
              onClick={() => setStatusFilter('pendente')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === 'pendente'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pendentes
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredPagamentos.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'todos'
                  ? 'Nenhum pagamento encontrado'
                  : 'Nenhum pagamento cadastrado'}
              </p>
            </div>
          ) : (
            filteredPagamentos.map((pagamento) => (
              <div
                key={pagamento.id}
                className={`p-4 rounded-lg border-2 ${getStatusColor(
                  pagamento.status,
                  pagamento.data_vencimento
                )}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <User size={16} className="text-gray-600" />
                      <span className="font-medium text-gray-800">
                        {pagamento.pacientes?.nome || 'Paciente não informado'}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          pagamento.status,
                          pagamento.data_vencimento
                        )}`}
                      >
                        {getStatusText(pagamento.status, pagamento.data_vencimento)}
                      </span>
                    </div>
                    <p className="text-gray-800 mb-1">{pagamento.descricao}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>
                          Venc:{' '}
                          {new Date(pagamento.data_vencimento + 'T00:00:00').toLocaleDateString(
                            'pt-BR'
                          )}
                        </span>
                      </div>
                      {pagamento.data_pagamento && (
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>
                            Pago:{' '}
                            {new Date(pagamento.data_pagamento + 'T00:00:00').toLocaleDateString(
                              'pt-BR'
                            )}
                          </span>
                        </div>
                      )}
                      {pagamento.forma_pagamento && (
                        <span className="capitalize">{pagamento.forma_pagamento}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-800">
                        R$ {(pagamento.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(pagamento)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Filter size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(pagamento.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingPagamento ? 'Editar Pagamento' : 'Novo Pagamento'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingPagamento(null)
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição *
                  </label>
                  <input
                    type="text"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ex: Consulta, Limpeza, Restauração..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valor *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Vencimento *
                  </label>
                  <input
                    type="date"
                    value={formData.data_vencimento}
                    onChange={(e) =>
                      setFormData({ ...formData, data_vencimento: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Pagamento
                  </label>
                  <input
                    type="date"
                    value={formData.data_pagamento}
                    onChange={(e) => setFormData({ ...formData, data_pagamento: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Forma de Pagamento
                  </label>
                  <select
                    value={formData.forma_pagamento}
                    onChange={(e) => setFormData({ ...formData, forma_pagamento: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Selecione</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="cartao_debito">Cartão de Débito</option>
                    <option value="pix">PIX</option>
                    <option value="transferencia">Transferência</option>
                    <option value="boleto">Boleto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
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
                    setEditingPagamento(null)
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
                  {loading ? 'Salvando...' : editingPagamento ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Financeiro
