-- ============================================
-- DENTALAPP - SCHEMA ATENDIMENTO
-- Módulo completo de Orçamentos e Tratamentos
-- ============================================

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
  status VARCHAR(50) DEFAULT 'pendente', -- pendente, aprovado, rejeitado, expirado
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
  status VARCHAR(50) DEFAULT 'em_andamento', -- em_andamento, concluido, cancelado, pausado
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
  status VARCHAR(50) DEFAULT 'pendente', -- pendente, em_andamento, concluido, cancelado
  prioridade VARCHAR(20) DEFAULT 'normal', -- baixa, normal, alta, urgente
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
  status VARCHAR(50) DEFAULT 'agendada', -- agendada, realizada, cancelada, faltou
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
  status VARCHAR(50) DEFAULT 'realizado', -- realizado, parcial
  gerar_cobranca BOOLEAN DEFAULT true,
  conta_receber_id UUID REFERENCES contas_receber(id) ON DELETE SET NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: procedimentos_padrao
-- ============================================
CREATE TABLE IF NOT EXISTS procedimentos_padrao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  categoria VARCHAR(100),
  valor_sugerido DECIMAL(10, 2),
  duracao_estimada INTEGER, -- em minutos
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
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
-- FUNÇÕES AUXILIARES
-- ============================================

-- Função para calcular valor total do orçamento
CREATE OR REPLACE FUNCTION calcular_valor_orcamento(orcamento_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
  total DECIMAL(10, 2);
BEGIN
  SELECT COALESCE(SUM(valor_total), 0) INTO total
  FROM orcamento_itens
  WHERE orcamento_id = orcamento_uuid;
  
  RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular valor pendente do tratamento
CREATE OR REPLACE FUNCTION calcular_valor_pendente_tratamento(tratamento_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
  total DECIMAL(10, 2);
  pago DECIMAL(10, 2);
BEGIN
  SELECT COALESCE(SUM(tp.valor), 0) INTO total
  FROM tratamento_procedimentos tp
  WHERE tp.tratamento_id = tratamento_uuid;
  
  SELECT COALESCE(SUM(sp.valor), 0) INTO pago
  FROM sessao_procedimentos sp
  JOIN sessoes_tratamento st ON sp.sessao_id = st.id
  WHERE st.tratamento_id = tratamento_uuid AND sp.gerar_cobranca = true;
  
  RETURN total - pago;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamento_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE tratamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tratamento_procedimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes_tratamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessao_procedimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedimentos_padrao ENABLE ROW LEVEL SECURITY;

-- Políticas - permitir todas operações para usuários autenticados
CREATE POLICY "Permitir todas operações" ON orcamentos
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir todas operações" ON orcamento_itens
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir todas operações" ON tratamentos
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir todas operações" ON tratamento_procedimentos
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir todas operações" ON sessoes_tratamento
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir todas operações" ON sessao_procedimentos
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir todas operações" ON procedimentos_padrao
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- DADOS DE TESTE - PROCEDIMENTOS PADRÃO
-- ============================================
INSERT INTO procedimentos_padrao (nome, categoria, valor_sugerido, duracao_estimada, descricao) VALUES
-- Procedimentos Preventivos
('Consulta de Rotina', 'Preventivo', 150.00, 30, 'Consulta odontológica de rotina com exame clínico'),
('Limpeza (Profilaxia)', 'Preventivo', 200.00, 45, 'Limpeza profissional com remoção de tártaro'),
('Aplicação de Flúor', 'Preventivo', 80.00, 15, 'Aplicação tópica de flúor para prevenção de cáries'),
('Selante', 'Preventivo', 120.00, 20, 'Aplicação de selante em dentes permanentes'),

-- Procedimentos Restauradores
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
-- DADOS DE TESTE - EXEMPLO DE ORÇAMENTO
-- ============================================
-- Inserir um orçamento de exemplo (será criado para o primeiro paciente)
DO $$
DECLARE
  v_paciente_id UUID;
  v_orcamento_id UUID;
BEGIN
  -- Pegar o primeiro paciente
  SELECT id INTO v_paciente_id FROM pacientes LIMIT 1;
  
  IF v_paciente_id IS NOT NULL THEN
    -- Criar orçamento
    INSERT INTO orcamentos (paciente_id, data_orcamento, validade, status, observacoes)
    VALUES (
      v_paciente_id,
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '30 days',
      'pendente',
      'Orçamento para tratamento completo'
    )
    RETURNING id INTO v_orcamento_id;
    
    -- Adicionar itens ao orçamento
    INSERT INTO orcamento_itens (orcamento_id, procedimento, dente, quantidade, valor_unitario, valor_total)
    VALUES
      (v_orcamento_id, 'Limpeza (Profilaxia)', NULL, 1, 200.00, 200.00),
      (v_orcamento_id, 'Restauração Composta', '16', 1, 350.00, 350.00),
      (v_orcamento_id, 'Restauração Composta', '26', 1, 350.00, 350.00);
    
    -- Atualizar valor total do orçamento
    UPDATE orcamentos 
    SET valor_total = calcular_valor_orcamento(v_orcamento_id),
        valor_final = calcular_valor_orcamento(v_orcamento_id)
    WHERE id = v_orcamento_id;
  END IF;
END $$;
