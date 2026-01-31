import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Users, Plus, Search, Edit2, Trash2, UserCheck, UserX, Stethoscope, Shield } from 'lucide-react'

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [tipoFilter, setTipoFilter] = useState('todos')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState(null)

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    tipo: 'dentista',
    cro: '',
    especialidade: '',
    telefone: '',
    endereco: '',
    ativo: true
  })

  useEffect(() => {
    carregarUsuarios()
  }, [])

  const carregarUsuarios = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('nome')

      if (error) throw error
      setUsuarios(data || [])
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      alert('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingUsuario) {
        const { error } = await supabase
          .from('usuarios')
          .update(formData)
          .eq('id', editingUsuario.id)

        if (error) throw error
        alert('Usuário atualizado com sucesso!')
      } else {
        const { error } = await supabase
          .from('usuarios')
          .insert([formData])

        if (error) throw error
        alert('Usuário cadastrado com sucesso!')
      }

      setShowModal(false)
      resetForm()
      carregarUsuarios()
    } catch (error) {
      console.error('Erro ao salvar usuário:', error)
      alert('Erro ao salvar usuário: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (usuario) => {
    setEditingUsuario(usuario)
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
      cro: usuario.cro || '',
      especialidade: usuario.especialidade || '',
      telefone: usuario.telefone || '',
      endereco: usuario.endereco || '',
      ativo: usuario.ativo
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return

    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', id)

      if (error) throw error
      alert('Usuário excluído com sucesso!')
      carregarUsuarios()
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      alert('Erro ao excluir usuário: ' + error.message)
    }
  }

  const toggleAtivo = async (usuario) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ ativo: !usuario.ativo })
        .eq('id', usuario.id)

      if (error) throw error
      carregarUsuarios()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert('Erro ao atualizar status')
    }
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      tipo: 'dentista',
      cro: '',
      especialidade: '',
      telefone: '',
      endereco: '',
      ativo: true
    })
    setEditingUsuario(null)
  }

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const matchSearch = usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (usuario.cro && usuario.cro.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchTipo = tipoFilter === 'todos' || usuario.tipo === tipoFilter
    return matchSearch && matchTipo
  })

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'dentista':
        return <Stethoscope size={18} className="text-blue-600" />
      case 'admin':
        return <Shield size={18} className="text-purple-600" />
      default:
        return <Users size={18} className="text-gray-600" />
    }
  }

  const getTipoLabel = (tipo) => {
    switch (tipo) {
      case 'dentista':
        return 'Dentista'
      case 'admin':
        return 'Administrador'
      default:
        return 'Administrativo'
    }
  }

  const getTipoBadgeColor = (tipo) => {
    switch (tipo) {
      case 'dentista':
        return 'bg-blue-100 text-blue-800'
      case 'admin':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const stats = {
    total: usuarios.length,
    dentistas: usuarios.filter(u => u.tipo === 'dentista').length,
    administrativos: usuarios.filter(u => u.tipo === 'administrativo').length,
    ativos: usuarios.filter(u => u.ativo).length
  }

  if (loading && usuarios.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando usuários...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Usuários</h1>
          <p className="text-gray-600 mt-1">Gerenciamento de dentistas e usuários administrativos</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          Novo Usuário
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <Users className="text-gray-400" size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Dentistas</p>
              <p className="text-2xl font-bold text-blue-600">{stats.dentistas}</p>
            </div>
            <Stethoscope className="text-blue-400" size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Administrativos</p>
              <p className="text-2xl font-bold text-gray-600">{stats.administrativos}</p>
            </div>
            <Users className="text-gray-400" size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ativos</p>
              <p className="text-2xl font-bold text-green-600">{stats.ativos}</p>
            </div>
            <UserCheck className="text-green-400" size={32} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nome, email ou CRO..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTipoFilter('todos')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  tipoFilter === 'todos'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setTipoFilter('dentista')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  tipoFilter === 'dentista'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Dentistas
              </button>
              <button
                onClick={() => setTipoFilter('administrativo')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  tipoFilter === 'administrativo'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Administrativos
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CRO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Especialidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          {getTipoIcon(usuario.tipo)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{usuario.nome}</div>
                          <div className="text-sm text-gray-500">{usuario.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTipoBadgeColor(usuario.tipo)}`}>
                        {getTipoLabel(usuario.tipo)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {usuario.cro || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {usuario.especialidade || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleAtivo(usuario)}
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          usuario.ativo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {usuario.ativo ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(usuario)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(usuario.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingUsuario ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <UserX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                    disabled={editingUsuario}
                  />
                  {editingUsuario && (
                    <p className="text-xs text-gray-500 mt-1">O e-mail não pode ser alterado</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Usuário *
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="dentista">Dentista</option>
                    <option value="administrativo">Administrativo</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                {formData.tipo === 'dentista' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CRO {formData.tipo === 'dentista' && '*'}
                      </label>
                      <input
                        type="text"
                        value={formData.cro}
                        onChange={(e) => setFormData({ ...formData, cro: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="12345-SP"
                        required={formData.tipo === 'dentista'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Especialidade
                      </label>
                      <input
                        type="text"
                        value={formData.especialidade}
                        onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Ex: Ortodontia, Implantodontia..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Endereço
                      </label>
                      <textarea
                        value={formData.endereco}
                        onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        rows="2"
                        placeholder="Endereço completo..."
                      />
                    </div>
                  </>
                )}

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.ativo}
                      onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Usuário Ativo</span>
                  </label>
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
                  {loading ? 'Salvando...' : editingUsuario ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Usuarios
