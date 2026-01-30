-- ============================================
-- DENTALAPP - SCHEMA DO BANCO DE DADOS
-- Sistema de Gestão para Clínica Odontológica
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: usuarios (dentistas e equipe)
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  cro VARCHAR(50),
  especialidade VARCHAR(100),
  telefone VARCHAR(20),
  foto_url TEXT,
  ativo BOOLEAN DEFAULT true,
  role VARCHAR(50) DEFAULT 'dentista', -- dentista, recepcionista, admin
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: pacientes
-- ============================================
CREATE TABLE IF NOT EXISTS pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  rg VARCHAR(20),
  data_nascimento DATE,
  sexo VARCHAR(20),
  telefone VARCHAR(20),
  celular VARCHAR(20),
  email VARCHAR(255),
  cep VARCHAR(10),
  endereco TEXT,
  numero VARCHAR(10),
  complemento VARCHAR(100),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  profissao VARCHAR(100),
  estado_civil VARCHAR(50),
  nome_responsavel VARCHAR(255),
  telefone_responsavel VARCHAR(20),
  convenio VARCHAR(100),
  numero_convenio VARCHAR(100),
  observacoes TEXT,
  foto_url TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: procedimentos (catálogo)
-- ============================================
CREATE TABLE IF NOT EXISTS procedimentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(100), -- restauracao, endodontia, protese, etc
  valor_padrao DECIMAL(10, 2),
  duracao_minutos INTEGER DEFAULT 60,
  cor VARCHAR(20) DEFAULT '#3b82f6',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: agendamentos
-- ============================================
CREATE TABLE IF NOT EXISTS agendamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  dentista_id UUID REFERENCES usuarios(id),
  procedimento_id UUID REFERENCES procedimentos(id),
  data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  duracao_minutos INTEGER DEFAULT 60,
  status VARCHAR(50) DEFAULT 'agendado', -- agendado, confirmado, em_atendimento, concluido, cancelado, faltou
  observacoes TEXT,
  valor DECIMAL(10, 2),
  sala VARCHAR(50),
  lembrete_enviado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: prontuarios
-- ============================================
CREATE TABLE IF NOT EXISTS prontuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  dentista_id UUID REFERENCES usuarios(id),
  agendamento_id UUID REFERENCES agendamentos(id),
  data_atendimento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  anamnese TEXT,
  queixa_principal TEXT,
  historico_medico TEXT,
  alergias TEXT,
  medicamentos_uso TEXT,
  pressao_arterial VARCHAR(20),
  diagnostico TEXT,
  tratamento_realizado TEXT,
  observacoes TEXT,
  dentes_tratados TEXT[], -- array de dentes (ex: ['11', '21', '31'])
  arquivos_anexos JSONB, -- URLs de fotos, raio-x, etc
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: odontograma
-- ============================================
CREATE TABLE IF NOT EXISTS odontograma (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  dente VARCHAR(2) NOT NULL, -- 11 a 48 (notação FDI)
  face VARCHAR(20), -- oclusal, mesial, distal, vestibular, lingual
  condicao VARCHAR(50), -- higido, cariado, restaurado, ausente, implante, etc
  procedimento VARCHAR(100),
  cor VARCHAR(20) DEFAULT '#ef4444',
  observacoes TEXT,
  data_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(paciente_id, dente, face)
);

-- ============================================
-- TABELA: planos_tratamento
-- ============================================
CREATE TABLE IF NOT EXISTS planos_tratamento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  dentista_id UUID REFERENCES usuarios(id),
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  status VARCHAR(50) DEFAULT 'proposto', -- proposto, aprovado, em_andamento, concluido, cancelado
  valor_total DECIMAL(10, 2),
  data_inicio DATE,
  data_conclusao_prevista DATE,
  data_conclusao_real DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: itens_plano_tratamento
-- ============================================
CREATE TABLE IF NOT EXISTS itens_plano_tratamento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plano_id UUID REFERENCES planos_tratamento(id) ON DELETE CASCADE,
  procedimento_id UUID REFERENCES procedimentos(id),
  dente VARCHAR(2),
  descricao TEXT,
  valor DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'pendente', -- pendente, em_andamento, concluido
  ordem INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: pagamentos
-- ============================================
CREATE TABLE IF NOT EXISTS pagamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  agendamento_id UUID REFERENCES agendamentos(id),
  plano_id UUID REFERENCES planos_tratamento(id),
  tipo VARCHAR(50) NOT NULL, -- receita, despesa
  categoria VARCHAR(100), -- consulta, procedimento, material, etc
  descricao TEXT,
  valor DECIMAL(10, 2) NOT NULL,
  forma_pagamento VARCHAR(50), -- dinheiro, cartao_credito, cartao_debito, pix, boleto
  parcelas INTEGER DEFAULT 1,
  parcela_atual INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'pendente', -- pendente, pago, atrasado, cancelado
  data_vencimento DATE,
  data_pagamento DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: arquivos
-- ============================================
CREATE TABLE IF NOT EXISTS arquivos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  prontuario_id UUID REFERENCES prontuarios(id),
  tipo VARCHAR(50), -- foto, raio_x, documento, exame
  nome VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  tamanho_bytes BIGINT,
  mime_type VARCHAR(100),
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX idx_pacientes_nome ON pacientes(nome);
CREATE INDEX idx_pacientes_cpf ON pacientes(cpf);
CREATE INDEX idx_agendamentos_data ON agendamentos(data_hora);
CREATE INDEX idx_agendamentos_paciente ON agendamentos(paciente_id);
CREATE INDEX idx_agendamentos_dentista ON agendamentos(dentista_id);
CREATE INDEX idx_agendamentos_status ON agendamentos(status);
CREATE INDEX idx_prontuarios_paciente ON prontuarios(paciente_id);
CREATE INDEX idx_odontograma_paciente ON odontograma(paciente_id);
CREATE INDEX idx_pagamentos_paciente ON pagamentos(paciente_id);
CREATE INDEX idx_pagamentos_status ON pagamentos(status);
CREATE INDEX idx_pagamentos_vencimento ON pagamentos(data_vencimento);

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pacientes_updated_at BEFORE UPDATE ON pacientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_procedimentos_updated_at BEFORE UPDATE ON procedimentos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agendamentos_updated_at BEFORE UPDATE ON agendamentos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prontuarios_updated_at BEFORE UPDATE ON prontuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_planos_updated_at BEFORE UPDATE ON planos_tratamento
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pagamentos_updated_at BEFORE UPDATE ON pagamentos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DADOS INICIAIS - PROCEDIMENTOS COMUNS
-- ============================================
INSERT INTO procedimentos (nome, categoria, valor_padrao, duracao_minutos, cor) VALUES
('Consulta Inicial', 'consulta', 150.00, 30, '#10b981'),
('Limpeza (Profilaxia)', 'preventiva', 200.00, 45, '#3b82f6'),
('Restauração Simples', 'restauracao', 250.00, 60, '#8b5cf6'),
('Restauração Composta', 'restauracao', 400.00, 90, '#8b5cf6'),
('Tratamento de Canal', 'endodontia', 800.00, 120, '#ef4444'),
('Extração Simples', 'cirurgia', 300.00, 45, '#f59e0b'),
('Extração Complexa', 'cirurgia', 600.00, 90, '#f59e0b'),
('Clareamento Dental', 'estetica', 1200.00, 60, '#ec4899'),
('Coroa Dentária', 'protese', 1500.00, 90, '#6366f1'),
('Implante Dentário', 'implantodontia', 3000.00, 120, '#14b8a6'),
('Aparelho Ortodôntico', 'ortodontia', 2500.00, 60, '#f97316'),
('Manutenção Ortodôntica', 'ortodontia', 200.00, 30, '#f97316'),
('Radiografia Panorâmica', 'diagnostico', 150.00, 15, '#64748b'),
('Aplicação de Flúor', 'preventiva', 80.00, 20, '#10b981')
ON CONFLICT DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS nas tabelas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE prontuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE odontograma ENABLE ROW LEVEL SECURITY;
ALTER TABLE planos_tratamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_plano_tratamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE arquivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedimentos ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajuste conforme necessário)
-- Permitir leitura para usuários autenticados
CREATE POLICY "Permitir leitura para autenticados" ON pacientes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir leitura para autenticados" ON agendamentos
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir leitura para autenticados" ON prontuarios
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir leitura para autenticados" ON procedimentos
    FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir todas operações para usuários autenticados (ajuste conforme necessário)
CREATE POLICY "Permitir todas operações" ON pacientes
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir todas operações" ON agendamentos
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir todas operações" ON prontuarios
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir todas operações" ON odontograma
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir todas operações" ON planos_tratamento
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir todas operações" ON itens_plano_tratamento
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir todas operações" ON pagamentos
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir todas operações" ON arquivos
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- FIM DO SCHEMA
-- ============================================
