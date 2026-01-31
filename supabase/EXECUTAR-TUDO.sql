-- ============================================
-- DENTALAPP - SCHEMA COMPLETO
-- Atendimento + Financeiro + Categorias
-- Execute este SQL ÚNICO no Supabase
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- MÓDULO FINANCEIRO
-- ============================================

-- TABELA: contas_receber
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

-- TABELA: contas_pagar
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

-- TABELA: categorias_financeiras
CREATE TABLE IF NOT EXISTS categorias_financeiras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(20) NOT NULL,
  cor VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MÓDULO ATENDIMENTO
-- ============================================

-- TABELA: procedimentos_padrao
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

-- TABELA: orcamentos
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

-- TABELA: orcamento_itens
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

-- TABELA: tratamentos
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

-- TABELA: tratamento_procedimentos
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

-- TABELA: sessoes_tratamento
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

-- TABELA: sessao_procedimentos (COM FOREIGN KEY PARA CONTAS_RECEBER)
CREATE TABLE IF NOT EXISTS sessao_procedimentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sessao_id UUID REFERENCES sessoes_tratamento(id) ON DELETE CASCADE,
  tratamento_procedimento_id UUID REFERENCES tratamento_procedimentos(id) ON DELETE CASCADE,
  procedimento VARCHAR(255) NOT NULL,
  dente VARCHAR(10),
  valor DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'realizado',
  gerar_cobranca BOOLEAN DEFAULT true,
  conta_receber_id UUID REFERENCES contas_receber(id) ON DELETE SET NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELAS: RECEITAS E ATESTADOS
-- ============================================

-- TABELA: receitas
CREATE TABLE IF NOT EXISTS receitas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  tratamento_id UUID REFERENCES tratamentos(id) ON DELETE SET NULL,
  data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
  medicamentos TEXT NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: atestados
CREATE TABLE IF NOT EXISTS atestados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  tratamento_id UUID REFERENCES tratamentos(id) ON DELETE SET NULL,
  data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  dias INTEGER NOT NULL,
  cid VARCHAR(10),
  motivo TEXT NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELAS: USUÁRIOS E DENTISTAS
-- ============================================

-- TABELA: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('dentista', 'administrativo', 'admin')),
  ativo BOOLEAN DEFAULT true,
  cro VARCHAR(20),
  especialidade VARCHAR(255),
  telefone VARCHAR(20),
  endereco TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar campos de dentista nas receitas e atestados
ALTER TABLE receitas ADD COLUMN IF NOT EXISTS dentista_id UUID REFERENCES usuarios(id) ON DELETE SET NULL;
ALTER TABLE atestados ADD COLUMN IF NOT EXISTS dentista_id UUID REFERENCES usuarios(id) ON DELETE SET NULL;

-- Adicionar campo de dentista em agendamentos (se a tabela existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'agendamentos') THEN
    ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS dentista_id UUID REFERENCES usuarios(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================
-- ÍNDICES
-- ============================================

-- Financeiro
CREATE INDEX IF NOT EXISTS idx_contas_receber_paciente ON contas_receber(paciente_id);
CREATE INDEX IF NOT EXISTS idx_contas_receber_status ON contas_receber(status);
CREATE INDEX IF NOT EXISTS idx_contas_receber_vencimento ON contas_receber(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_status ON contas_pagar(status);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_vencimento ON contas_pagar(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_fornecedor ON contas_pagar(fornecedor);

-- Atendimento
CREATE INDEX IF NOT EXISTS idx_orcamentos_paciente ON orcamentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_status ON orcamentos(status);
CREATE INDEX IF NOT EXISTS idx_orcamento_itens_orcamento ON orcamento_itens(orcamento_id);
CREATE INDEX IF NOT EXISTS idx_tratamentos_paciente ON tratamentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_tratamentos_status ON tratamentos(status);
CREATE INDEX IF NOT EXISTS idx_tratamento_procedimentos_tratamento ON tratamento_procedimentos(tratamento_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_tratamento ON sessoes_tratamento(tratamento_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_agendamento ON sessoes_tratamento(agendamento_id);
CREATE INDEX IF NOT EXISTS idx_sessao_procedimentos_sessao ON sessao_procedimentos(sessao_id);

-- Receitas e Atestados
CREATE INDEX IF NOT EXISTS idx_receitas_paciente ON receitas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_receitas_tratamento ON receitas(tratamento_id);
CREATE INDEX IF NOT EXISTS idx_receitas_dentista ON receitas(dentista_id);
CREATE INDEX IF NOT EXISTS idx_atestados_paciente ON atestados(paciente_id);
CREATE INDEX IF NOT EXISTS idx_atestados_tratamento ON atestados(tratamento_id);
CREATE INDEX IF NOT EXISTS idx_atestados_dentista ON atestados(dentista_id);

-- Usuários
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_user ON usuarios(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);

-- Agendamentos (se a tabela existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'agendamentos') THEN
    CREATE INDEX IF NOT EXISTS idx_agendamentos_dentista ON agendamentos(dentista_id);
  END IF;
END $$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Financeiro
DROP TRIGGER IF EXISTS update_contas_receber_updated_at ON contas_receber;
CREATE TRIGGER update_contas_receber_updated_at BEFORE UPDATE ON contas_receber
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contas_pagar_updated_at ON contas_pagar;
CREATE TRIGGER update_contas_pagar_updated_at BEFORE UPDATE ON contas_pagar
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Atendimento
DROP TRIGGER IF EXISTS update_orcamentos_updated_at ON orcamentos;
CREATE TRIGGER update_orcamentos_updated_at BEFORE UPDATE ON orcamentos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tratamentos_updated_at ON tratamentos;
CREATE TRIGGER update_tratamentos_updated_at BEFORE UPDATE ON tratamentos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tratamento_procedimentos_updated_at ON tratamento_procedimentos;
CREATE TRIGGER update_tratamento_procedimentos_updated_at BEFORE UPDATE ON tratamento_procedimentos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessoes_tratamento_updated_at ON sessoes_tratamento;
CREATE TRIGGER update_sessoes_tratamento_updated_at BEFORE UPDATE ON sessoes_tratamento
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Receitas e Atestados
DROP TRIGGER IF EXISTS update_receitas_updated_at ON receitas;
CREATE TRIGGER update_receitas_updated_at BEFORE UPDATE ON receitas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_atestados_updated_at ON atestados;
CREATE TRIGGER update_atestados_updated_at BEFORE UPDATE ON atestados
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Usuários
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Financeiro
ALTER TABLE contas_receber ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_pagar ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_financeiras ENABLE ROW LEVEL SECURITY;

-- Atendimento
ALTER TABLE procedimentos_padrao ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamento_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE tratamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tratamento_procedimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes_tratamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessao_procedimentos ENABLE ROW LEVEL SECURITY;

-- Receitas e Atestados
ALTER TABLE receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE atestados ENABLE ROW LEVEL SECURITY;

-- Usuários
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS
-- ============================================

-- Financeiro
DROP POLICY IF EXISTS "Permitir todas operações" ON contas_receber;
CREATE POLICY "Permitir todas operações" ON contas_receber
    FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir todas operações" ON contas_pagar;
CREATE POLICY "Permitir todas operações" ON contas_pagar
    FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir todas operações" ON categorias_financeiras;
CREATE POLICY "Permitir todas operações" ON categorias_financeiras
    FOR ALL USING (auth.role() = 'authenticated');

-- Atendimento
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

-- Receitas e Atestados
DROP POLICY IF EXISTS "Permitir todas operações" ON receitas;
CREATE POLICY "Permitir todas operações" ON receitas
    FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir todas operações" ON atestados;
CREATE POLICY "Permitir todas operações" ON atestados
    FOR ALL USING (auth.role() = 'authenticated');

-- Usuários
DROP POLICY IF EXISTS "Permitir leitura para autenticados" ON usuarios;
CREATE POLICY "Permitir leitura para autenticados" ON usuarios
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir todas operações" ON usuarios;
CREATE POLICY "Permitir todas operações" ON usuarios
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- DADOS - CATEGORIAS FINANCEIRAS
-- ============================================
INSERT INTO categorias_financeiras (nome, tipo, cor) VALUES
-- Receitas
('Consulta', 'receita', '#10b981'),
('Limpeza', 'receita', '#3b82f6'),
('Restauração', 'receita', '#8b5cf6'),
('Ortodontia', 'receita', '#f59e0b'),
('Implante', 'receita', '#ef4444'),
('Clareamento', 'receita', '#06b6d4'),
('Tratamento', 'receita', '#6366f1'),
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
-- DADOS - USUÁRIO ADMIN PADRÃO
-- ============================================
INSERT INTO usuarios (nome, email, tipo, ativo) VALUES
('Administrador', 'teste@dentalapp.com', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
SELECT 
  'contas_receber' as tabela, 
  COUNT(*) as total 
FROM contas_receber
UNION ALL
SELECT 
  'contas_pagar' as tabela, 
  COUNT(*) as total 
FROM contas_pagar
UNION ALL
SELECT 
  'categorias_financeiras' as tabela, 
  COUNT(*) as total 
FROM categorias_financeiras
UNION ALL
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
