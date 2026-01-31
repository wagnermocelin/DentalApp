import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { X, Printer, Save } from 'lucide-react'

const ModalAtestado = ({ paciente, tratamento, onClose, onSave }) => {
  const [loading, setLoading] = useState(false)
  const printRef = useRef()
  
  const [formData, setFormData] = useState({
    data_emissao: new Date().toISOString().split('T')[0],
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: new Date().toISOString().split('T')[0],
    dias: 1,
    cid: '',
    motivo: '',
    observacoes: ''
  })

  useEffect(() => {
    calcularDias()
  }, [formData.data_inicio, formData.data_fim])

  const calcularDias = () => {
    if (formData.data_inicio && formData.data_fim) {
      const inicio = new Date(formData.data_inicio + 'T00:00:00')
      const fim = new Date(formData.data_fim + 'T00:00:00')
      const diffTime = Math.abs(fim - inicio)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      setFormData(prev => ({ ...prev, dias: diffDays }))
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleSave = async () => {
    if (!formData.motivo.trim()) {
      alert('Preencha o motivo do atestado')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.from('atestados').insert([{
        paciente_id: paciente.id,
        tratamento_id: tratamento?.id || null,
        data_emissao: formData.data_emissao,
        data_inicio: formData.data_inicio,
        data_fim: formData.data_fim,
        dias: formData.dias,
        cid: formData.cid || null,
        motivo: formData.motivo,
        observacoes: formData.observacoes || null
      }])

      if (error) throw error

      alert('Atestado salvo com sucesso!')
      if (onSave) onSave()
    } catch (error) {
      console.error('Erro ao salvar atestado:', error)
      alert('Erro ao salvar atestado: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAndPrint = async () => {
    await handleSave()
    setTimeout(() => handlePrint(), 500)
  }

  const extensoDias = (dias) => {
    const extenso = {
      1: 'um', 2: 'dois', 3: 'três', 4: 'quatro', 5: 'cinco',
      6: 'seis', 7: 'sete', 8: 'oito', 9: 'nove', 10: 'dez',
      11: 'onze', 12: 'doze', 13: 'treze', 14: 'quatorze', 15: 'quinze',
      16: 'dezesseis', 17: 'dezessete', 18: 'dezoito', 19: 'dezenove', 20: 'vinte',
      21: 'vinte e um', 22: 'vinte e dois', 23: 'vinte e três', 24: 'vinte e quatro',
      25: 'vinte e cinco', 26: 'vinte e seis', 27: 'vinte e sete', 28: 'vinte e oito',
      29: 'vinte e nove', 30: 'trinta'
    }
    return extenso[dias] || dias
  }

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10 no-print">
            <h2 className="text-2xl font-bold text-gray-800">Atestado Odontológico</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Formulário de Edição */}
            <div className="space-y-4 no-print">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Emissão
                  </label>
                  <input
                    type="date"
                    value={formData.data_emissao}
                    onChange={(e) => setFormData({ ...formData, data_emissao: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Início do Afastamento *
                  </label>
                  <input
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Fim do Afastamento *
                  </label>
                  <input
                    type="date"
                    value={formData.data_fim}
                    onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dias de Afastamento
                  </label>
                  <input
                    type="number"
                    value={formData.dias}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CID (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.cid}
                    onChange={(e) => setFormData({ ...formData, cid: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ex: K04.7"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo do Atestado *
                </label>
                <textarea
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="3"
                  placeholder="Ex: Procedimento odontológico (extração dentária)"
                  required
                />
              </div>

              <div>
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

            {/* Preview para Impressão */}
            <div ref={printRef} className="print-area border-2 border-gray-300 rounded-lg p-8 bg-white">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">ATESTADO ODONTOLÓGICO</h1>
                <div className="text-sm text-gray-600">
                  <p>Dr(a). Nome do Dentista</p>
                  <p>CRO: 12345</p>
                  <p>Endereço da Clínica</p>
                  <p>Telefone: (00) 0000-0000</p>
                </div>
              </div>

              <div className="mb-8 text-justify leading-relaxed">
                <p className="mb-4">
                  Atesto para os devidos fins que o(a) paciente <strong>{paciente.nome}</strong>,
                  {paciente.cpf && ` CPF ${paciente.cpf},`} esteve sob meus cuidados profissionais
                  e necessita de afastamento de suas atividades habituais pelo período de{' '}
                  <strong>{extensoDias(formData.dias)} ({formData.dias})</strong> dia(s),
                  no período de{' '}
                  <strong>{new Date(formData.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR')}</strong>
                  {' '}a{' '}
                  <strong>{new Date(formData.data_fim + 'T00:00:00').toLocaleDateString('pt-BR')}</strong>.
                </p>

                {formData.motivo && (
                  <p className="mb-4">
                    <strong>Motivo:</strong> {formData.motivo}
                  </p>
                )}

                {formData.cid && (
                  <p className="mb-4">
                    <strong>CID:</strong> {formData.cid}
                  </p>
                )}

                {formData.observacoes && (
                  <p className="mb-4 text-sm italic">
                    <strong>Observações:</strong> {formData.observacoes}
                  </p>
                )}
              </div>

              <div className="mt-16 text-right">
                <p className="text-sm text-gray-600 mb-8">
                  {new Date(formData.data_emissao + 'T00:00:00').toLocaleDateString('pt-BR', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
                <div className="inline-block">
                  <div className="border-t-2 border-gray-800 w-64 mb-2"></div>
                  <p className="text-sm text-gray-700">Assinatura e Carimbo do Dentista</p>
                  <p className="text-xs text-gray-600 mt-1">CRO: 12345</p>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-3 pt-4 border-t no-print">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save size={20} />
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Printer size={20} />
                Imprimir
              </button>
              <button
                type="button"
                onClick={handleSaveAndPrint}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save size={20} />
                <Printer size={20} />
                Salvar e Imprimir
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ModalAtestado
