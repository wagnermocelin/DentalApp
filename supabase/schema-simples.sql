-- ============================================
-- DENTALAPP - SCHEMA SIMPLIFICADO
-- Para testar localmente
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: pacientes
-- ============================================
CREATE TABLE IF NOT EXISTS pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14),
  data_nascimento DATE,
  telefone VARCHAR(20),
  email VARCHAR(255),
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: agendamentos
-- ============================================
CREATE TABLE IF NOT EXISTS agendamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  paciente_nome VARCHAR(255),
  data DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  procedimento VARCHAR(255) NOT NULL,
  observacoes TEXT,
  status VARCHAR(50) DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: prontuarios
-- ============================================
CREATE TABLE IF NOT EXISTS prontuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  procedimento VARCHAR(255) NOT NULL,
  dente VARCHAR(10),
  descricao TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: pagamentos
-- ============================================
CREATE TABLE IF NOT EXISTS pagamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  forma_pagamento VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pendente',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX idx_pacientes_nome ON pacientes(nome);
CREATE INDEX idx_agendamentos_data ON agendamentos(data);
CREATE INDEX idx_agendamentos_paciente ON agendamentos(paciente_id);
CREATE INDEX idx_prontuarios_paciente ON prontuarios(paciente_id);
CREATE INDEX idx_pagamentos_paciente ON pagamentos(paciente_id);
CREATE INDEX idx_pagamentos_status ON pagamentos(status);

-- ============================================
-- FUNÇÃO PARA ATUALIZAR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_pacientes_updated_at BEFORE UPDATE ON pacientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agendamentos_updated_at BEFORE UPDATE ON agendamentos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prontuarios_updated_at BEFORE UPDATE ON prontuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pagamentos_updated_at BEFORE UPDATE ON pagamentos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE prontuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;

-- Políticas - permitir todas operações para usuários autenticados
CREATE POLICY "Permitir todas operações" ON pacientes
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir todas operações" ON agendamentos
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir todas operações" ON prontuarios
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir todas operações" ON pagamentos
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- DADOS DE TESTE
-- ============================================
-- Inserir alguns pacientes de exemplo
INSERT INTO pacientes (nome, cpf, data_nascimento, telefone, email, cidade, estado) VALUES
('João Silva', '123.456.789-00', '1985-05-15', '(11) 98765-4321', 'joao@email.com', 'São Paulo', 'SP'),
('Maria Santos', '987.654.321-00', '1990-08-22', '(11) 91234-5678', 'maria@email.com', 'São Paulo', 'SP'),
('Pedro Oliveira', '456.789.123-00', '1978-12-10', '(11) 99876-5432', 'pedro@email.com', 'São Paulo', 'SP')
ON CONFLICT DO NOTHING;
