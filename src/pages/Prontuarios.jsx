import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Search, FileText, X, Calendar, User } from 'lucide-react'

const Prontuarios = () => {
  const [prontuarios, setProntuarios] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [filteredProntuarios, setFilteredProntuarios] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedDente, setSelectedDente] = useState(null)

  const [formData, setFormData] = useState({
    paciente_id: '',
    data: new Date().toISOString().split('T')[0],
    procedimento: '',
    dente: '',
    descricao: '',
    observacoes: ''
  })

  useEffect(() => {
    carregarDados()
  }, [])

  useEffect(() => {
    const filtered = prontuarios.filter(
      (p) =>
        p.pacientes?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.procedimento.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.dente?.includes(searchTerm)
    )
    setFilteredProntuarios(filtered)
  }, [searchTerm, prontuarios])

  const carregarDados = async () => {
    try {
      const [prontuariosData, pacientesData] = await Promise.all([
        supabase
          .from('prontuarios')
          .select('*, pacientes(nome)')
          .order('data', { ascending: false }),
        supabase.from('pacientes').select('id, nome').order('nome')
      ])

      setProntuarios(prontuariosData.data || [])
      setFilteredProntuarios(prontuariosData.data || [])
      setPacientes(pacientesData.data || [])
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
      const { error } = await supabase.from('prontuarios').insert([formData])

      if (error) throw error

      setShowModal(false)
      resetForm()
      carregarDados()
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
      carregarDados()
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

  if (loading && prontuarios.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-800">Prontuários</h1>
          <p className="text-gray-600 mt-1">Histórico clínico dos pacientes</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Novo Prontuário
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por paciente, procedimento ou dente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
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
          <h2 className="text-lg font-semibold text-gray-800">Histórico de Procedimentos</h2>
        </div>
        <div className="p-6">
          {filteredProntuarios.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600">
                {searchTerm ? 'Nenhum prontuário encontrado' : 'Nenhum prontuário cadastrado'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProntuarios.map((prontuario) => (
                <div
                  key={prontuario.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-400" />
                          <span className="font-medium text-gray-800">
                            {prontuario.pacientes?.nome}
                          </span>
                        </div>
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-800">Novo Prontuário</h2>
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
    </div>
  )
}

export default Prontuarios
