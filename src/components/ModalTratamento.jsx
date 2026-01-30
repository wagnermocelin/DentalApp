import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { X, CheckCircle, Clock, AlertCircle, Calendar, DollarSign } from 'lucide-react'

const ModalTratamento = ({ tratamento, onClose, onSave }) => {
  const [loading, setLoading] = useState(false)
  const [procedimentos, setProcedimentos] = useState([])
  const [sessoes, setSessoes] = useState([])
  const [activeTab, setActiveTab] = useState('procedimentos')

  useEffect(() => {
    if (tratamento) {
      carregarDados()
    }
  }, [tratamento])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const [procedimentosData, sessoesData] = await Promise.all([
        supabase
          .from('tratamento_procedimentos')
          .select('*')
          .eq('tratamento_id', tratamento.id)
          .order('created_at'),
        supabase
          .from('sessoes_tratamento')
          .select('*')
          .eq('tratamento_id', tratamento.id)
          .order('data_sessao', { ascending: false })
      ])

      setProcedimentos(procedimentosData.data || [])
      setSessoes(sessoesData.data || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const atualizarStatusProcedimento = async (procedimentoId, novoStatus) => {
    try {
      const { error } = await supabase
        .from('tratamento_procedimentos')
        .update({ status: novoStatus })
        .eq('id', procedimentoId)

      if (error) throw error

      carregarDados()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert('Erro ao atualizar status: ' + error.message)
    }
  }

  const concluirTratamento = async () => {
    if (!confirm('Deseja concluir este tratamento?')) return

    try {
      const { error } = await supabase
        .from('tratamentos')
        .update({ 
          status: 'concluido',
          data_termino: new Date().toISOString().split('T')[0]
        })
        .eq('id', tratamento.id)

      if (error) throw error

      alert('Tratamento concluído com sucesso!')
      onSave()
    } catch (error) {
      console.error('Erro ao concluir tratamento:', error)
      alert('Erro ao concluir tratamento: ' + error.message)
    }
  }

  const pausarTratamento = async () => {
    if (!confirm('Deseja pausar este tratamento?')) return

    try {
      const { error } = await supabase
        .from('tratamentos')
        .update({ status: 'pausado' })
        .eq('id', tratamento.id)

      if (error) throw error

      alert('Tratamento pausado!')
      onSave()
    } catch (error) {
      console.error('Erro ao pausar tratamento:', error)
      alert('Erro ao pausar tratamento: ' + error.message)
    }
  }

  const reativarTratamento = async () => {
    try {
      const { error } = await supabase
        .from('tratamentos')
        .update({ status: 'em_andamento' })
        .eq('id', tratamento.id)

      if (error) throw error

      alert('Tratamento reativado!')
      onSave()
    } catch (error) {
      console.error('Erro ao reativar tratamento:', error)
      alert('Erro ao reativar tratamento: ' + error.message)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pendente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      em_andamento: 'bg-blue-100 text-blue-800 border-blue-200',
      concluido: 'bg-green-100 text-green-800 border-green-200',
      cancelado: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStatusText = (status) => {
    const texts = {
      pendente: 'Pendente',
      em_andamento: 'Em Andamento',
      concluido: 'Concluído',
      cancelado: 'Cancelado'
    }
    return texts[status] || status
  }

  const getPrioridadeColor = (prioridade) => {
    const colors = {
      baixa: 'text-gray-600',
      normal: 'text-blue-600',
      alta: 'text-orange-600',
      urgente: 'text-red-600'
    }
    return colors[prioridade] || 'text-gray-600'
  }

  const procedimentosPendentes = procedimentos.filter(p => p.status === 'pendente').length
  const procedimentosEmAndamento = procedimentos.filter(p => p.status === 'em_andamento').length
  const procedimentosConcluidos = procedimentos.filter(p => p.status === 'concluido').length
  const progressoPercentual = procedimentos.length > 0 
    ? Math.round((procedimentosConcluidos / procedimentos.length) * 100) 
    : 0

  if (loading && procedimentos.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Detalhes do Tratamento</h2>
            <p className="text-sm text-gray-600 mt-1">
              Paciente: {tratamento.pacientes?.nome}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-600 font-medium">Valor Total</span>
                <DollarSign className="text-blue-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-blue-900">
                R$ {(tratamento.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-green-600 font-medium">Valor Pago</span>
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-green-900">
                R$ {(tratamento.valor_pago || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-yellow-600 font-medium">Valor Pendente</span>
                <Clock className="text-yellow-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-yellow-900">
                R$ {(tratamento.valor_pendente || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progresso do Tratamento</span>
              <span className="text-sm font-bold text-primary-600">{progressoPercentual}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressoPercentual}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
              <span>{procedimentosConcluidos} concluídos</span>
              <span>{procedimentosEmAndamento} em andamento</span>
              <span>{procedimentosPendentes} pendentes</span>
            </div>
          </div>

          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('procedimentos')}
                className={`flex-1 px-6 py-3 text-center font-medium transition-colors ${
                  activeTab === 'procedimentos'
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Procedimentos ({procedimentos.length})
              </button>
              <button
                onClick={() => setActiveTab('sessoes')}
                className={`flex-1 px-6 py-3 text-center font-medium transition-colors ${
                  activeTab === 'sessoes'
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Sessões ({sessoes.length})
              </button>
            </div>
          </div>

          {activeTab === 'procedimentos' && (
            <div className="space-y-3">
              {procedimentos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum procedimento cadastrado neste tratamento
                </div>
              ) : (
                procedimentos.map((proc) => (
                  <div
                    key={proc.id}
                    className={`p-4 rounded-lg border-2 ${getStatusColor(proc.status)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-800">{proc.procedimento}</h4>
                          {proc.dente && (
                            <span className="px-2 py-1 bg-white rounded text-xs font-medium">
                              Dente {proc.dente}
                            </span>
                          )}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(proc.status)}`}>
                            {getStatusText(proc.status)}
                          </span>
                          <span className={`text-xs font-medium ${getPrioridadeColor(proc.prioridade)}`}>
                            {proc.prioridade?.toUpperCase()}
                          </span>
                        </div>
                        {proc.observacoes && (
                          <p className="text-sm text-gray-600 mb-2">{proc.observacoes}</p>
                        )}
                        <p className="text-lg font-bold text-gray-800">
                          R$ {(proc.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {proc.status === 'pendente' && (
                          <button
                            onClick={() => atualizarStatusProcedimento(proc.id, 'em_andamento')}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                          >
                            Iniciar
                          </button>
                        )}
                        {proc.status === 'em_andamento' && (
                          <button
                            onClick={() => atualizarStatusProcedimento(proc.id, 'concluido')}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                          >
                            Concluir
                          </button>
                        )}
                        {proc.status !== 'cancelado' && (
                          <button
                            onClick={() => atualizarStatusProcedimento(proc.id, 'cancelado')}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'sessoes' && (
            <div className="space-y-3">
              {sessoes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma sessão realizada ainda
                </div>
              ) : (
                sessoes.map((sessao) => (
                  <div
                    key={sessao.id}
                    className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar className="text-gray-600" size={16} />
                          <span className="font-medium text-gray-800">
                            Sessão #{sessao.numero_sessao || '-'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(sessao.status)}`}>
                            {getStatusText(sessao.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Data: {new Date(sessao.data_sessao + 'T00:00:00').toLocaleDateString('pt-BR')}
                          {sessao.hora_inicio && ` às ${sessao.hora_inicio}`}
                        </p>
                        {sessao.observacoes && (
                          <p className="text-sm text-gray-600 mt-2">{sessao.observacoes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tratamento.observacoes && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Observações do Tratamento:</h4>
              <p className="text-sm text-blue-800">{tratamento.observacoes}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            {tratamento.status === 'em_andamento' && (
              <>
                <button
                  onClick={pausarTratamento}
                  className="flex-1 px-4 py-2 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors"
                >
                  Pausar Tratamento
                </button>
                <button
                  onClick={concluirTratamento}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Concluir Tratamento
                </button>
              </>
            )}
            {tratamento.status === 'pausado' && (
              <button
                onClick={reativarTratamento}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Reativar Tratamento
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalTratamento
