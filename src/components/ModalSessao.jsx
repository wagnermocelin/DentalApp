import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { X, Plus, CheckCircle, DollarSign, Calendar, AlertCircle } from 'lucide-react'

const ModalSessao = ({ tratamento, onClose, onSave }) => {
  const [loading, setLoading] = useState(false)
  const [procedimentosPendentes, setProcedimentosPendentes] = useState([])
  const [procedimentosSelecionados, setProcedimentosSelecionados] = useState([])
  const [agendamentos, setAgendamentos] = useState([])
  
  const [formData, setFormData] = useState({
    data_sessao: new Date().toISOString().split('T')[0],
    hora_inicio: '',
    hora_fim: '',
    agendamento_id: '',
    observacoes: '',
    status: 'realizada'
  })

  useEffect(() => {
    if (tratamento) {
      carregarDados()
    }
  }, [tratamento])

  const carregarDados = async () => {
    try {
      setLoading(true)
      
      const [procedimentosData, agendamentosData, sessoesData] = await Promise.all([
        supabase
          .from('tratamento_procedimentos')
          .select('*')
          .eq('tratamento_id', tratamento.id)
          .in('status', ['pendente', 'em_andamento'])
          .order('prioridade', { ascending: false }),
        supabase
          .from('agendamentos')
          .select('*')
          .eq('paciente_id', tratamento.paciente_id)
          .gte('data', new Date().toISOString().split('T')[0])
          .order('data'),
        supabase
          .from('sessoes_tratamento')
          .select('numero_sessao')
          .eq('tratamento_id', tratamento.id)
          .order('numero_sessao', { ascending: false })
          .limit(1)
      ])

      setProcedimentosPendentes(procedimentosData.data || [])
      setAgendamentos(agendamentosData.data || [])
      
      const ultimoNumero = sessoesData.data?.[0]?.numero_sessao || 0
      setFormData(prev => ({ ...prev, numero_sessao: ultimoNumero + 1 }))
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleProcedimento = (procedimento) => {
    const jaExiste = procedimentosSelecionados.find(p => p.id === procedimento.id)
    
    if (jaExiste) {
      setProcedimentosSelecionados(procedimentosSelecionados.filter(p => p.id !== procedimento.id))
    } else {
      setProcedimentosSelecionados([...procedimentosSelecionados, {
        ...procedimento,
        gerar_cobranca: true,
        status_procedimento: 'realizado'
      }])
    }
  }

  const atualizarProcedimentoSelecionado = (procedimentoId, campo, valor) => {
    setProcedimentosSelecionados(procedimentosSelecionados.map(p => 
      p.id === procedimentoId ? { ...p, [campo]: valor } : p
    ))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (procedimentosSelecionados.length === 0) {
      alert('Selecione pelo menos um procedimento realizado nesta sessão')
      return
    }

    setLoading(true)

    try {
      const { data: sessao, error: sessaoError } = await supabase
        .from('sessoes_tratamento')
        .insert([{
          tratamento_id: tratamento.id,
          agendamento_id: formData.agendamento_id || null,
          data_sessao: formData.data_sessao,
          hora_inicio: formData.hora_inicio || null,
          hora_fim: formData.hora_fim || null,
          numero_sessao: formData.numero_sessao,
          status: formData.status,
          observacoes: formData.observacoes || null
        }])
        .select()
        .single()

      if (sessaoError) throw sessaoError

      const procedimentosParaSalvar = []
      const contasReceberParaCriar = []
      const procedimentosParaAtualizar = []

      for (const proc of procedimentosSelecionados) {
        procedimentosParaSalvar.push({
          sessao_id: sessao.id,
          tratamento_procedimento_id: proc.id,
          procedimento: proc.procedimento,
          dente: proc.dente,
          valor: proc.valor,
          status: proc.status_procedimento,
          gerar_cobranca: proc.gerar_cobranca,
          observacoes: proc.observacoes_sessao || null
        })

        if (proc.gerar_cobranca) {
          contasReceberParaCriar.push({
            paciente_id: tratamento.paciente_id,
            descricao: `${proc.procedimento}${proc.dente ? ` - Dente ${proc.dente}` : ''} (Sessão #${formData.numero_sessao})`,
            valor: proc.valor,
            data_vencimento: formData.data_sessao,
            status: 'pendente',
            categoria: 'Tratamento',
            observacoes: `Gerado automaticamente da sessão de tratamento #${sessao.id.substring(0, 8)}`
          })
        }

        if (proc.status_procedimento === 'realizado') {
          procedimentosParaAtualizar.push({
            id: proc.id,
            status: 'concluido'
          })
        }
      }

      const { error: procError } = await supabase
        .from('sessao_procedimentos')
        .insert(procedimentosParaSalvar)

      if (procError) throw procError

      if (contasReceberParaCriar.length > 0) {
        const { data: contasReceber, error: contasError } = await supabase
          .from('contas_receber')
          .insert(contasReceberParaCriar)
          .select()

        if (contasError) throw contasError

        for (let i = 0; i < procedimentosParaSalvar.length; i++) {
          if (procedimentosSelecionados[i].gerar_cobranca && contasReceber[i]) {
            await supabase
              .from('sessao_procedimentos')
              .update({ conta_receber_id: contasReceber[i].id })
              .eq('sessao_id', sessao.id)
              .eq('tratamento_procedimento_id', procedimentosSelecionados[i].id)
          }
        }
      }

      for (const procAtualizar of procedimentosParaAtualizar) {
        await supabase
          .from('tratamento_procedimentos')
          .update({ status: procAtualizar.status })
          .eq('id', procAtualizar.id)
      }

      const valorPago = procedimentosSelecionados
        .filter(p => p.gerar_cobranca)
        .reduce((sum, p) => sum + (p.valor || 0), 0)

      const novoValorPago = (tratamento.valor_pago || 0) + valorPago
      const novoValorPendente = (tratamento.valor_total || 0) - novoValorPago

      await supabase
        .from('tratamentos')
        .update({
          valor_pago: novoValorPago,
          valor_pendente: novoValorPendente
        })
        .eq('id', tratamento.id)

      if (formData.agendamento_id) {
        await supabase
          .from('agendamentos')
          .update({ status: 'concluido' })
          .eq('id', formData.agendamento_id)
      }

      alert(`Sessão registrada com sucesso! ${contasReceberParaCriar.length} conta(s) a receber criada(s).`)
      onSave()
    } catch (error) {
      console.error('Erro ao salvar sessão:', error)
      alert('Erro ao salvar sessão: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const valorTotalSessao = procedimentosSelecionados
    .filter(p => p.gerar_cobranca)
    .reduce((sum, p) => sum + (p.valor || 0), 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Nova Sessão de Tratamento</h2>
            <p className="text-sm text-gray-600 mt-1">
              Paciente: {tratamento.pacientes?.nome}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="text-blue-600" size={20} />
              <h3 className="font-medium text-blue-900">Informações Importantes</h3>
            </div>
            <ul className="text-sm text-blue-800 space-y-1 ml-6 list-disc">
              <li>Selecione os procedimentos que foram realizados nesta sessão</li>
              <li>Marque "Gerar Cobrança" para criar automaticamente uma conta a receber</li>
              <li>Procedimentos marcados como "Realizado" serão automaticamente concluídos</li>
              <li>Você pode vincular esta sessão a um agendamento existente</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data da Sessão *
              </label>
              <input
                type="date"
                value={formData.data_sessao}
                onChange={(e) => setFormData({ ...formData, data_sessao: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vincular a Agendamento
              </label>
              <select
                value={formData.agendamento_id}
                onChange={(e) => setFormData({ ...formData, agendamento_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Nenhum agendamento</option>
                {agendamentos.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {new Date(ag.data + 'T00:00:00').toLocaleDateString('pt-BR')} - {ag.hora_inicio} - {ag.procedimento}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora Início
              </label>
              <input
                type="time"
                value={formData.hora_inicio}
                onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora Fim
              </label>
              <input
                type="time"
                value={formData.hora_fim}
                onChange={(e) => setFormData({ ...formData, hora_fim: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações da Sessão
              </label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows="2"
                placeholder="Observações sobre esta sessão..."
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Procedimentos Realizados Nesta Sessão
            </h3>

            {procedimentosPendentes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Não há procedimentos pendentes neste tratamento
              </div>
            ) : (
              <div className="space-y-3">
                {procedimentosPendentes.map((proc) => {
                  const selecionado = procedimentosSelecionados.find(p => p.id === proc.id)
                  
                  return (
                    <div
                      key={proc.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selecionado 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={!!selecionado}
                          onChange={() => toggleProcedimento(proc)}
                          className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-gray-800">{proc.procedimento}</h4>
                            {proc.dente && (
                              <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                                Dente {proc.dente}
                              </span>
                            )}
                            <span className="text-sm text-gray-600">
                              R$ {(proc.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          {selecionado && (
                            <div className="mt-3 space-y-3 bg-white p-3 rounded border border-primary-200">
                              <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={selecionado.gerar_cobranca}
                                    onChange={(e) => atualizarProcedimentoSelecionado(proc.id, 'gerar_cobranca', e.target.checked)}
                                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                  />
                                  <span className="text-sm font-medium text-gray-700">Gerar Cobrança</span>
                                </label>

                                <select
                                  value={selecionado.status_procedimento}
                                  onChange={(e) => atualizarProcedimentoSelecionado(proc.id, 'status_procedimento', e.target.value)}
                                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                  <option value="realizado">Realizado Completamente</option>
                                  <option value="parcial">Realizado Parcialmente</option>
                                </select>
                              </div>

                              <input
                                type="text"
                                value={selecionado.observacoes_sessao || ''}
                                onChange={(e) => atualizarProcedimentoSelecionado(proc.id, 'observacoes_sessao', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="Observações específicas deste procedimento nesta sessão..."
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {procedimentosSelecionados.length > 0 && (
            <div className="border-t pt-6">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-medium text-green-900 mb-3">Resumo da Sessão</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-800">Procedimentos selecionados:</span>
                    <span className="font-medium text-green-900">{procedimentosSelecionados.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-800">Procedimentos com cobrança:</span>
                    <span className="font-medium text-green-900">
                      {procedimentosSelecionados.filter(p => p.gerar_cobranca).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-green-300 pt-2 mt-2">
                    <span className="text-green-900">Valor Total a Cobrar:</span>
                    <span className="text-green-900">
                      R$ {valorTotalSessao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || procedimentosSelecionados.length === 0}
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                'Salvando...'
              ) : (
                <>
                  <CheckCircle size={20} />
                  Registrar Sessão
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalSessao
