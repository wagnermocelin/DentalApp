-- ============================================
-- DENTALAPP - SCHEMA FINANCEIRO COMPLETO
-- Contas a Pagar e Contas a Receber
-- ============================================

-- ============================================
-- TABELA: contas_receber
-- ============================================
CREATE TABLE IF NOT EXISTS contas_receber (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_recebimento DATE,
  forma_recebimento VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pendente',
  categoria VARCHAR(100),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: contas_pagar
-- ============================================
CREATE TABLE IF NOT EXISTS contas_pagar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fornecedor VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  forma_pagamento VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pendente',
  categoria VARCHAR(100),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: categorias_financeiras
-- ============================================
CREATE TABLE IF NOT EXISTS categorias_financeiras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(20) NOT NULL, -- 'receita' ou 'despesa'
  cor VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_contas_receber_paciente ON contas_receber(paciente_id);
CREATE INDEX IF NOT EXISTS idx_contas_receber_status ON contas_receber(status);
CREATE INDEX IF NOT EXISTS idx_contas_receber_vencimento ON contas_receber(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_status ON contas_pagar(status);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_vencimento ON contas_pagar(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_fornecedor ON contas_pagar(fornecedor);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_contas_receber_updated_at BEFORE UPDATE ON contas_receber
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contas_pagar_updated_at BEFORE UPDATE ON contas_pagar
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE contas_receber ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_pagar ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_financeiras ENABLE ROW LEVEL SECURITY;

-- Políticas - permitir todas operações para usuários autenticados
CREATE POLICY "Permitir todas operações" ON contas_receber
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir todas operações" ON contas_pagar
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir todas operações" ON categorias_financeiras
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- DADOS DE TESTE - CATEGORIAS
-- ============================================
INSERT INTO categorias_financeiras (nome, tipo, cor) VALUES
-- Receitas
('Consulta', 'receita', '#10b981'),
('Limpeza', 'receita', '#3b82f6'),
('Restauração', 'receita', '#8b5cf6'),
('Ortodontia', 'receita', '#f59e0b'),
('Implante', 'receita', '#ef4444'),
('Clareamento', 'receita', '#06b6d4'),
('Outros Serviços', 'receita', '#6366f1'),

-- Despesas
('Aluguel', 'despesa', '#dc2626'),
('Energia', 'despesa', '#ea580c'),
('Água', 'despesa', '#0891b2'),
('Internet/Telefone', 'despesa', '#7c3aed'),
('Material Odontológico', 'despesa', '#db2777'),
('Equipamentos', 'despesa', '#65a30d'),
('Salários', 'despesa', '#0284c7'),
('Impostos', 'despesa', '#be123c'),
('Manutenção', 'despesa', '#ca8a04'),
('Marketing', 'despesa', '#9333ea'),
('Outros', 'despesa', '#64748b')
ON CONFLICT DO NOTHING;

-- ============================================
-- DADOS DE TESTE - CONTAS A RECEBER
-- ============================================
INSERT INTO contas_receber (paciente_id, descricao, valor, data_vencimento, status, categoria) 
SELECT 
    p.id,
    'Consulta de rotina',
    150.00,
    CURRENT_DATE + INTERVAL '5 days',
    'pendente',
    'Consulta'
FROM pacientes p
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO contas_receber (paciente_id, descricao, valor, data_vencimento, data_recebimento, forma_recebimento, status, categoria) 
SELECT 
    p.id,
    'Limpeza dental',
    200.00,
    CURRENT_DATE - INTERVAL '2 days',
    CURRENT_DATE,
    'pix',
    'pago',
    'Limpeza'
FROM pacientes p
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================
-- DADOS DE TESTE - CONTAS A PAGAR
-- ============================================
INSERT INTO contas_pagar (fornecedor, descricao, valor, data_vencimento, status, categoria) VALUES
('Imobiliária XYZ', 'Aluguel do consultório - Janeiro', 3500.00, CURRENT_DATE + INTERVAL '10 days', 'pendente', 'Aluguel'),
('Dental Supply', 'Material odontológico', 1200.00, CURRENT_DATE + INTERVAL '15 days', 'pendente', 'Material Odontológico'),
('Energia Elétrica', 'Conta de luz - Janeiro', 450.00, CURRENT_DATE + INTERVAL '5 days', 'pendente', 'Energia'),
('Companhia de Água', 'Conta de água - Janeiro', 180.00, CURRENT_DATE - INTERVAL '2 days', 'atrasado', 'Água'),
('Telecom Brasil', 'Internet e telefone', 250.00, CURRENT_DATE + INTERVAL '20 days', 'pendente', 'Internet/Telefone')
ON CONFLICT DO NOTHING;
