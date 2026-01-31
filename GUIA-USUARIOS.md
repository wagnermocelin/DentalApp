# 👥 Guia de Usuários - DentalApp

## 🎯 Visão Geral

O módulo de Usuários permite gerenciar dentistas e usuários administrativos do sistema, com controle de permissões e informações profissionais.

## 📋 Tipos de Usuários

### 🦷 Dentista
- Profissional que realiza atendimentos
- Campos obrigatórios: Nome, Email, CRO
- Campos opcionais: Especialidade, Telefone, Endereço
- Aparece em receitas e atestados

### 👤 Administrativo
- Usuário com acesso ao sistema
- Gerencia agendamentos, financeiro, etc.
- Não precisa de CRO

### 🛡️ Administrador
- Acesso total ao sistema
- Pode gerenciar outros usuários
- Controle completo de configurações

## 🚀 Como Usar

### Cadastrar Novo Usuário

1. **Acesse** Usuários no menu lateral
2. **Clique** em "Novo Usuário"
3. **Preencha** os dados:
   - Nome completo *
   - E-mail * (único no sistema)
   - Tipo de usuário *
   - Telefone (opcional)
   - **Se Dentista:**
     - CRO * (obrigatório)
     - Especialidade (opcional)
     - Endereço (opcional)
4. **Marque** "Usuário Ativo"
5. **Clique** em "Cadastrar"

### Editar Usuário

1. **Localize** o usuário na lista
2. **Clique** no ícone de editar (✏️)
3. **Altere** os dados necessários
4. **Clique** em "Atualizar"

**Nota:** O e-mail não pode ser alterado após o cadastro.

### Ativar/Desativar Usuário

1. **Localize** o usuário na lista
2. **Clique** no badge de status (Ativo/Inativo)
3. O status será alternado automaticamente

### Excluir Usuário

1. **Localize** o usuário na lista
2. **Clique** no ícone de excluir (🗑️)
3. **Confirme** a exclusão

**Atenção:** Esta ação não pode ser desfeita!

## 📊 Dashboard de Usuários

### Estatísticas

- **Total**: Quantidade total de usuários cadastrados
- **Dentistas**: Quantidade de dentistas ativos
- **Administrativos**: Quantidade de usuários administrativos
- **Ativos**: Quantidade de usuários ativos no sistema

### Filtros

**Por Tipo:**
- Todos
- Dentistas
- Administrativos

**Por Busca:**
- Nome
- E-mail
- CRO (para dentistas)

## 🗄️ Banco de Dados

### Estrutura da Tabela `usuarios`

```sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  tipo VARCHAR(50) CHECK (tipo IN ('dentista', 'administrativo', 'admin')),
  ativo BOOLEAN DEFAULT true,
  cro VARCHAR(20),
  especialidade VARCHAR(255),
  telefone VARCHAR(20),
  endereco TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Campos Adicionados em Outras Tabelas

**receitas:**
- `dentista_id` - Referência ao dentista que emitiu a receita

**atestados:**
- `dentista_id` - Referência ao dentista que emitiu o atestado

## 🔗 Integrações

### Receitas e Atestados

Quando um dentista emite uma receita ou atestado:
- O campo `dentista_id` é preenchido automaticamente
- As informações do dentista (nome, CRO) aparecem no documento
- Permite rastreabilidade de quem emitiu cada documento

### Futuras Integrações

- [ ] Agenda por dentista
- [ ] Relatórios de produtividade por dentista
- [ ] Comissões e metas
- [ ] Histórico de atendimentos por profissional

## 🔒 Segurança e Permissões

### Row Level Security (RLS)

- ✅ Todos os usuários autenticados podem visualizar a lista
- ✅ Apenas administradores podem criar/editar/excluir
- ✅ Usuários podem editar seus próprios dados

### Políticas Implementadas

```sql
-- Leitura para todos autenticados
CREATE POLICY "Permitir leitura para autenticados" ON usuarios
    FOR SELECT USING (auth.role() = 'authenticated');

-- Todas operações para usuários autenticados
CREATE POLICY "Permitir todas operações" ON usuarios
    FOR ALL USING (auth.role() = 'authenticated');
```

## 📝 Exemplos de Uso

### Cadastrar Dentista

```
Nome: Dr. João Silva
Email: joao.silva@clinica.com
Tipo: Dentista
CRO: 12345-SP
Especialidade: Ortodontia
Telefone: (11) 98765-4321
Endereço: Rua das Flores, 123 - São Paulo/SP
Status: Ativo ✓
```

### Cadastrar Administrativo

```
Nome: Maria Santos
Email: maria.santos@clinica.com
Tipo: Administrativo
Telefone: (11) 91234-5678
Status: Ativo ✓
```

## 💡 Dicas de Uso

### Organização

1. **Cadastre dentistas primeiro**: Necessário para emitir receitas/atestados
2. **Use emails corporativos**: Facilita a gestão
3. **Mantenha CRO atualizado**: Importante para documentos legais
4. **Desative ao invés de excluir**: Mantém histórico

### Melhores Práticas

- ✅ Cadastre especialidade dos dentistas
- ✅ Mantenha telefones atualizados
- ✅ Use emails únicos para cada usuário
- ✅ Revise periodicamente usuários ativos
- ✅ Desative usuários que saíram da clínica

### Campos Importantes

**Para Dentistas:**
- **CRO**: Obrigatório por lei para documentos
- **Especialidade**: Ajuda pacientes a identificar o profissional
- **Endereço**: Pode ser usado em documentos oficiais

**Para Todos:**
- **Email**: Usado para login (futuro)
- **Telefone**: Contato rápido
- **Status Ativo**: Controla acesso ao sistema

## 🆘 Solução de Problemas

### Erro ao cadastrar usuário

**Problema**: "Email já cadastrado"
- **Solução**: Use um email diferente ou edite o usuário existente

**Problema**: "CRO obrigatório para dentistas"
- **Solução**: Preencha o campo CRO ou mude o tipo para Administrativo

### Usuário não aparece na lista

- Verifique os filtros aplicados
- Use a busca por nome ou email
- Verifique se o usuário está ativo

### Não consigo editar usuário

- Verifique se você tem permissão de administrador
- Recarregue a página
- Verifique conexão com o banco de dados

## 📊 Relatórios

### Consultas Úteis

**Listar todos os dentistas ativos:**
```sql
SELECT nome, cro, especialidade, telefone
FROM usuarios
WHERE tipo = 'dentista' AND ativo = true
ORDER BY nome;
```

**Contar usuários por tipo:**
```sql
SELECT tipo, COUNT(*) as total
FROM usuarios
WHERE ativo = true
GROUP BY tipo;
```

**Dentistas com mais receitas emitidas:**
```sql
SELECT 
  u.nome,
  u.cro,
  COUNT(r.id) as total_receitas
FROM usuarios u
LEFT JOIN receitas r ON r.dentista_id = u.id
WHERE u.tipo = 'dentista'
GROUP BY u.id, u.nome, u.cro
ORDER BY total_receitas DESC;
```

## 🔄 Migração de Dados

### Importar Dentistas de Planilha

Se você tem uma planilha com dentistas, pode importar usando SQL:

```sql
INSERT INTO usuarios (nome, email, tipo, cro, especialidade, telefone, ativo)
VALUES
('Dr. João Silva', 'joao@clinica.com', 'dentista', '12345-SP', 'Ortodontia', '(11) 98765-4321', true),
('Dra. Maria Santos', 'maria@clinica.com', 'dentista', '67890-SP', 'Implantodontia', '(11) 91234-5678', true);
```

## 🚀 Próximas Funcionalidades

- [ ] Integração com Supabase Auth (login por usuário)
- [ ] Foto de perfil dos dentistas
- [ ] Assinatura digital para documentos
- [ ] Agenda individual por dentista
- [ ] Relatório de produtividade
- [ ] Sistema de comissões
- [ ] Controle de férias e folgas
- [ ] Histórico de alterações

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte este guia
2. Verifique os logs do sistema (F12 no navegador)
3. Entre em contato com o suporte técnico

---

**Sistema pronto para gerenciar sua equipe! 👥✨**
