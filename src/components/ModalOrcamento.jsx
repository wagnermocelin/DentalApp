import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { X, Plus, Trash2, DollarSign } from 'lucide-react'

const ModalOrcamento = ({ orcamento, pacientes, procedimentosPadrao, pacienteInicial, onClose, onSave }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    paciente_id: pacienteInicial || '',
    data_orcamento: new Date().toISOString().split('T')[0],
    validade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    desconto: 0,
    observacoes: ''
  })
  const [itens, setItens] = useState([])
  const [orcamentoItens, setOrcamentoItens] = useState([])

  useEffect(() => {
    if (orcamento) {
      setFormData({
        paciente_id: orcamento.paciente_id || '',
        data_orcamento: orcamento.data_orcamento || '',
        validade: orcamento.validade || '',
        desconto: orcamento.desconto || 0,
        observacoes: orcamento.observacoes || ''
      })
      carregarItens()
    } else if (pacienteInicial) {
      setFormData(prev => ({
        ...prev,
        paciente_id: pacienteInicial
      }))
    }
  }, [orcamento, pacienteInicial])

  const carregarItens = async () => {
    if (!orcamento || !orcamento.id) return

    try {
      const { data } = await supabase
        .from('orcamento_itens')
        .select('*')
        .eq('orcamento_id', orcamento.id)

      setOrcamentoItens(data || [])
    } catch (error) {
      console.error('Erro ao carregar itens:', error)
    }
  }

  const adicionarItem = () => {
    setItens([...itens, {
      procedimento: '',
      dente: '',
      quantidade: 1,
      valor_unitario: 0,
      valor_total: 0,
      observacoes: ''
    }])
  }

  const removerItem = (index) => {
    setItens(itens.filter((_, i) => i !== index))
  }

  const atualizarItem = (index, campo, valor) => {
    const novosItens = [...itens]
    novosItens[index][campo] = valor

    if (campo === 'quantidade' || campo === 'valor_unitario') {
      novosItens[index].valor_total = 
        (novosItens[index].quantidade || 0) * (novosItens[index].valor_unitario || 0)
    }

    if (campo === 'procedimento') {
      const proc = procedimentosPadrao.find(p => p.nome === valor)
      if (proc && proc.valor_sugerido) {
        novosItens[index].valor_unitario = proc.valor_sugerido
        novosItens[index].valor_total = 
          (novosItens[index].quantidade || 1) * proc.valor_sugerido
      }
    }

    setItens(novosItens)
  }

  const calcularValores = () => {
    const valorTotal = itens.reduce((sum, item) => sum + (item.valor_total || 0), 0)
    const desconto = parseFloat(formData.desconto) || 0
    const valorFinal = valorTotal - desconto
    return { valorTotal, desconto, valorFinal }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (itens.length === 0) {
      alert('Adicione pelo menos um procedimento ao orçamento')
      return
    }

    setLoading(true)

    try {
      const { valorTotal, desconto, valorFinal } = calcularValores()

      const orcamentoData = {
        ...formData,
        valor_total: valorTotal,
        desconto: desconto,
        valor_final: valorFinal,
        status: 'pendente'
      }

      let orcamentoId

      if (orcamento) {
        const { error } = await supabase
          .from('orcamentos')
          .update(orcamentoData)
          .eq('id', orcamento.id)

        if (error) throw error
        orcamentoId = orcamento.id

        await supabase
          .from('orcamento_itens')
          .delete()
          .eq('orcamento_id', orcamento.id)
      } else {
        const { data, error } = await supabase
          .from('orcamentos')
          .insert([orcamentoData])
          .select()
          .single()

        if (error) throw error
        orcamentoId = data.id
      }

      const itensParaSalvar = itens.map(item => ({
        orcamento_id: orcamentoId,
        procedimento: item.procedimento,
        dente: item.dente || null,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario,
        valor_total: item.valor_total,
        observacoes: item.observacoes || null
      }))

      const { error: itensError } = await supabase
        .from('orcamento_itens')
        .insert(itensParaSalvar)

      if (itensError) throw itensError

      alert('Orçamento salvo com sucesso!')
      onSave()
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error)
      alert('Erro ao salvar orçamento: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const { valorTotal, desconto, valorFinal } = calcularValores()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            {orcamento ? 'Editar Orçamento' : 'Novo Orçamento'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paciente *
              </label>
              <select
                value={formData.paciente_id}
                onChange={(e) => setFormData({ ...formData, paciente_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                disabled={!!orcamento}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data do Orçamento *
              </label>
              <input
                type="date"
                value={formData.data_orcamento}
                onChange={(e) => setFormData({ ...formData, data_orcamento: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Validade
              </label>
              <input
                type="date"
                value={formData.validade}
                onChange={(e) => setFormData({ ...formData, validade: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desconto (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.desconto}
                onChange={(e) => setFormData({ ...formData, desconto: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows="2"
                placeholder="Observações sobre o orçamento..."
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Procedimentos</h3>
              <button
                type="button"
                onClick={adicionarItem}
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
              >
                <Plus size={16} />
                Adicionar Procedimento
              </button>
            </div>

            {orcamento && orcamentoItens.length > 0 && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Procedimentos Atuais:</h4>
                <div className="space-y-2">
                  {orcamentoItens.map((item, index) => (
                    <div key={index} className="text-sm text-blue-800">
                      {item.procedimento} {item.dente && `(Dente ${item.dente})`} - 
                      R$ {item.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {itens.map((item, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Procedimento *
                      </label>
                      <select
                        value={item.procedimento}
                        onChange={(e) => atualizarItem(index, 'procedimento', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        required
                      >
                        <option value="">Selecione</option>
                        {procedimentosPadrao.map((proc) => (
                          <option key={proc.id} value={proc.nome}>
                            {proc.nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Dente
                      </label>
                      <input
                        type="text"
                        value={item.dente}
                        onChange={(e) => atualizarItem(index, 'dente', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        placeholder="Ex: 16"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Qtd *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantidade}
                        onChange={(e) => atualizarItem(index, 'quantidade', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Valor Unit. *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.valor_unitario}
                        onChange={(e) => atualizarItem(index, 'valor_unitario', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        required
                      />
                    </div>

                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Total
                        </label>
                        <input
                          type="text"
                          value={`R$ ${item.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-sm"
                          disabled
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removerItem(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {itens.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhum procedimento adicionado. Clique em "Adicionar Procedimento" para começar.
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Desconto:</span>
                <span className="font-medium text-red-600">- R$ {desconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-primary-600">R$ {valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || itens.length === 0}
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Salvando...' : orcamento ? 'Atualizar' : 'Criar Orçamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalOrcamento
