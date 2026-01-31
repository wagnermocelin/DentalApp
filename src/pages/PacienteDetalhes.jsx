import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  DollarSign,
  Clock,
  Edit,
  FilePlus,
  ClipboardCheck,
  Printer,
  Eye
} from 'lucide-react'

const PacienteDetalhes = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [paciente, setPaciente] = useState(null)
  const [agendamentos, setAgendamentos] = useState([])
  const [prontuarios, setProntuarios] = useState([])
  const [pagamentos, setPagamentos] = useState([])
  const [receitas, setReceitas] = useState([])
  const [atestados, setAtestados] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('info')

  useEffect(() => {
    carregarDados()
  }, [id])

  const carregarDados = async () => {
    try {
      const [pacienteData, agendamentosData, prontuariosData, pagamentosData] = await Promise.all([
        supabase.from('pacientes').select('*').eq('id', id).single(),
        supabase
          .from('agendamentos')
          .select('*')
          .eq('paciente_id', id)
          .order('data', { ascending: false })
          .limit(10),
        supabase
          .from('prontuarios')
          .select('*')
          .eq('paciente_id', id)
          .order('data', { ascending: false })
          .limit(10),
        supabase
          .from('pagamentos')
          .select('*')
          .eq('paciente_id', id)
          .order('data_pagamento', { ascending: false })
          .limit(10)
      ])

      if (pacienteData.error) throw pacienteData.error

      setPaciente(pacienteData.data)
      setAgendamentos(agendamentosData.data || [])
      setProntuarios(prontuariosData.data || [])
      setPagamentos(pagamentosData.data || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      alert('Erro ao carregar dados do paciente')
    } finally {
      setLoading(false)
    }
  }

  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return '-'
    const hoje = new Date()
    const nascimento = new Date(dataNascimento)
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const mes = hoje.getMonth() - nascimento.getMonth()
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--
    }
    return idade
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmado':
      case 'pago':
        return 'bg-green-100 text-green-800'
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelado':
      case 'atrasado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!paciente) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Paciente não encontrado</p>
        <button
          onClick={() => navigate('/pacientes')}
          className="mt-4 text-primary-600 hover:text-primary-700"
        >
          Voltar para pacientes
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/pacientes')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800">{paciente.nome}</h1>
          <p className="text-gray-600 mt-1">Detalhes do paciente</p>
        </div>
        <button
          onClick={() => navigate(`/pacientes`)}
          className="flex items-center gap-2 px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
        >
          <Edit size={20} />
          Editar
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="text-primary-600" size={48} />
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Idade</p>
              <p className="text-lg font-semibold text-gray-800">
                {calcularIdade(paciente.data_nascimento)} anos
              </p>
            </div>
            {paciente.telefone && (
              <div>
                <p className="text-sm text-gray-500">Telefone</p>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  <p className="text-lg font-semibold text-gray-800">{paciente.telefone}</p>
                </div>
              </div>
            )}
            {paciente.email && (
              <div>
                <p className="text-sm text-gray-500">E-mail</p>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  <p className="text-lg font-semibold text-gray-800">{paciente.email}</p>
                </div>
              </div>
            )}
            {paciente.cpf && (
              <div>
                <p className="text-sm text-gray-500">CPF</p>
                <p className="text-lg font-semibold text-gray-800">{paciente.cpf}</p>
              </div>
            )}
            {paciente.data_nascimento && (
              <div>
                <p className="text-sm text-gray-500">Data de Nascimento</p>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <p className="text-lg font-semibold text-gray-800">
                    {new Date(paciente.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            )}
            {(paciente.endereco || paciente.cidade) && (
              <div>
                <p className="text-sm text-gray-500">Endereço</p>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  <p className="text-lg font-semibold text-gray-800">
                    {paciente.endereco}
                    {paciente.cidade && `, ${paciente.cidade}`}
                    {paciente.estado && `-${paciente.estado}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'info'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Informações
            </button>
            <button
              onClick={() => setActiveTab('agendamentos')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'agendamentos'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Agendamentos ({agendamentos.length})
            </button>
            <button
              onClick={() => setActiveTab('prontuarios')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'prontuarios'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Prontuários ({prontuarios.length})
            </button>
            <button
              onClick={() => setActiveTab('financeiro')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'financeiro'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Financeiro ({pagamentos.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'info' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Informações Completas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Nome Completo</p>
                  <p className="font-medium text-gray-800">{paciente.nome}</p>
                </div>
                {paciente.cpf && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">CPF</p>
                    <p className="font-medium text-gray-800">{paciente.cpf}</p>
                  </div>
                )}
                {paciente.data_nascimento && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Data de Nascimento</p>
                    <p className="font-medium text-gray-800">
                      {new Date(paciente.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
                {paciente.telefone && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Telefone</p>
                    <p className="font-medium text-gray-800">{paciente.telefone}</p>
                  </div>
                )}
                {paciente.email && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">E-mail</p>
                    <p className="font-medium text-gray-800">{paciente.email}</p>
                  </div>
                )}
                {paciente.endereco && (
                  <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                    <p className="text-sm text-gray-500 mb-1">Endereço Completo</p>
                    <p className="font-medium text-gray-800">
                      {paciente.endereco}
                      {paciente.cidade && `, ${paciente.cidade}`}
                      {paciente.estado && ` - ${paciente.estado}`}
                      {paciente.cep && ` - CEP: ${paciente.cep}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'agendamentos' && (
            <div className="space-y-3">
              {agendamentos.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto text-gray-400 mb-3" size={48} />
                  <p className="text-gray-600">Nenhum agendamento encontrado</p>
                </div>
              ) : (
                agendamentos.map((agendamento) => (
                  <div
                    key={agendamento.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-800">
                          {new Date(agendamento.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {agendamento.hora_inicio} - {agendamento.hora_fim}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{agendamento.procedimento}</p>
                        {agendamento.observacoes && (
                          <p className="text-sm text-gray-600">{agendamento.observacoes}</p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        agendamento.status
                      )}`}
                    >
                      {agendamento.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'prontuarios' && (
            <div className="space-y-3">
              {prontuarios.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto text-gray-400 mb-3" size={48} />
                  <p className="text-gray-600">Nenhum prontuário encontrado</p>
                </div>
              ) : (
                prontuarios.map((prontuario) => (
                  <div
                    key={prontuario.id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-800">{prontuario.procedimento}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(prontuario.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      {prontuario.dente && (
                        <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                          Dente {prontuario.dente}
                        </span>
                      )}
                    </div>
                    {prontuario.descricao && (
                      <p className="text-sm text-gray-600 mt-2">{prontuario.descricao}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'financeiro' && (
            <div className="space-y-3">
              {pagamentos.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="mx-auto text-gray-400 mb-3" size={48} />
                  <p className="text-gray-600">Nenhum pagamento encontrado</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600 mb-1">Total Pago</p>
                      <p className="text-2xl font-bold text-green-700">
                        R${' '}
                        {pagamentos
                          .filter((p) => p.status === 'pago')
                          .reduce((sum, p) => sum + (p.valor || 0), 0)
                          .toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-600 mb-1">Pendente</p>
                      <p className="text-2xl font-bold text-yellow-700">
                        R${' '}
                        {pagamentos
                          .filter((p) => p.status === 'pendente')
                          .reduce((sum, p) => sum + (p.valor || 0), 0)
                          .toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-600 mb-1">Atrasado</p>
                      <p className="text-2xl font-bold text-red-700">
                        R${' '}
                        {pagamentos
                          .filter((p) => p.status === 'atrasado')
                          .reduce((sum, p) => sum + (p.valor || 0), 0)
                          .toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  {pagamentos.map((pagamento) => (
                    <div
                      key={pagamento.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{pagamento.descricao}</p>
                        <p className="text-sm text-gray-500">
                          {pagamento.data_pagamento &&
                            new Date(pagamento.data_pagamento + 'T00:00:00').toLocaleDateString(
                              'pt-BR'
                            )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-800">
                          R$ {(pagamento.valor || 0).toLocaleString('pt-BR')}
                        </p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            pagamento.status
                          )}`}
                        >
                          {pagamento.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PacienteDetalhes
