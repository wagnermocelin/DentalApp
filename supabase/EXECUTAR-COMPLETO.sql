-- ============================================
-- DENTALAPP - SCHEMA COMPLETO DE ATENDIMENTO
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: procedimentos_padrao
-- ============================================
CREATE TABLE IF NOT EXISTS procedimentos_padrao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  categoria VARCHAR(100),
  valor_sugerido DECIMAL(10, 2),
  duracao_estimada INTEGER,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: orcamentos
-- ============================================
CREATE TABLE IF NOT EXISTS orcamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  data_orcamento DATE NOT NULL DEFAULT CURRENT_DATE,
  validade DATE,
  valor_total DECIMAL(10, 2) DEFAULT 0,
  desconto DECIMAL(10, 2) DEFAULT 0,
  valor_final DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pendente',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: orcamento_itens
-- ============================================
CREATE TABLE IF NOT EXISTS orcamento_itens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orcamento_id UUID REFERENCES orcamentos(id) ON DELETE CASCADE,
  procedimento VARCHAR(255) NOT NULL,
  dente VARCHAR(10),
  quantidade INTEGER DEFAULT 1,
  valor_unitario DECIMAL(10, 2) NOT NULL,
  valor_total DECIMAL(10, 2) NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: tratamentos
-- ============================================
CREATE TABLE IF NOT EXISTS tratamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orcamento_id UUID REFERENCES orcamentos(id) ON DELETE SET NULL,
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_previsao_termino DATE,
  data_termino DATE,
  valor_total DECIMAL(10, 2) DEFAULT 0,
  valor_pago DECIMAL(10, 2) DEFAULT 0,
  valor_pendente DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'em_andamento',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: tratamento_procedimentos
-- ============================================
CREATE TABLE IF NOT EXISTS tratamento_procedimentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tratamento_id UUID REFERENCES tratamentos(id) ON DELETE CASCADE,
  procedimento VARCHAR(255) NOT NULL,
  dente VARCHAR(10),
  valor DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pendente',
  prioridade VARCHAR(20) DEFAULT 'normal',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: sessoes_tratamento
-- ============================================
CREATE TABLE IF NOT EXISTS sessoes_tratamento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tratamento_id UUID REFERENCES tratamentos(id) ON DELETE CASCADE,
  agendamento_id UUID REFERENCES agendamentos(id) ON DELETE SET NULL,
  data_sessao DATE NOT NULL,
  hora_inicio TIME,
  hora_fim TIME,
  numero_sessao INTEGER,
  status VARCHAR(50) DEFAULT 'agendada',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: sessao_procedimentos
-- ============================================
CREATE TABLE IF NOT EXISTS sessao_procedimentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sessao_id UUID REFERENCES sessoes_tratamento(id) ON DELETE CASCADE,
  tratamento_procedimento_id UUID REFERENCES tratamento_procedimentos(id) ON DELETE CASCADE,
  procedimento VARCHAR(255) NOT NULL,
  dente VARCHAR(10),
  valor DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'realizado',
  gerar_cobranca BOOLEAN DEFAULT true,
  conta_receber_id UUID,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_orcamentos_paciente ON orcamentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_status ON orcamentos(status);
CREATE INDEX IF NOT EXISTS idx_orcamento_itens_orcamento ON orcamento_itens(orcamento_id);
CREATE INDEX IF NOT EXISTS idx_tratamentos_paciente ON tratamentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_tratamentos_status ON tratamentos(status);
CREATE INDEX IF NOT EXISTS idx_tratamento_procedimentos_tratamento ON tratamento_procedimentos(tratamento_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_tratamento ON sessoes_tratamento(tratamento_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_agendamento ON sessoes_tratamento(agendamento_id);
CREATE INDEX IF NOT EXISTS idx_sessao_procedimentos_sessao ON sessao_procedimentos(sessao_id);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_orcamentos_updated_at BEFORE UPDATE ON orcamentos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tratamentos_updated_at BEFORE UPDATE ON tratamentos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tratamento_procedimentos_updated_at BEFORE UPDATE ON tratamento_procedimentos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessoes_tratamento_updated_at BEFORE UPDATE ON sessoes_tratamento
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE procedimentos_padrao ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamento_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE tratamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tratamento_procedimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes_tratamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessao_procedimentos ENABLE ROW LEVEL SECURITY;

-- Políticas - permitir todas operações para usuários autenticados
DROP POLICY IF EXISTS "Permitir todas operações" ON procedimentos_padrao;
CREATE POLICY "Permitir todas operações" ON procedimentos_padrao
    FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir todas operações" ON orcamentos;
CREATE POLICY "Permitir todas operações" ON orcamentos
    FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir todas operações" ON orcamento_itens;
CREATE POLICY "Permitir todas operações" ON orcamento_itens
    FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir todas operações" ON tratamentos;
CREATE POLICY "Permitir todas operações" ON tratamentos
    FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir todas operações" ON tratamento_procedimentos;
CREATE POLICY "Permitir todas operações" ON tratamento_procedimentos
    FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir todas operações" ON sessoes_tratamento;
CREATE POLICY "Permitir todas operações" ON sessoes_tratamento
    FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir todas operações" ON sessao_procedimentos;
CREATE POLICY "Permitir todas operações" ON sessao_procedimentos
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- DADOS - PROCEDIMENTOS PADRÃO
-- ============================================
INSERT INTO procedimentos_padrao (nome, categoria, valor_sugerido, duracao_estimada, descricao) VALUES
-- Preventivos
('Consulta de Rotina', 'Preventivo', 150.00, 30, 'Consulta odontológica de rotina com exame clínico'),
('Limpeza (Profilaxia)', 'Preventivo', 200.00, 45, 'Limpeza profissional com remoção de tártaro'),
('Aplicação de Flúor', 'Preventivo', 80.00, 15, 'Aplicação tópica de flúor para prevenção de cáries'),
('Selante', 'Preventivo', 120.00, 20, 'Aplicação de selante em dentes permanentes'),

-- Restauradores
('Restauração Simples', 'Restaurador', 250.00, 45, 'Restauração em resina composta - 1 face'),
('Restauração Composta', 'Restaurador', 350.00, 60, 'Restauração em resina composta - 2 ou mais faces'),
('Restauração em Amálgama', 'Restaurador', 200.00, 45, 'Restauração em amálgama de prata'),

-- Endodontia
('Tratamento de Canal - Anterior', 'Endodontia', 800.00, 90, 'Tratamento endodôntico em dente anterior'),
('Tratamento de Canal - Pré-Molar', 'Endodontia', 1000.00, 120, 'Tratamento endodôntico em pré-molar'),
('Tratamento de Canal - Molar', 'Endodontia', 1500.00, 150, 'Tratamento endodôntico em molar'),

-- Cirurgia
('Extração Simples', 'Cirurgia', 300.00, 30, 'Extração dentária simples'),
('Extração Complexa', 'Cirurgia', 500.00, 60, 'Extração dentária complexa ou inclusa'),
('Extração de Siso', 'Cirurgia', 600.00, 60, 'Extração de terceiro molar (siso)'),

-- Prótese
('Coroa Provisória', 'Prótese', 200.00, 45, 'Confecção de coroa provisória'),
('Coroa em Porcelana', 'Prótese', 1500.00, 60, 'Coroa em porcelana pura'),
('Coroa Metalocerâmica', 'Prótese', 1200.00, 60, 'Coroa em metalocerâmica'),
('Prótese Parcial Removível', 'Prótese', 2500.00, 90, 'Prótese parcial removível'),
('Prótese Total', 'Prótese', 3500.00, 120, 'Prótese total (dentadura)'),

-- Ortodontia
('Documentação Ortodôntica', 'Ortodontia', 500.00, 60, 'Documentação completa para ortodontia'),
('Instalação de Aparelho', 'Ortodontia', 1500.00, 90, 'Instalação de aparelho ortodôntico fixo'),
('Manutenção Ortodôntica', 'Ortodontia', 300.00, 30, 'Manutenção mensal do aparelho'),

-- Estética
('Clareamento Dental', 'Estética', 800.00, 60, 'Clareamento dental em consultório'),
('Faceta em Resina', 'Estética', 600.00, 60, 'Faceta estética em resina composta'),
('Faceta em Porcelana', 'Estética', 2000.00, 90, 'Faceta estética em porcelana'),

-- Implantodontia
('Implante Dentário', 'Implante', 3000.00, 120, 'Instalação de implante dentário'),
('Enxerto Ósseo', 'Implante', 2000.00, 90, 'Enxerto ósseo para implante'),

-- Periodontia
('Raspagem Periodontal', 'Periodontia', 400.00, 60, 'Raspagem e alisamento radicular por quadrante'),
('Cirurgia Periodontal', 'Periodontia', 1000.00, 90, 'Cirurgia periodontal para tratamento de bolsas')
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
SELECT 
  'procedimentos_padrao' as tabela, 
  COUNT(*) as total 
FROM procedimentos_padrao
UNION ALL
SELECT 
  'orcamentos' as tabela, 
  COUNT(*) as total 
FROM orcamentos
UNION ALL
SELECT 
  'tratamentos' as tabela, 
  COUNT(*) as total 
FROM tratamentos;
