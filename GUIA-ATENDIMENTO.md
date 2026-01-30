# 🏥 Guia do Módulo de Atendimento - DentalApp

## 📋 Visão Geral

O módulo de **Atendimento** é o coração do sistema DentalApp, gerenciando todo o fluxo de trabalho desde o orçamento inicial até a conclusão do tratamento, com integração automática com o módulo Financeiro e Agenda.

## 🎯 Fluxo de Trabalho

```
1. ORÇAMENTO → 2. APROVAÇÃO → 3. TRATAMENTO → 4. SESSÕES → 5. CONCLUSÃO
     ↓              ↓              ↓              ↓              ↓
  Proposta      Aceite do     Procedimentos   Lançamentos    Finalização
   Inicial      Paciente       Planejados      Realizados     Tratamento
```

## 🚀 Configuração Inicial

### 1️⃣ Executar o Schema SQL

Antes de usar o módulo, execute o SQL no Supabase:

1. Acesse https://supabase.com
2. Vá em **SQL Editor**
3. Execute o arquivo: `supabase/schema-atendimento.sql`

Este script cria:
- ✅ Tabela `orcamentos` - Orçamentos de tratamento
- ✅ Tabela `orcamento_itens` - Itens do orçamento
- ✅ Tabela `tratamentos` - Tratamentos em andamento
- ✅ Tabela `tratamento_procedimentos` - Procedimentos do tratamento
- ✅ Tabela `sessoes_tratamento` - Sessões realizadas
- ✅ Tabela `sessao_procedimentos` - Procedimentos por sessão
- ✅ Tabela `procedimentos_padrao` - Catálogo de procedimentos
- ✅ 27 procedimentos padrão pré-cadastrados

## 💰 Orçamentos

### Criar Novo Orçamento

1. Acesse **Atendimento** no menu lateral
2. Clique em **Novo Orçamento**
3. Preencha os dados:
   - **Paciente**: Selecione o paciente (obrigatório)
   - **Data do Orçamento**: Data de criação
   - **Validade**: Até quando o orçamento é válido
   - **Desconto**: Desconto em reais (opcional)
   - **Observações**: Notas sobre o orçamento

4. **Adicionar Procedimentos**:
   - Clique em **Adicionar Procedimento**
   - Selecione o procedimento do catálogo
   - Informe o dente (se aplicável)
   - Ajuste quantidade e valor
   - Repita para todos os procedimentos

5. Clique em **Criar Orçamento**

### Visualizar Orçamento

- Clique no ícone de **olho** para ver detalhes
- Veja todos os procedimentos incluídos
- Confira valores e totais

### Aprovar Orçamento

1. Localize o orçamento pendente
2. Clique no ícone de **check verde**
3. Confirme a aprovação
4. **Automaticamente**:
   - Orçamento muda para status "Aprovado"
   - Tratamento é criado com status "Em Andamento"
   - Todos os procedimentos são copiados para o tratamento
   - Valores são calculados automaticamente

### Rejeitar Orçamento

1. Clique no ícone de **X vermelho**
2. Confirme a rejeição
3. Orçamento muda para status "Rejeitado"

## 🏥 Tratamentos

### Visualizar Tratamento

1. Vá para a aba **Tratamentos**
2. Clique no ícone de **olho** em um tratamento
3. Você verá:
   - **Valores**: Total, Pago e Pendente
   - **Progresso**: Barra de progresso visual
   - **Procedimentos**: Lista de todos os procedimentos
   - **Sessões**: Histórico de sessões realizadas

### Gerenciar Procedimentos

Na visualização do tratamento, você pode:

- **Iniciar Procedimento**: Muda status de "Pendente" para "Em Andamento"
- **Concluir Procedimento**: Muda status para "Concluído"
- **Cancelar Procedimento**: Marca como cancelado

### Pausar Tratamento

1. Abra o tratamento
2. Clique em **Pausar Tratamento**
3. Status muda para "Pausado"
4. Para reativar, clique em **Reativar Tratamento**

### Concluir Tratamento

1. Abra o tratamento
2. Clique em **Concluir Tratamento**
3. Confirme a conclusão
4. Data de término é registrada automaticamente

## 📅 Sessões de Tratamento

### Criar Nova Sessão

1. Na lista de tratamentos, clique no **+** verde
2. Preencha os dados da sessão:
   - **Data da Sessão**: Quando foi realizada
   - **Vincular a Agendamento**: Opcional - vincula a um agendamento
   - **Hora Início/Fim**: Horários da sessão
   - **Observações**: Notas sobre a sessão

3. **Selecionar Procedimentos Realizados**:
   - Marque os procedimentos que foram realizados
   - Para cada procedimento selecionado:
     - ✅ **Gerar Cobrança**: Cria conta a receber automaticamente
     - 📊 **Status**: Realizado Completamente ou Parcialmente
     - 📝 **Observações**: Notas específicas do procedimento

4. Clique em **Registrar Sessão**

### O que Acontece Automaticamente

Quando você registra uma sessão:

1. ✅ **Sessão é criada** com todos os dados
2. 💰 **Contas a Receber são geradas** para procedimentos marcados
3. 📊 **Status dos procedimentos é atualizado** (concluído se realizado completamente)
4. 💵 **Valores do tratamento são atualizados**:
   - Valor Pago aumenta
   - Valor Pendente diminui
5. 📅 **Agendamento é marcado como concluído** (se vinculado)
6. 🔗 **Vínculo é criado** entre sessão e contas a receber

### Exemplo Prático

**Cenário**: Paciente João tem tratamento com 3 restaurações

**Sessão 1**:
- Realizou: Restauração dente 16 (R$ 350)
- Marcou "Gerar Cobrança" ✅
- Status: Realizado Completamente
- **Resultado**: Conta a receber de R$ 350 criada automaticamente

**Sessão 2**:
- Realizou: Restauração dente 26 (R$ 350)
- Realizou: Restauração dente 36 (R$ 350) - Parcialmente
- Marcou "Gerar Cobrança" em ambos ✅
- **Resultado**: 2 contas a receber criadas (R$ 700 total)

## 🔗 Integrações

### Integração com Prontuários

**Automática** ✨:
- Cada procedimento realizado é registrado automaticamente no prontuário
- Informações incluídas:
  - Data da sessão
  - Procedimento realizado
  - Dente (se aplicável)
  - Número da sessão
  - Observações específicas do procedimento
  - Observações gerais da sessão
  - Status (Concluído ou Parcial)
  - Valor do procedimento

**Exemplo de registro criado**:
```
Data: 29/01/2026
Procedimento: Restauração Composta
Dente: 16
Descrição: Sessão #3 - Restauração realizada com sucesso
Observações: Status: Concluído | Valor: R$ 350,00
```

**Benefícios**:
- ✅ Histórico completo do paciente
- ✅ Rastreabilidade de todos os procedimentos
- ✅ Não precisa registrar manualmente
- ✅ Informações detalhadas para futuras consultas

### Integração com Financeiro

**Automática**:
- Cada procedimento realizado com "Gerar Cobrança" cria uma conta a receber
- Descrição inclui procedimento, dente e número da sessão
- Valor é copiado do procedimento
- Data de vencimento = data da sessão
- Status depende da forma de pagamento
- Categoria: Tratamento

**Manual**:
- Você pode editar a conta a receber no módulo Financeiro
- Pode alterar data de vencimento, forma de pagamento, etc.
- Pode marcar como paga quando receber

### Integração com Agenda

**Ao criar sessão**:
- Você pode vincular a um agendamento existente
- Sistema lista agendamentos futuros do paciente
- Ao vincular, o agendamento é marcado como "Concluído"

**Fluxo recomendado**:
1. Crie agendamento para o paciente
2. Paciente comparece
3. Crie sessão de tratamento
4. Vincule ao agendamento
5. Agendamento é automaticamente concluído

## 📊 Procedimentos Padrão

O sistema vem com 27 procedimentos pré-cadastrados:

### Preventivos
- Consulta de Rotina (R$ 150)
- Limpeza/Profilaxia (R$ 200)
- Aplicação de Flúor (R$ 80)
- Selante (R$ 120)

### Restauradores
- Restauração Simples (R$ 250)
- Restauração Composta (R$ 350)
- Restauração em Amálgama (R$ 200)

### Endodontia
- Tratamento de Canal - Anterior (R$ 800)
- Tratamento de Canal - Pré-Molar (R$ 1.000)
- Tratamento de Canal - Molar (R$ 1.500)

### Cirurgia
- Extração Simples (R$ 300)
- Extração Complexa (R$ 500)
- Extração de Siso (R$ 600)

### Prótese
- Coroa Provisória (R$ 200)
- Coroa em Porcelana (R$ 1.500)
- Coroa Metalocerâmica (R$ 1.200)
- Prótese Parcial Removível (R$ 2.500)
- Prótese Total (R$ 3.500)

### Ortodontia
- Documentação Ortodôntica (R$ 500)
- Instalação de Aparelho (R$ 1.500)
- Manutenção Ortodôntica (R$ 300)

### Estética
- Clareamento Dental (R$ 800)
- Faceta em Resina (R$ 600)
- Faceta em Porcelana (R$ 2.000)

### Implantodontia
- Implante Dentário (R$ 3.000)
- Enxerto Ósseo (R$ 2.000)

### Periodontia
- Raspagem Periodontal (R$ 400)
- Cirurgia Periodontal (R$ 1.000)

## 📈 Estatísticas e Relatórios

O dashboard do módulo mostra:

- **Orçamentos Pendentes**: Aguardando aprovação
- **Orçamentos Aprovados**: Já convertidos em tratamento
- **Tratamentos Ativos**: Em andamento
- **Tratamentos Concluídos**: Finalizados

## 🎨 Status e Cores

### Orçamentos
- 🟡 **Pendente**: Aguardando decisão do paciente
- 🟢 **Aprovado**: Aceito e convertido em tratamento
- 🔴 **Rejeitado**: Recusado pelo paciente
- ⚫ **Expirado**: Passou da validade

### Tratamentos
- 🔵 **Em Andamento**: Tratamento ativo
- 🟢 **Concluído**: Tratamento finalizado
- 🔴 **Cancelado**: Tratamento cancelado
- 🟠 **Pausado**: Temporariamente pausado

### Procedimentos
- 🟡 **Pendente**: Ainda não iniciado
- 🔵 **Em Andamento**: Iniciado mas não concluído
- 🟢 **Concluído**: Finalizado
- 🔴 **Cancelado**: Não será realizado

### Sessões
- 📅 **Agendada**: Programada para o futuro
- ✅ **Realizada**: Sessão concluída
- 🔴 **Cancelada**: Sessão cancelada
- ⚠️ **Faltou**: Paciente não compareceu

## 💡 Dicas de Uso

### Organização
1. **Crie orçamentos detalhados**: Inclua todos os procedimentos necessários
2. **Use observações**: Anote detalhes importantes
3. **Defina prioridades**: Marque procedimentos urgentes
4. **Acompanhe o progresso**: Use a barra de progresso visual

### Financeiro
1. **Sempre marque "Gerar Cobrança"**: Para criar contas a receber automaticamente
2. **Revise no Financeiro**: Confira as contas criadas
3. **Atualize status de pagamento**: Marque como pago quando receber
4. **Use categorias**: Facilita relatórios financeiros

### Sessões
1. **Registre imediatamente**: Após cada atendimento
2. **Seja específico nas observações**: Ajuda no acompanhamento
3. **Vincule agendamentos**: Mantém histórico organizado
4. **Marque status correto**: Realizado ou Parcial

### Tratamentos Longos
1. **Divida em sessões**: Não tente fazer tudo de uma vez
2. **Acompanhe o progresso**: Use a visualização do tratamento
3. **Comunique com o paciente**: Use observações para registrar conversas
4. **Pause se necessário**: Use o status "Pausado" quando apropriado

## 🔧 Solução de Problemas

### Tabelas não encontradas
Execute o arquivo `schema-atendimento.sql` no Supabase SQL Editor

### Procedimentos padrão não aparecem
Verifique se o SQL foi executado corretamente e se a tabela `procedimentos_padrao` tem dados

### Conta a receber não foi criada
Verifique se marcou "Gerar Cobrança" ao registrar a sessão

### Agendamento não aparece para vincular
Certifique-se de que há agendamentos futuros para o paciente

### Erro ao aprovar orçamento
Verifique se o orçamento tem pelo menos um item/procedimento

## 📝 Estrutura das Tabelas

### orcamentos
- Dados do orçamento (paciente, datas, valores)
- Status: pendente, aprovado, rejeitado, expirado

### orcamento_itens
- Procedimentos incluídos no orçamento
- Quantidade, valores unitários e totais

### tratamentos
- Tratamento ativo do paciente
- Vinculado ao orçamento aprovado
- Controle de valores (total, pago, pendente)

### tratamento_procedimentos
- Procedimentos planejados para o tratamento
- Status individual de cada procedimento
- Prioridade (baixa, normal, alta, urgente)

### sessoes_tratamento
- Sessões de atendimento realizadas
- Vinculação com agendamentos
- Número sequencial de sessões

### sessao_procedimentos
- Procedimentos realizados em cada sessão
- Vinculação com contas a receber
- Flag para gerar ou não cobrança

### procedimentos_padrao
- Catálogo de procedimentos disponíveis
- Valores sugeridos e duração estimada
- Categorização por tipo

## 🎯 Fluxo Completo - Exemplo Real

### Caso: Paciente Maria - Tratamento Ortodôntico

**Passo 1: Criar Orçamento**
- Paciente: Maria Santos
- Procedimentos:
  - Documentação Ortodôntica (R$ 500)
  - Instalação de Aparelho (R$ 1.500)
  - 24x Manutenção Ortodôntica (R$ 300 cada = R$ 7.200)
- **Total**: R$ 9.200
- Desconto: R$ 200
- **Valor Final**: R$ 9.000

**Passo 2: Aprovar Orçamento**
- Paciente aceita
- Clica em aprovar
- Tratamento é criado automaticamente

**Passo 3: Primeira Sessão**
- Data: 15/01/2026
- Procedimento: Documentação Ortodôntica
- Gerar Cobrança: ✅ SIM
- Status: Realizado Completamente
- **Resultado**: Conta a receber de R$ 500 criada

**Passo 4: Segunda Sessão**
- Data: 22/01/2026
- Procedimento: Instalação de Aparelho
- Gerar Cobrança: ✅ SIM
- Status: Realizado Completamente
- **Resultado**: Conta a receber de R$ 1.500 criada

**Passo 5: Manutenções Mensais**
- A cada mês, registra nova sessão
- Procedimento: Manutenção Ortodôntica
- Gerar Cobrança: ✅ SIM
- **Resultado**: Conta a receber de R$ 300 criada mensalmente

**Passo 6: Acompanhamento**
- Progresso: 3 de 26 procedimentos concluídos (11%)
- Valor Pago: R$ 2.000
- Valor Pendente: R$ 7.000

**Passo 7: Conclusão**
- Após 24 meses, todas as manutenções realizadas
- Clica em "Concluir Tratamento"
- Tratamento finalizado com sucesso

## 🆘 Precisa de Ajuda?

Se encontrar problemas:
1. Verifique o console do navegador (F12)
2. Confirme que o SQL foi executado
3. Verifique as permissões RLS no Supabase
4. Teste com dados de exemplo primeiro
5. Revise este guia para o fluxo correto

---

**Desenvolvido com ❤️ para facilitar a gestão do seu consultório odontológico!**
