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
  Edit2,
  Trash2,
  Building2,
  CreditCard,
  AlertCircle
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const FinanceiroNovo = () => {
  const [activeTab, setActiveTab] = useState('receber')
  const [contasReceber, setContasReceber] = useState([])
  const [contasPagar, setContasPagar] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [categorias, setCategorias] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  const [formData, setFormData] = useState({
    paciente_id: '',
    fornecedor: '',
    descricao: '',
    valor: '',
    data_vencimento: '',
    data_recebimento: '',
    data_pagamento: '',
    forma_recebimento: '',
    forma_pagamento: '',
    status: 'pendente',
    categoria: '',
    observacoes: ''
  })

  const [stats, setStats] = useState({
    totalReceber: 0,
    totalReceberPendente: 0,
    totalReceberAtrasado: 0,
    totalPagar: 0,
    totalPagarPendente: 0,
    totalPagarAtrasado: 0,
    saldo: 0
  })

  useEffect(() => {
    carregarDados()
  }, [])

  useEffect(() => {
    calcularEstatisticas()
  }, [contasReceber, contasPagar])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const [receberData, pagarData, pacientesData, categoriasData] = await Promise.all([
        supabase
          .from('contas_receber')
          .select('*, pacientes(nome)')
          .order('data_vencimento', { ascending: false }),
        supabase
          .from('contas_pagar')
          .select('*')
          .order('data_vencimento', { ascending: false }),
        supabase.from('pacientes').select('id, nome').order('nome'),
        supabase.from('categorias_financeiras').select('*').order('nome')
      ])

      setContasReceber(receberData.data || [])
      setContasPagar(pagarData.data || [])
      setPacientes(pacientesData.data || [])
      setCategorias(categoriasData.data || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const calcularEstatisticas = () => {
    const hoje = new Date()

    const totalReceber = contasReceber
      .filter((c) => c.status === 'pago')
      .reduce((sum, c) => sum + (c.valor || 0), 0)

    const totalReceberPendente = contasReceber
      .filter((c) => c.status === 'pendente')
      .reduce((sum, c) => sum + (c.valor || 0), 0)

    const totalReceberAtrasado = contasReceber
      .filter((c) => {
        if (c.status !== 'pendente') return false
        const vencimento = new Date(c.data_vencimento + 'T00:00:00')
        return vencimento < hoje
      })
      .reduce((sum, c) => sum + (c.valor || 0), 0)

    const totalPagar = contasPagar
      .filter((c) => c.status === 'pago')
      .reduce((sum, c) => sum + (c.valor || 0), 0)

    const totalPagarPendente = contasPagar
      .filter((c) => c.status === 'pendente')
      .reduce((sum, c) => sum + (c.valor || 0), 0)

    const totalPagarAtrasado = contasPagar
      .filter((c) => {
        if (c.status !== 'pendente' && c.status !== 'atrasado') return false
        const vencimento = new Date(c.data_vencimento + 'T00:00:00')
        return vencimento < hoje
      })
      .reduce((sum, c) => sum + (c.valor || 0), 0)

    const saldo = totalReceber - totalPagar

    setStats({
      totalReceber,
      totalReceberPendente,
      totalReceberAtrasado,
      totalPagar,
      totalPagarPendente,
      totalPagarAtrasado,
      saldo
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const dataToSave = {
        ...formData,
        valor: parseFloat(formData.valor)
      }

      if (activeTab === 'receber') {
        delete dataToSave.fornecedor
        delete dataToSave.forma_pagamento
        delete dataToSave.data_pagamento

        if (editingItem) {
          const { error } = await supabase
            .from('contas_receber')
            .update(dataToSave)
            .eq('id', editingItem.id)
          if (error) throw error
        } else {
          const { error } = await supabase.from('contas_receber').insert([dataToSave])
          if (error) throw error
        }
      } else {
        delete dataToSave.paciente_id
        delete dataToSave.forma_recebimento
        delete dataToSave.data_recebimento

        if (editingItem) {
          const { error } = await supabase
            .from('contas_pagar')
            .update(dataToSave)
            .eq('id', editingItem.id)
          if (error) throw error
        } else {
          const { error } = await supabase.from('contas_pagar').insert([dataToSave])
          if (error) throw error
        }
      }

      setShowModal(false)
      setEditingItem(null)
      resetForm()
      carregarDados()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, tipo) => {
    if (!confirm('Tem certeza que deseja excluir?')) return

    try {
      const tabela = tipo === 'receber' ? 'contas_receber' : 'contas_pagar'
      const { error } = await supabase.from(tabela).delete().eq('id', id)
      if (error) throw error
      carregarDados()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir: ' + error.message)
    }
  }

  const handleEdit = (item, tipo) => {
    setActiveTab(tipo)
    setEditingItem(item)
    
    if (tipo === 'receber') {
      setFormData({
        paciente_id: item.paciente_id || '',
        descricao: item.descricao || '',
        valor: item.valor?.toString() || '',
        data_vencimento: item.data_vencimento || '',
        data_recebimento: item.data_recebimento || '',
        forma_recebimento: item.forma_recebimento || '',
        status: item.status || 'pendente',
        categoria: item.categoria || '',
        observacoes: item.observacoes || '',
        fornecedor: '',
        forma_pagamento: '',
        data_pagamento: ''
      })
    } else {
      setFormData({
        fornecedor: item.fornecedor || '',
        descricao: item.descricao || '',
        valor: item.valor?.toString() || '',
        data_vencimento: item.data_vencimento || '',
        data_pagamento: item.data_pagamento || '',
        forma_pagamento: item.forma_pagamento || '',
        status: item.status || 'pendente',
        categoria: item.categoria || '',
        observacoes: item.observacoes || '',
        paciente_id: '',
        forma_recebimento: '',
        data_recebimento: ''
      })
    }
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      paciente_id: '',
      fornecedor: '',
      descricao: '',
      valor: '',
      data_vencimento: '',
      data_recebimento: '',
      data_pagamento: '',
      forma_recebimento: '',
      forma_pagamento: '',
      status: 'pendente',
      categoria: '',
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

  const filtrarContas = (contas) => {
    let filtered = contas.filter((c) => {
      const searchLower = searchTerm.toLowerCase()
      if (activeTab === 'receber') {
        return (
          c.pacientes?.nome.toLowerCase().includes(searchLower) ||
          c.descricao.toLowerCase().includes(searchLower)
        )
      } else {
        return (
          c.fornecedor.toLowerCase().includes(searchLower) ||
          c.descricao.toLowerCase().includes(searchLower)
        )
      }
    })

    if (statusFilter !== 'todos') {
      filtered = filtered.filter((c) => c.status === statusFilter)
    }

    return filtered
  }

  const contasFiltradas = activeTab === 'receber' 
    ? filtrarContas(contasReceber) 
    : filtrarContas(contasPagar)

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

  const dadosGraficoPizza = categorias
    .filter(c => c.tipo === (activeTab === 'receber' ? 'receita' : 'despesa'))
    .map((cat, index) => {
      const contas = activeTab === 'receber' ? contasReceber : contasPagar
      const total = contas
        .filter(c => c.categoria === cat.nome && c.status === 'pago')
        .reduce((sum, c) => sum + (c.valor || 0), 0)
      
      return {
        name: cat.nome,
        value: total,
        color: COLORS[index % COLORS.length]
      }
    })
    .filter(d => d.value > 0)

  if (loading && contasReceber.length === 0 && contasPagar.length === 0) {
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
          <p className="text-gray-600 mt-1">Gestão completa de contas a pagar e receber</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null)
            resetForm()
            setShowModal(true)
          }}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Nova Conta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Recebido</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                R$ {stats.totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                R$ {stats.totalReceberPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
              <p className="text-sm text-gray-600">Total Pago</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                R$ {stats.totalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
              <p className="text-sm text-gray-600">Saldo</p>
              <p className={`text-2xl font-bold mt-2 ${stats.saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                R$ {stats.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stats.saldo >= 0 ? 'bg-blue-100' : 'bg-red-100'}`}>
              <CreditCard className={stats.saldo >= 0 ? 'text-blue-600' : 'text-red-600'} size={24} />
            </div>
          </div>
        </div>
      </div>

      {dadosGraficoPizza.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Distribuição por Categoria - {activeTab === 'receber' ? 'Receitas' : 'Despesas'}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dadosGraficoPizza}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {dadosGraficoPizza.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('receber')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'receber'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <TrendingUp size={20} />
                Contas a Receber
              </div>
            </button>
            <button
              onClick={() => setActiveTab('pagar')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'pagar'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <TrendingDown size={20} />
                Contas a Pagar
              </div>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={`Buscar ${activeTab === 'receber' ? 'por paciente ou' : 'por fornecedor ou'} descrição...`}
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
            {contasFiltradas.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'todos'
                    ? 'Nenhuma conta encontrada'
                    : `Nenhuma conta ${activeTab === 'receber' ? 'a receber' : 'a pagar'} cadastrada`}
                </p>
              </div>
            ) : (
              contasFiltradas.map((conta) => (
                <div
                  key={conta.id}
                  className={`p-4 rounded-lg border-2 ${getStatusColor(
                    conta.status,
                    conta.data_vencimento
                  )}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {activeTab === 'receber' ? (
                          <>
                            <User size={16} className="text-gray-600" />
                            <span className="font-medium text-gray-800">
                              {conta.pacientes?.nome || 'Paciente não informado'}
                            </span>
                          </>
                        ) : (
                          <>
                            <Building2 size={16} className="text-gray-600" />
                            <span className="font-medium text-gray-800">
                              {conta.fornecedor}
                            </span>
                          </>
                        )}
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            conta.status,
                            conta.data_vencimento
                          )}`}
                        >
                          {getStatusText(conta.status, conta.data_vencimento)}
                        </span>
                        {conta.categoria && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {conta.categoria}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-800 mb-1">{conta.descricao}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>
                            Venc: {new Date(conta.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        {(conta.data_recebimento || conta.data_pagamento) && (
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>
                              Pago: {new Date((conta.data_recebimento || conta.data_pagamento) + 'T00:00:00').toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        )}
                        {(conta.forma_recebimento || conta.forma_pagamento) && (
                          <span className="capitalize">{conta.forma_recebimento || conta.forma_pagamento}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-800">
                          R$ {(conta.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(conta, activeTab)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(conta.id, activeTab)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingItem ? 'Editar' : 'Nova'} Conta {activeTab === 'receber' ? 'a Receber' : 'a Pagar'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingItem(null)
                  resetForm()
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeTab === 'receber' ? (
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
                ) : (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fornecedor *
                    </label>
                    <input
                      type="text"
                      value={formData.fornecedor}
                      onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Nome do fornecedor"
                      required
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição *
                  </label>
                  <input
                    type="text"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Descrição da conta"
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
                    Categoria
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Selecione</option>
                    {categorias
                      .filter(c => c.tipo === (activeTab === 'receber' ? 'receita' : 'despesa'))
                      .map((cat) => (
                        <option key={cat.id} value={cat.nome}>
                          {cat.nome}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Vencimento *
                  </label>
                  <input
                    type="date"
                    value={formData.data_vencimento}
                    onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data {activeTab === 'receber' ? 'Recebimento' : 'Pagamento'}
                  </label>
                  <input
                    type="date"
                    value={activeTab === 'receber' ? formData.data_recebimento : formData.data_pagamento}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      [activeTab === 'receber' ? 'data_recebimento' : 'data_pagamento']: e.target.value 
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Forma de {activeTab === 'receber' ? 'Recebimento' : 'Pagamento'}
                  </label>
                  <select
                    value={activeTab === 'receber' ? formData.forma_recebimento : formData.forma_pagamento}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      [activeTab === 'receber' ? 'forma_recebimento' : 'forma_pagamento']: e.target.value 
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Selecione</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="cartao_debito">Cartão de Débito</option>
                    <option value="pix">PIX</option>
                    <option value="transferencia">Transferência</option>
                    <option value="boleto">Boleto</option>
                    <option value="cheque">Cheque</option>
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
                    {activeTab === 'pagar' && <option value="atrasado">Atrasado</option>}
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
                    setEditingItem(null)
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
                  {loading ? 'Salvando...' : editingItem ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default FinanceiroNovo
