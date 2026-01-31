import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  ClipboardList,
  Plus,
  Search,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Edit2,
  Trash2,
  Eye,
  DollarSign,
  Calendar,
  User,
  Activity,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  ChevronRight,
  FilePlus,
  ClipboardCheck
} from 'lucide-react'
import ModalOrcamento from '../components/ModalOrcamento'
import ModalTratamento from '../components/ModalTratamento'
import ModalSessao from '../components/ModalSessaoNovo'
import ModalReceita from '../components/ModalReceita'
import ModalAtestado from '../components/ModalAtestado'

const Atendimento = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('orcamentos')
  const [orcamentos, setOrcamentos] = useState([])
  const [tratamentos, setTratamentos] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [procedimentosPadrao, setProcedimentosPadrao] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('') // 'orcamento', 'tratamento', 'sessao'
  const [selectedItem, setSelectedItem] = useState(null)

  const [stats, setStats] = useState({
    orcamentosPendentes: 0,
    orcamentosAprovados: 0,
    tratamentosAtivos: 0,
    tratamentosConcluidos: 0
  })

  useEffect(() => {
    carregarDados()
  }, [])

  useEffect(() => {
    calcularEstatisticas()
  }, [orcamentos, tratamentos])

  // Detectar se veio de agendamento para criar orçamento
  useEffect(() => {
    if (location.state?.novoOrcamento && pacientes.length > 0 && !showModal) {
      const paciente = pacientes.find(p => p.id === location.state.pacienteId)
      if (paciente) {
        setSelectedItem({
          pacientes: paciente,
          paciente_id: location.state.pacienteId
        })
        setModalType('orcamento')
        setShowModal(true)
      }
    }
  }, [location.state, pacientes, showModal])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const [orcamentosData, tratamentosData, pacientesData, procedimentosData] = await Promise.all([
        supabase
          .from('orcamentos')
          .select('*, pacientes(nome)')
          .order('created_at', { ascending: false }),
        supabase
          .from('tratamentos')
          .select('*, pacientes(nome)')
          .order('created_at', { ascending: false }),
        supabase.from('pacientes').select('id, nome').order('nome'),
        supabase.from('procedimentos_padrao').select('*').eq('ativo', true).order('nome')
      ])

      setOrcamentos(orcamentosData.data || [])
      setTratamentos(tratamentosData.data || [])
      setPacientes(pacientesData.data || [])
      setProcedimentosPadrao(procedimentosData.data || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const calcularEstatisticas = () => {
    const orcamentosPendentes = orcamentos.filter(o => o.status === 'pendente').length
    const orcamentosAprovados = orcamentos.filter(o => o.status === 'aprovado').length
    const tratamentosAtivos = tratamentos.filter(t => t.status === 'em_andamento').length
    const tratamentosConcluidos = tratamentos.filter(t => t.status === 'concluido').length

    setStats({
      orcamentosPendentes,
      orcamentosAprovados,
      tratamentosAtivos,
      tratamentosConcluidos
    })
  }

  const abrirModalOrcamento = (orcamento = null) => {
    setSelectedItem(orcamento)
    setModalType('orcamento')
    setShowModal(true)
  }

  const abrirModalTratamento = (tratamento = null) => {
    setSelectedItem(tratamento)
    setModalType('tratamento')
    setShowModal(true)
  }

  const abrirModalSessao = (tratamento) => {
    setSelectedItem(tratamento)
    setModalType('sessao')
    setShowModal(true)
  }

  const aprovarOrcamento = async (orcamentoId) => {
    if (!confirm('Deseja aprovar este orçamento e iniciar o tratamento?')) return

    try {
      setLoading(true)

      // Buscar orçamento completo com itens
      const { data: orcamento } = await supabase
        .from('orcamentos')
        .select('*, orcamento_itens(*)')
        .eq('id', orcamentoId)
        .single()

      if (!orcamento) throw new Error('Orçamento não encontrado')

      // Atualizar status do orçamento
      await supabase
        .from('orcamentos')
        .update({ status: 'aprovado' })
        .eq('id', orcamentoId)

      // Criar tratamento
      const { data: tratamento, error: tratamentoError } = await supabase
        .from('tratamentos')
        .insert([{
          orcamento_id: orcamentoId,
          paciente_id: orcamento.paciente_id,
          data_inicio: new Date().toISOString().split('T')[0],
          valor_total: orcamento.valor_final,
          valor_pago: 0,
          valor_pendente: orcamento.valor_final,
          status: 'em_andamento',
          observacoes: `Tratamento iniciado a partir do orçamento #${orcamentoId.substring(0, 8)}`
        }])
        .select()
        .single()

      if (tratamentoError) throw tratamentoError

      // Criar procedimentos do tratamento
      const procedimentos = orcamento.orcamento_itens.map(item => ({
        tratamento_id: tratamento.id,
        procedimento: item.procedimento,
        dente: item.dente,
        valor: item.valor_total,
        status: 'pendente',
        prioridade: 'normal'
      }))

      await supabase.from('tratamento_procedimentos').insert(procedimentos)

      alert('Orçamento aprovado e tratamento iniciado com sucesso!')
      carregarDados()
    } catch (error) {
      console.error('Erro ao aprovar orçamento:', error)
      alert('Erro ao aprovar orçamento: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const rejeitarOrcamento = async (orcamentoId) => {
    if (!confirm('Deseja rejeitar este orçamento?')) return

    try {
      await supabase
        .from('orcamentos')
        .update({ status: 'rejeitado' })
        .eq('id', orcamentoId)

      carregarDados()
    } catch (error) {
      console.error('Erro ao rejeitar orçamento:', error)
      alert('Erro ao rejeitar orçamento: ' + error.message)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pendente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      aprovado: 'bg-green-100 text-green-800 border-green-200',
      rejeitado: 'bg-red-100 text-red-800 border-red-200',
      expirado: 'bg-gray-100 text-gray-800 border-gray-200',
      em_andamento: 'bg-blue-100 text-blue-800 border-blue-200',
      concluido: 'bg-green-100 text-green-800 border-green-200',
      cancelado: 'bg-red-100 text-red-800 border-red-200',
      pausado: 'bg-orange-100 text-orange-800 border-orange-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStatusText = (status) => {
    const texts = {
      pendente: 'Pendente',
      aprovado: 'Aprovado',
      rejeitado: 'Rejeitado',
      expirado: 'Expirado',
      em_andamento: 'Em Andamento',
      concluido: 'Concluído',
      cancelado: 'Cancelado',
      pausado: 'Pausado'
    }
    return texts[status] || status
  }

  const getStatusIcon = (status) => {
    const icons = {
      pendente: <Clock size={16} />,
      aprovado: <CheckCircle size={16} />,
      rejeitado: <XCircle size={16} />,
      expirado: <AlertCircle size={16} />,
      em_andamento: <PlayCircle size={16} />,
      concluido: <CheckCircle size={16} />,
      cancelado: <XCircle size={16} />,
      pausado: <PauseCircle size={16} />
    }
    return icons[status] || <Clock size={16} />
  }

  const filtrarItens = (items) => {
    let filtered = items.filter((item) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        item.pacientes?.nome.toLowerCase().includes(searchLower) ||
        item.observacoes?.toLowerCase().includes(searchLower)
      )
    })

    if (statusFilter !== 'todos') {
      filtered = filtered.filter((item) => item.status === statusFilter)
    }

    return filtered
  }

  const itensFiltrados = activeTab === 'orcamentos' 
    ? filtrarItens(orcamentos) 
    : filtrarItens(tratamentos)

  if (loading && orcamentos.length === 0 && tratamentos.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-800">Atendimento</h1>
          <p className="text-gray-600 mt-1">Gestão de orçamentos e tratamentos</p>
        </div>
        <button
          onClick={() => abrirModalOrcamento()}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Novo Orçamento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Orçamentos Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">
                {stats.orcamentosPendentes}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Orçamentos Aprovados</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {stats.orcamentosAprovados}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tratamentos Ativos</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {stats.tratamentosAtivos}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tratamentos Concluídos</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {stats.tratamentosConcluidos}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('orcamentos')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'orcamentos'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText size={20} />
                Orçamentos
              </div>
            </button>
            <button
              onClick={() => setActiveTab('tratamentos')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'tratamentos'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <ClipboardList size={20} />
                Tratamentos
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
                placeholder="Buscar por paciente..."
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
              {activeTab === 'orcamentos' ? (
                <>
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
                  <button
                    onClick={() => setStatusFilter('aprovado')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      statusFilter === 'aprovado'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Aprovados
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setStatusFilter('em_andamento')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      statusFilter === 'em_andamento'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Em Andamento
                  </button>
                  <button
                    onClick={() => setStatusFilter('concluido')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      statusFilter === 'concluido'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Concluídos
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {itensFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'todos'
                    ? `Nenhum ${activeTab === 'orcamentos' ? 'orçamento' : 'tratamento'} encontrado`
                    : `Nenhum ${activeTab === 'orcamentos' ? 'orçamento' : 'tratamento'} cadastrado`}
                </p>
              </div>
            ) : (
              itensFiltrados.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border-2 ${getStatusColor(item.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <User size={16} className="text-gray-600" />
                        <span className="font-medium text-gray-800">
                          {item.pacientes?.nome || 'Paciente não informado'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          {getStatusText(item.status)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>
                            {activeTab === 'orcamentos' 
                              ? `Criado: ${new Date(item.data_orcamento + 'T00:00:00').toLocaleDateString('pt-BR')}`
                              : `Início: ${new Date(item.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR')}`
                            }
                          </span>
                        </div>
                        {activeTab === 'orcamentos' && item.validade && (
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>
                              Validade: {new Date(item.validade + 'T00:00:00').toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        )}
                      </div>

                      {item.observacoes && (
                        <p className="text-sm text-gray-600 mb-2">{item.observacoes}</p>
                      )}

                      {activeTab === 'tratamentos' && (
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <DollarSign size={14} className="text-green-600" />
                            <span className="text-green-600 font-medium">
                              Pago: R$ {(item.valor_pago || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign size={14} className="text-yellow-600" />
                            <span className="text-yellow-600 font-medium">
                              Pendente: R$ {(item.valor_pendente || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 ml-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Valor Total</p>
                        <p className="text-2xl font-bold text-gray-800">
                          R$ {((activeTab === 'orcamentos' ? item.valor_final : item.valor_total) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {activeTab === 'orcamentos' ? (
                          <>
                            {item.status === 'pendente' && (
                              <>
                                <button
                                  onClick={() => aprovarOrcamento(item.id)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Aprovar orçamento"
                                >
                                  <CheckCircle size={18} />
                                </button>
                                <button
                                  onClick={() => rejeitarOrcamento(item.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Rejeitar orçamento"
                                >
                                  <XCircle size={18} />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => abrirModalOrcamento(item)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ver detalhes"
                            >
                              <Eye size={18} />
                            </button>
                          </>
                        ) : (
                          <>
                            {item.status === 'em_andamento' && (
                              <button
                                onClick={() => abrirModalSessao(item)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Nova sessão"
                              >
                                <Plus size={18} />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedItem(item)
                                setModalType('receita')
                                setShowModal(true)
                              }}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Emitir receita"
                            >
                              <FilePlus size={18} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(item)
                                setModalType('atestado')
                                setShowModal(true)
                              }}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Emitir atestado"
                            >
                              <ClipboardCheck size={18} />
                            </button>
                            <button
                              onClick={() => abrirModalTratamento(item)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ver detalhes"
                            >
                              <Eye size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showModal && modalType === 'orcamento' && (
        <ModalOrcamento
          orcamento={selectedItem?.id ? selectedItem : null}
          pacienteInicial={selectedItem?.paciente_id}
          pacientes={pacientes}
          procedimentosPadrao={procedimentosPadrao}
          onClose={() => {
            setShowModal(false)
            setSelectedItem(null)
            // Limpar state do location para evitar reabertura
            if (location.state?.novoOrcamento) {
              navigate('/atendimento', { replace: true })
            }
          }}
          onSave={() => {
            setShowModal(false)
            setSelectedItem(null)
            carregarDados()
            // Limpar state do location para evitar reabertura
            if (location.state?.novoOrcamento) {
              navigate('/atendimento', { replace: true })
            }
          }}
        />
      )}

      {showModal && modalType === 'tratamento' && (
        <ModalTratamento
          tratamento={selectedItem}
          onClose={() => {
            setShowModal(false)
            setSelectedItem(null)
          }}
          onSave={() => {
            setShowModal(false)
            setSelectedItem(null)
            carregarDados()
          }}
        />
      )}

      {showModal && modalType === 'sessao' && (
        <ModalSessao
          tratamento={selectedItem}
          onClose={() => {
            setShowModal(false)
            setSelectedItem(null)
          }}
          onSave={() => {
            setShowModal(false)
            setSelectedItem(null)
            carregarDados()
          }}
        />
      )}

      {showModal && modalType === 'receita' && selectedItem && (
        <ModalReceita
          paciente={{
            id: selectedItem.paciente_id,
            nome: selectedItem.pacientes?.nome || 'Paciente',
            cpf: selectedItem.pacientes?.cpf || null
          }}
          tratamento={selectedItem}
          onClose={() => {
            setShowModal(false)
            setSelectedItem(null)
          }}
          onSave={() => {
            setShowModal(false)
            setSelectedItem(null)
          }}
        />
      )}

      {showModal && modalType === 'atestado' && selectedItem && (
        <ModalAtestado
          paciente={{
            id: selectedItem.paciente_id,
            nome: selectedItem.pacientes?.nome || 'Paciente',
            cpf: selectedItem.pacientes?.cpf || null
          }}
          tratamento={selectedItem}
          onClose={() => {
            setShowModal(false)
            setSelectedItem(null)
          }}
          onSave={() => {
            setShowModal(false)
            setSelectedItem(null)
          }}
        />
      )}
    </div>
  )
}

export default Atendimento
