# 🔧 Como Resolver: Procedimentos Não Aparecem

## Problema
Os procedimentos não estão aparecendo no modal de orçamento porque a tabela `procedimentos_padrao` ainda não foi criada no banco de dados.

## ✅ Solução Rápida (2 minutos)

### Passo 1: Acessar o Supabase
1. Abra https://supabase.com no navegador
2. Faça login
3. Selecione seu projeto: `pxzfryqrppnrmoymeodt`

### Passo 2: Abrir o SQL Editor
1. No menu lateral esquerdo, clique em **SQL Editor**
2. Clique em **New Query** (ou use uma query existente)

### Passo 3: Copiar e Executar o SQL
1. Abra o arquivo: `supabase/EXECUTAR-PRIMEIRO.sql`
2. Copie TODO o conteúdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** (ou pressione Ctrl+Enter)

### Passo 4: Verificar
Você deve ver uma mensagem de sucesso e no final:
```
total_procedimentos: 27
```

Isso significa que 27 procedimentos foram inseridos com sucesso!

### Passo 5: Testar no Sistema
1. Volte para o DentalApp (http://localhost:5173)
2. Vá em **Atendimento**
3. Clique em **Novo Orçamento**
4. Clique em **Adicionar Procedimento**
5. Agora os procedimentos devem aparecer no dropdown! ✅

## 📋 O que o SQL faz?

1. ✅ Cria a tabela `procedimentos_padrao`
2. ✅ Configura permissões (RLS)
3. ✅ Insere 27 procedimentos organizados por categoria:
   - 4 Preventivos
   - 3 Restauradores
   - 3 Endodontia
   - 3 Cirurgia
   - 5 Prótese
   - 3 Ortodontia
   - 3 Estética
   - 2 Implantodontia
   - 1 Periodontia

## 🔍 Como Verificar se Funcionou

### Opção 1: Pelo Sistema
- Abra o modal de orçamento
- Clique em "Adicionar Procedimento"
- O dropdown deve mostrar todos os procedimentos

### Opção 2: Pelo Supabase
1. Vá em **Table Editor**
2. Selecione a tabela `procedimentos_padrao`
3. Você deve ver 27 linhas

## ⚠️ Se Ainda Não Funcionar

### 1. Verifique Erros no Console
- Pressione F12 no navegador
- Vá na aba **Console**
- Procure por erros em vermelho
- Copie a mensagem de erro

### 2. Verifique a Conexão
- Confirme que o arquivo `.env` tem as credenciais corretas
- Teste se outros módulos estão funcionando (Pacientes, Financeiro)

### 3. Recarregue a Página
- Pressione Ctrl+Shift+R (hard reload)
- Ou feche e abra o navegador novamente

### 4. Verifique as Permissões RLS
No Supabase SQL Editor, execute:
```sql
SELECT * FROM procedimentos_padrao LIMIT 5;
```

Se retornar dados, está funcionando!

## 📝 Executar Schema Completo (Opcional)

Se você quiser criar TODAS as tabelas do módulo de atendimento:

1. Execute: `supabase/schema-atendimento.sql`
2. Isso cria:
   - ✅ procedimentos_padrao (já criado acima)
   - ✅ orcamentos
   - ✅ orcamento_itens
   - ✅ tratamentos
   - ✅ tratamento_procedimentos
   - ✅ sessoes_tratamento
   - ✅ sessao_procedimentos

**Nota**: O arquivo `EXECUTAR-PRIMEIRO.sql` já cria a tabela de procedimentos, que é o mínimo necessário para começar a usar o sistema.

## 🎯 Depois de Resolver

Você poderá:
1. ✅ Criar orçamentos com procedimentos
2. ✅ Selecionar procedimentos do catálogo
3. ✅ Ver valores sugeridos automaticamente
4. ✅ Aprovar orçamentos e criar tratamentos
5. ✅ Registrar sessões de atendimento

---

**Tempo estimado**: 2 minutos
**Dificuldade**: Fácil ⭐
