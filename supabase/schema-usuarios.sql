-- ============================================
-- DENTALAPP - USUÁRIOS E DENTISTAS
-- ============================================

-- TABELA: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('dentista', 'administrativo', 'admin')),
  ativo BOOLEAN DEFAULT true,
  
  -- Campos específicos para dentistas
  cro VARCHAR(20),
  especialidade VARCHAR(255),
  telefone VARCHAR(20),
  endereco TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_user ON usuarios(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);

-- Trigger
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas
DROP POLICY IF EXISTS "Permitir leitura para autenticados" ON usuarios;
CREATE POLICY "Permitir leitura para autenticados" ON usuarios
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir todas operações para admin" ON usuarios;
CREATE POLICY "Permitir todas operações para admin" ON usuarios
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM usuarios 
        WHERE auth_user_id = auth.uid() 
        AND tipo = 'admin'
      )
    );

DROP POLICY IF EXISTS "Permitir atualização própria" ON usuarios;
CREATE POLICY "Permitir atualização própria" ON usuarios
    FOR UPDATE USING (auth_user_id = auth.uid());

-- Atualizar tabelas de receitas e atestados para incluir dentista
ALTER TABLE receitas ADD COLUMN IF NOT EXISTS dentista_id UUID REFERENCES usuarios(id) ON DELETE SET NULL;
ALTER TABLE atestados ADD COLUMN IF NOT EXISTS dentista_id UUID REFERENCES usuarios(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_receitas_dentista ON receitas(dentista_id);
CREATE INDEX IF NOT EXISTS idx_atestados_dentista ON atestados(dentista_id);

-- Inserir usuário admin padrão (vinculado ao usuário de teste)
-- Nota: Você precisará atualizar o auth_user_id com o UUID real do Supabase Auth
INSERT INTO usuarios (nome, email, tipo, ativo) VALUES
('Administrador', 'teste@dentalapp.com', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- View para facilitar consultas
CREATE OR REPLACE VIEW dentistas_ativos AS
SELECT 
  id,
  nome,
  email,
  cro,
  especialidade,
  telefone
FROM usuarios
WHERE tipo = 'dentista' AND ativo = true
ORDER BY nome;
