import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { X, Printer, Save } from 'lucide-react'

const ModalReceita = ({ paciente, tratamento, onClose, onSave }) => {
  const [loading, setLoading] = useState(false)
  const printRef = useRef()
  
  const [formData, setFormData] = useState({
    data_emissao: new Date().toISOString().split('T')[0],
    medicamentos: '',
    observacoes: ''
  })

  const handlePrint = () => {
    window.print()
  }

  const handleSave = async () => {
    if (!formData.medicamentos.trim()) {
      alert('Preencha os medicamentos prescritos')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.from('receitas').insert([{
        paciente_id: paciente.id,
        tratamento_id: tratamento?.id || null,
        data_emissao: formData.data_emissao,
        medicamentos: formData.medicamentos,
        observacoes: formData.observacoes || null
      }])

      if (error) throw error

      alert('Receita salva com sucesso!')
      if (onSave) onSave()
    } catch (error) {
      console.error('Erro ao salvar receita:', error)
      alert('Erro ao salvar receita: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAndPrint = async () => {
    await handleSave()
    setTimeout(() => handlePrint(), 500)
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
            <h2 className="text-2xl font-bold text-gray-800">Receita Médica</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Formulário de Edição */}
            <div className="space-y-4 no-print">
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
                  Medicamentos Prescritos *
                </label>
                <textarea
                  value={formData.medicamentos}
                  onChange={(e) => setFormData({ ...formData, medicamentos: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                  rows="10"
                  placeholder="Exemplo:&#10;&#10;1. Amoxicilina 500mg&#10;   Tomar 1 cápsula de 8 em 8 horas por 7 dias&#10;&#10;2. Ibuprofeno 600mg&#10;   Tomar 1 comprimido de 8 em 8 horas se dor (máximo 3 dias)"
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
                  rows="3"
                  placeholder="Observações adicionais..."
                />
              </div>
            </div>

            {/* Preview para Impressão */}
            <div ref={printRef} className="print-area border-2 border-gray-300 rounded-lg p-8 bg-white">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">RECEITA ODONTOLÓGICA</h1>
                <div className="text-sm text-gray-600">
                  <p>Dr(a). Nome do Dentista</p>
                  <p>CRO: 12345</p>
                  <p>Endereço da Clínica</p>
                  <p>Telefone: (00) 0000-0000</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  <strong>Data:</strong> {new Date(formData.data_emissao + 'T00:00:00').toLocaleDateString('pt-BR')}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Paciente:</strong> {paciente.nome}
                </p>
              </div>

              <div className="mb-8">
                <p className="text-sm font-semibold text-gray-700 mb-3">Prescrição:</p>
                <div className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed border-l-4 border-primary-500 pl-4">
                  {formData.medicamentos || 'Nenhum medicamento prescrito'}
                </div>
              </div>

              {formData.observacoes && (
                <div className="mb-8">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Observações:</p>
                  <p className="text-sm text-gray-600 italic">{formData.observacoes}</p>
                </div>
              )}

              <div className="mt-16 pt-8 border-t border-gray-300">
                <div className="text-center">
                  <div className="inline-block">
                    <div className="border-t-2 border-gray-800 w-64 mb-2"></div>
                    <p className="text-sm text-gray-700">Assinatura e Carimbo do Dentista</p>
                  </div>
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

export default ModalReceita
