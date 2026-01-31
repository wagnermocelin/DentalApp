-- ============================================
-- DENTALAPP - RECEITAS E ATESTADOS
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

-- Índices
CREATE INDEX IF NOT EXISTS idx_receitas_paciente ON receitas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_receitas_tratamento ON receitas(tratamento_id);
CREATE INDEX IF NOT EXISTS idx_atestados_paciente ON atestados(paciente_id);
CREATE INDEX IF NOT EXISTS idx_atestados_tratamento ON atestados(tratamento_id);

-- Triggers
DROP TRIGGER IF EXISTS update_receitas_updated_at ON receitas;
CREATE TRIGGER update_receitas_updated_at BEFORE UPDATE ON receitas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_atestados_updated_at ON atestados;
CREATE TRIGGER update_atestados_updated_at BEFORE UPDATE ON atestados
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE atestados ENABLE ROW LEVEL SECURITY;

-- Políticas
DROP POLICY IF EXISTS "Permitir todas operações" ON receitas;
CREATE POLICY "Permitir todas operações" ON receitas
    FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir todas operações" ON atestados;
CREATE POLICY "Permitir todas operações" ON atestados
    FOR ALL USING (auth.role() = 'authenticated');
