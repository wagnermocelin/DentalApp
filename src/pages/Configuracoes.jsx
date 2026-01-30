import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
  User,
  Building,
  Bell,
  Lock,
  Palette,
  Save,
  Mail,
  Phone,
  MapPin,
  Clock,
  DollarSign
} from 'lucide-react'

const Configuracoes = () => {
  const [activeTab, setActiveTab] = useState('perfil')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [user, setUser] = useState(null)

  const [perfilData, setPerfilData] = useState({
    nome: '',
    email: '',
    telefone: '',
    especialidade: ''
  })

  const [clinicaData, setClinicaData] = useState({
    nome_clinica: '',
    cnpj: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone: '',
    email: '',
    horario_funcionamento: ''
  })

  const [notificacoesData, setNotificacoesData] = useState({
    email_agendamentos: true,
    email_pagamentos: true,
    sms_lembretes: false,
    notificacao_push: true
  })

  const [senhaData, setSenhaData] = useState({
    senha_atual: '',
    nova_senha: '',
    confirmar_senha: ''
  })

  useEffect(() => {
    carregarUsuario()
  }, [])

  const carregarUsuario = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        setPerfilData({
          nome: user.user_metadata?.nome || '',
          email: user.email || '',
          telefone: user.user_metadata?.telefone || '',
          especialidade: user.user_metadata?.especialidade || ''
        })
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error)
    }
  }

  const handleSavePerfil = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          nome: perfilData.nome,
          telefone: perfilData.telefone,
          especialidade: perfilData.especialidade
        }
      })

      if (error) throw error

      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' })
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      setMessage({ type: 'error', text: 'Erro ao salvar perfil: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveClinica = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      setMessage({ type: 'success', text: 'Configurações da clínica salvas com sucesso!' })
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      setMessage({ type: 'error', text: 'Erro ao salvar configurações: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotificacoes = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      setMessage({ type: 'success', text: 'Preferências de notificação salvas com sucesso!' })
    } catch (error) {
      console.error('Erro ao salvar notificações:', error)
      setMessage({ type: 'error', text: 'Erro ao salvar notificações: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleChangeSenha = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    if (senhaData.nova_senha !== senhaData.confirmar_senha) {
      setMessage({ type: 'error', text: 'As senhas não coincidem!' })
      setLoading(false)
      return
    }

    if (senhaData.nova_senha.length < 6) {
      setMessage({ type: 'error', text: 'A senha deve ter no mínimo 6 caracteres!' })
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: senhaData.nova_senha
      })

      if (error) throw error

      setMessage({ type: 'success', text: 'Senha alterada com sucesso!' })
      setSenhaData({ senha_atual: '', nova_senha: '', confirmar_senha: '' })
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      setMessage({ type: 'error', text: 'Erro ao alterar senha: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Configurações</h1>
        <p className="text-gray-600 mt-1">Gerencie as configurações do sistema</p>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('perfil')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'perfil'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <User size={20} />
              Perfil
            </button>
            <button
              onClick={() => setActiveTab('clinica')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'clinica'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Building size={20} />
              Clínica
            </button>
            <button
              onClick={() => setActiveTab('notificacoes')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'notificacoes'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Bell size={20} />
              Notificações
            </button>
            <button
              onClick={() => setActiveTab('seguranca')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'seguranca'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Lock size={20} />
              Segurança
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'perfil' && (
            <form onSubmit={handleSavePerfil} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={perfilData.nome}
                      onChange={(e) => setPerfilData({ ...perfilData, nome: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                    <input
                      type="email"
                      value={perfilData.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      O e-mail não pode ser alterado
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={perfilData.telefone}
                      onChange={(e) => setPerfilData({ ...perfilData, telefone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Especialidade
                    </label>
                    <input
                      type="text"
                      value={perfilData.especialidade}
                      onChange={(e) =>
                        setPerfilData({ ...perfilData, especialidade: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Ex: Ortodontia, Implantodontia..."
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Save size={20} />
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </form>
          )}

          {activeTab === 'clinica' && (
            <form onSubmit={handleSaveClinica} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Dados da Clínica</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Clínica
                    </label>
                    <input
                      type="text"
                      value={clinicaData.nome_clinica}
                      onChange={(e) =>
                        setClinicaData({ ...clinicaData, nome_clinica: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Nome da sua clínica"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CNPJ</label>
                    <input
                      type="text"
                      value={clinicaData.cnpj}
                      onChange={(e) => setClinicaData({ ...clinicaData, cnpj: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="00.000.000/0000-00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={clinicaData.telefone}
                      onChange={(e) =>
                        setClinicaData({ ...clinicaData, telefone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="(00) 0000-0000"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                    <input
                      type="email"
                      value={clinicaData.email}
                      onChange={(e) => setClinicaData({ ...clinicaData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="contato@clinica.com"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Endereço
                    </label>
                    <input
                      type="text"
                      value={clinicaData.endereco}
                      onChange={(e) =>
                        setClinicaData({ ...clinicaData, endereco: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Rua, número, complemento"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                    <input
                      type="text"
                      value={clinicaData.cidade}
                      onChange={(e) => setClinicaData({ ...clinicaData, cidade: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                    <input
                      type="text"
                      value={clinicaData.estado}
                      onChange={(e) => setClinicaData({ ...clinicaData, estado: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="UF"
                      maxLength="2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CEP</label>
                    <input
                      type="text"
                      value={clinicaData.cep}
                      onChange={(e) => setClinicaData({ ...clinicaData, cep: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="00000-000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Horário de Funcionamento
                    </label>
                    <input
                      type="text"
                      value={clinicaData.horario_funcionamento}
                      onChange={(e) =>
                        setClinicaData({ ...clinicaData, horario_funcionamento: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Ex: Seg-Sex 8h-18h"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Save size={20} />
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </form>
          )}

          {activeTab === 'notificacoes' && (
            <form onSubmit={handleSaveNotificacoes} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Preferências de Notificação
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">E-mail de Agendamentos</p>
                      <p className="text-sm text-gray-600">
                        Receba notificações sobre novos agendamentos
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificacoesData.email_agendamentos}
                        onChange={(e) =>
                          setNotificacoesData({
                            ...notificacoesData,
                            email_agendamentos: e.target.checked
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">E-mail de Pagamentos</p>
                      <p className="text-sm text-gray-600">
                        Receba notificações sobre pagamentos recebidos
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificacoesData.email_pagamentos}
                        onChange={(e) =>
                          setNotificacoesData({
                            ...notificacoesData,
                            email_pagamentos: e.target.checked
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">SMS de Lembretes</p>
                      <p className="text-sm text-gray-600">
                        Envie lembretes por SMS para os pacientes
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificacoesData.sms_lembretes}
                        onChange={(e) =>
                          setNotificacoesData({
                            ...notificacoesData,
                            sms_lembretes: e.target.checked
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Notificações Push</p>
                      <p className="text-sm text-gray-600">
                        Receba notificações no navegador
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificacoesData.notificacao_push}
                        onChange={(e) =>
                          setNotificacoesData({
                            ...notificacoesData,
                            notificacao_push: e.target.checked
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Save size={20} />
                {loading ? 'Salvando...' : 'Salvar Preferências'}
              </button>
            </form>
          )}

          {activeTab === 'seguranca' && (
            <form onSubmit={handleChangeSenha} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Alterar Senha</h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Senha Atual
                    </label>
                    <input
                      type="password"
                      value={senhaData.senha_atual}
                      onChange={(e) => setSenhaData({ ...senhaData, senha_atual: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      value={senhaData.nova_senha}
                      onChange={(e) => setSenhaData({ ...senhaData, nova_senha: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="••••••••"
                    />
                    <p className="text-xs text-gray-500 mt-1">Mínimo de 6 caracteres</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      value={senhaData.confirmar_senha}
                      onChange={(e) =>
                        setSenhaData({ ...senhaData, confirmar_senha: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Lock size={20} />
                {loading ? 'Alterando...' : 'Alterar Senha'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default Configuracoes
