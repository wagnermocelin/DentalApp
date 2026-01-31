import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Search, FileText, X, Calendar, User, ChevronRight, ArrowLeft, FilePlus, ClipboardCheck, Printer, Eye } from 'lucide-react'

const ProntuariosNovo = () => {
  const [pacientes, setPacientes] = useState([])
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null)
  const [prontuarios, setProntuarios] = useState([])
  const [receitas, setReceitas] = useState([])
  const [atestados, setAtestados] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedDente, setSelectedDente] = useState(null)
  const [documentoSelecionado, setDocumentoSelecionado] = useState(null)
  const [tipoDocumento, setTipoDocumento] = useState(null)

  const [formData, setFormData] = useState({
    paciente_id: '',
    data: new Date().toISOString().split('T')[0],
    procedimento: '',
    dente: '',
    descricao: '',
    observacoes: ''
  })

  useEffect(() => {
    carregarPacientes()
  }, [])

  useEffect(() => {
    if (pacienteSelecionado) {
      carregarProntuariosPaciente(pacienteSelecionado.id)
      carregarReceitasPaciente(pacienteSelecionado.id)
      carregarAtestadosPaciente(pacienteSelecionado.id)
    }
  }, [pacienteSelecionado])

  const carregarPacientes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('pacientes')
        .select('id, nome, telefone, email')
        .order('nome')

      if (error) throw error

      // Buscar contagem de prontuários para cada paciente
      const pacientesComContagem = await Promise.all(
        (data || []).map(async (paciente) => {
          const { count } = await supabase
            .from('prontuarios')
            .select('*', { count: 'exact', head: true })
            .eq('paciente_id', paciente.id)

          return { ...paciente, total_prontuarios: count || 0 }
        })
      )

      setPacientes(pacientesComContagem)
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const carregarProntuariosPaciente = async (pacienteId) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('prontuarios')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('data', { ascending: false })

      if (error) throw error
      setProntuarios(data || [])
    } catch (error) {
      console.error('Erro ao carregar prontuários:', error)
    } finally {
      setLoading(false)
    }
  }

  const carregarReceitasPaciente = async (pacienteId) => {
    try {
      const { data, error } = await supabase
        .from('receitas')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('data_emissao', { ascending: false })

      if (error) throw error
      setReceitas(data || [])
    } catch (error) {
      console.error('Erro ao carregar receitas:', error)
    }
  }

  const carregarAtestadosPaciente = async (pacienteId) => {
    try {
      const { data, error } = await supabase
        .from('atestados')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('data_emissao', { ascending: false })

      if (error) throw error
      setAtestados(data || [])
    } catch (error) {
      console.error('Erro ao carregar atestados:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from('prontuarios').insert([{
        ...formData,
        paciente_id: pacienteSelecionado.id
      }])

      if (error) throw error

      setShowModal(false)
      resetForm()
      carregarProntuariosPaciente(pacienteSelecionado.id)
      carregarPacientes() // Atualizar contagem
    } catch (error) {
      console.error('Erro ao salvar prontuário:', error)
      alert('Erro ao salvar prontuário: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este prontuário?')) return

    try {
      const { error } = await supabase.from('prontuarios').delete().eq('id', id)

      if (error) throw error
      carregarProntuariosPaciente(pacienteSelecionado.id)
      carregarPacientes() // Atualizar contagem
    } catch (error) {
      console.error('Erro ao excluir prontuário:', error)
      alert('Erro ao excluir prontuário: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      paciente_id: '',
      data: new Date().toISOString().split('T')[0],
      procedimento: '',
      dente: '',
      descricao: '',
      observacoes: ''
    })
    setSelectedDente(null)
  }

  const voltarParaLista = () => {
    setPacienteSelecionado(null)
    setProntuarios([])
    setSearchTerm('')
  }

  const dentesSuperiores = [
    [18, 17, 16, 15, 14, 13, 12, 11],
    [21, 22, 23, 24, 25, 26, 27, 28]
  ]

  const dentesInferiores = [
    [48, 47, 46, 45, 44, 43, 42, 41],
    [31, 32, 33, 34, 35, 36, 37, 38]
  ]

  const handleDenteClick = (dente) => {
    setSelectedDente(dente)
    setFormData({ ...formData, dente: dente.toString() })
  }

  const getDenteColor = (dente) => {
    if (selectedDente === dente) return 'bg-primary-600 text-white'
    const temProntuario = prontuarios.some((p) => p.dente === dente.toString())
    if (temProntuario) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-white text-gray-700 border-gray-300'
  }

  const pacientesFiltrados = pacientes.filter((p) =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.telefone?.includes(searchTerm) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading && pacientes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // VISUALIZAÇÃO: Lista de Pacientes
  if (!pacienteSelecionado) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Prontuários</h1>
            <p className="text-gray-600 mt-1">Selecione um paciente para ver seu histórico</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar paciente por nome, telefone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">
              Pacientes ({pacientesFiltrados.length})
            </h2>
          </div>
          <div className="p-6">
            {pacientesFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <User className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-600">
                  {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pacientesFiltrados.map((paciente) => (
                  <button
                    key={paciente.id}
                    onClick={() => setPacienteSelecionado(paciente)}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-primary-50 hover:border-primary-300 border-2 border-transparent transition-all text-left group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User size={18} className="text-gray-400 group-hover:text-primary-600" />
                          <h3 className="font-semibold text-gray-800 group-hover:text-primary-700">
                            {paciente.nome}
                          </h3>
                        </div>
                        {paciente.telefone && (
                          <p className="text-sm text-gray-600 mb-1">📞 {paciente.telefone}</p>
                        )}
                        {paciente.email && (
                          <p className="text-sm text-gray-600 mb-2">✉️ {paciente.email}</p>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          <FileText size={16} className="text-primary-600" />
                          <span className="text-sm font-medium text-primary-600">
                            {paciente.total_prontuarios} {paciente.total_prontuarios === 1 ? 'registro' : 'registros'}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="text-gray-400 group-hover:text-primary-600 transition-colors" size={20} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // VISUALIZAÇÃO: Prontuários do Paciente Selecionado
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={voltarParaLista}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Prontuário</h1>
            <p className="text-gray-600 mt-1">
              <User className="inline mr-2" size={16} />
              {pacienteSelecionado.nome}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Novo Registro
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Odontograma</h2>
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-3 text-center">Arcada Superior</p>
            <div className="flex justify-center gap-8">
              <div className="flex gap-1">
                {dentesSuperiores[0].map((dente) => (
                  <button
                    key={dente}
                    onClick={() => handleDenteClick(dente)}
                    className={`w-10 h-12 border-2 rounded-lg font-medium text-sm transition-colors hover:shadow-md ${getDenteColor(
                      dente
                    )}`}
                  >
                    {dente}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                {dentesSuperiores[1].map((dente) => (
                  <button
                    key={dente}
                    onClick={() => handleDenteClick(dente)}
                    className={`w-10 h-12 border-2 rounded-lg font-medium text-sm transition-colors hover:shadow-md ${getDenteColor(
                      dente
                    )}`}
                  >
                    {dente}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t-2 border-gray-300"></div>

          <div>
            <p className="text-sm text-gray-600 mb-3 text-center">Arcada Inferior</p>
            <div className="flex justify-center gap-8">
              <div className="flex gap-1">
                {dentesInferiores[0].map((dente) => (
                  <button
                    key={dente}
                    onClick={() => handleDenteClick(dente)}
                    className={`w-10 h-12 border-2 rounded-lg font-medium text-sm transition-colors hover:shadow-md ${getDenteColor(
                      dente
                    )}`}
                  >
                    {dente}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                {dentesInferiores[1].map((dente) => (
                  <button
                    key={dente}
                    onClick={() => handleDenteClick(dente)}
                    className={`w-10 h-12 border-2 rounded-lg font-medium text-sm transition-colors hover:shadow-md ${getDenteColor(
                      dente
                    )}`}
                  >
                    {dente}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
            <span className="text-gray-600">Sem registro</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
            <span className="text-gray-600">Com procedimento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary-600 rounded"></div>
            <span className="text-gray-600">Selecionado</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            Histórico de Procedimentos ({prontuarios.length})
          </h2>
        </div>
        <div className="p-6">
          {prontuarios.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600">Nenhum procedimento registrado ainda</p>
              <button
                onClick={() => {
                  resetForm()
                  setShowModal(true)
                }}
                className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                Adicionar primeiro registro
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {prontuarios.map((prontuario) => (
                <div
                  key={prontuario.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {prontuario.dente && (
                          <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-sm font-medium">
                            Dente {prontuario.dente}
                          </span>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar size={14} />
                          {new Date(prontuario.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <p className="font-medium text-gray-800 mb-1">{prontuario.procedimento}</p>
                      {prontuario.descricao && (
                        <p className="text-sm text-gray-600 mb-1">{prontuario.descricao}</p>
                      )}
                      {prontuario.observacoes && (
                        <p className="text-sm text-gray-500 italic">{prontuario.observacoes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(prontuario.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Seção de Receitas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FilePlus className="text-purple-600" size={24} />
              Receitas Emitidas ({receitas.length})
            </h2>
          </div>
        </div>
        <div className="p-6">
          {receitas.length === 0 ? (
            <div className="text-center py-12">
              <FilePlus className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600">Nenhuma receita emitida ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {receitas.map((receita) => (
                <div
                  key={receita.id}
                  className="p-4 bg-purple-50 rounded-lg border border-purple-100"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} />
                          {new Date(receita.data_emissao + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <p className="font-medium text-gray-800 mb-2">Medicamentos Prescritos:</p>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-3 rounded border border-purple-200 mb-2">
                        {receita.medicamentos}
                      </div>
                      {receita.observacoes && (
                        <p className="text-sm text-gray-600 italic">
                          <strong>Obs:</strong> {receita.observacoes}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setDocumentoSelecionado(receita)
                        setTipoDocumento('receita')
                      }}
                      className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                      title="Visualizar e imprimir"
                    >
                      <Printer size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Seção de Atestados */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <ClipboardCheck className="text-orange-600" size={24} />
              Atestados Emitidos ({atestados.length})
            </h2>
          </div>
        </div>
        <div className="p-6">
          {atestados.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardCheck className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600">Nenhum atestado emitido ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {atestados.map((atestado) => (
                <div
                  key={atestado.id}
                  className="p-4 bg-orange-50 rounded-lg border border-orange-100"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} />
                          Emissão: {new Date(atestado.data_emissao + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-700">
                          <strong>Período de Afastamento:</strong>{' '}
                          {new Date(atestado.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR')} até{' '}
                          {new Date(atestado.data_fim + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Dias:</strong> {atestado.dias} dia(s)
                        </p>
                        {atestado.cid && (
                          <p className="text-sm text-gray-700">
                            <strong>CID:</strong> {atestado.cid}
                          </p>
                        )}
                        <p className="text-sm text-gray-700">
                          <strong>Motivo:</strong> {atestado.motivo}
                        </p>
                        {atestado.observacoes && (
                          <p className="text-sm text-gray-600 italic">
                            <strong>Obs:</strong> {atestado.observacoes}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setDocumentoSelecionado(atestado)
                        setTipoDocumento('atestado')
                      }}
                      className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                      title="Visualizar e imprimir"
                    >
                      <Printer size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-800">Novo Registro</h2>
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Paciente:</strong> {pacienteSelecionado.nome}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dente</label>
                  <input
                    type="text"
                    value={formData.dente}
                    onChange={(e) => setFormData({ ...formData, dente: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ex: 11, 21, 36..."
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
                    placeholder="Ex: Restauração, Canal, Extração..."
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows="3"
                    placeholder="Descrição detalhada do procedimento..."
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
                    rows="2"
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
                  {loading ? 'Salvando...' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Visualização de Documentos */}
      {documentoSelecionado && (
        <>
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              .print-documento, .print-documento * {
                visibility: visible;
              }
              .print-documento {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
              }
              .no-print-doc {
                display: none !important;
              }
            }
          `}</style>

          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10 no-print-doc">
                <h2 className="text-2xl font-bold text-gray-800">
                  {tipoDocumento === 'receita' ? 'Receita Odontológica' : 'Atestado Odontológico'}
                </h2>
                <button
                  onClick={() => {
                    setDocumentoSelecionado(null)
                    setTipoDocumento(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                {/* Preview do Documento */}
                <div className="print-documento border-2 border-gray-300 rounded-lg p-8 bg-white mb-6">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                      {tipoDocumento === 'receita' ? 'RECEITA ODONTOLÓGICA' : 'ATESTADO ODONTOLÓGICO'}
                    </h1>
                    <div className="text-sm text-gray-600">
                      <p>Dr(a). Nome do Dentista</p>
                      <p>CRO: 12345</p>
                      <p>Endereço da Clínica</p>
                      <p>Telefone: (00) 0000-0000</p>
                    </div>
                  </div>

                  {tipoDocumento === 'receita' ? (
                    <>
                      <div className="mb-6">
                        <p className="text-sm text-gray-600">
                          <strong>Data:</strong> {new Date(documentoSelecionado.data_emissao + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Paciente:</strong> {pacienteSelecionado.nome}
                        </p>
                      </div>

                      <div className="mb-8">
                        <p className="text-sm font-semibold text-gray-700 mb-3">Prescrição:</p>
                        <div className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed border-l-4 border-purple-500 pl-4">
                          {documentoSelecionado.medicamentos}
                        </div>
                      </div>

                      {documentoSelecionado.observacoes && (
                        <div className="mb-8">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Observações:</p>
                          <p className="text-sm text-gray-600 italic">{documentoSelecionado.observacoes}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="mb-8 text-justify leading-relaxed">
                        <p className="mb-4">
                          Atesto para os devidos fins que o(a) paciente <strong>{pacienteSelecionado.nome}</strong>
                          {pacienteSelecionado.cpf && `, CPF ${pacienteSelecionado.cpf},`} esteve sob meus cuidados profissionais
                          e necessita de afastamento de suas atividades habituais pelo período de{' '}
                          <strong>{documentoSelecionado.dias}</strong> dia(s),
                          no período de{' '}
                          <strong>{new Date(documentoSelecionado.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR')}</strong>
                          {' '}a{' '}
                          <strong>{new Date(documentoSelecionado.data_fim + 'T00:00:00').toLocaleDateString('pt-BR')}</strong>.
                        </p>

                        {documentoSelecionado.motivo && (
                          <p className="mb-4">
                            <strong>Motivo:</strong> {documentoSelecionado.motivo}
                          </p>
                        )}

                        {documentoSelecionado.cid && (
                          <p className="mb-4">
                            <strong>CID:</strong> {documentoSelecionado.cid}
                          </p>
                        )}

                        {documentoSelecionado.observacoes && (
                          <p className="mb-4 text-sm italic">
                            <strong>Observações:</strong> {documentoSelecionado.observacoes}
                          </p>
                        )}
                      </div>

                      <div className="mt-16 text-right">
                        <p className="text-sm text-gray-600 mb-8">
                          {new Date(documentoSelecionado.data_emissao + 'T00:00:00').toLocaleDateString('pt-BR', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                    </>
                  )}

                  <div className="mt-16 pt-8 border-t border-gray-300">
                    <div className="text-center">
                      <div className="inline-block">
                        <div className="border-t-2 border-gray-800 w-64 mb-2"></div>
                        <p className="text-sm text-gray-700">Assinatura e Carimbo do Dentista</p>
                        <p className="text-xs text-gray-600 mt-1">CRO: 12345</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-3 no-print-doc">
                  <button
                    onClick={() => {
                      setDocumentoSelecionado(null)
                      setTipoDocumento(null)
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Printer size={20} />
                    Imprimir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ProntuariosNovo
