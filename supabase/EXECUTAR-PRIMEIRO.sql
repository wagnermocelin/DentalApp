-- ============================================
-- EXECUTAR ESTE SQL PRIMEIRO NO SUPABASE
-- ============================================

-- Criar tabela de procedimentos padrão
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

-- Habilitar RLS
ALTER TABLE procedimentos_padrao ENABLE ROW LEVEL SECURITY;

-- Política de acesso
CREATE POLICY "Permitir todas operações" ON procedimentos_padrao
    FOR ALL USING (auth.role() = 'authenticated');

-- Inserir procedimentos padrão
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

-- Verificar se os dados foram inseridos
SELECT COUNT(*) as total_procedimentos FROM procedimentos_padrao;
