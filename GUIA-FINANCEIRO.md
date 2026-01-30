# 💰 Guia do Módulo Financeiro - DentalApp

## 📋 Visão Geral

O módulo Financeiro foi completamente reformulado para oferecer controle completo sobre **Contas a Receber** e **Contas a Pagar**, permitindo uma gestão financeira eficiente do seu consultório odontológico.

## 🆕 Novidades

### ✅ Contas a Receber
- Vinculação com pacientes
- Categorização por tipo de serviço
- Controle de status (Pendente, Pago, Atrasado, Cancelado)
- Múltiplas formas de recebimento
- Relatórios e gráficos

### ✅ Contas a Pagar
- Cadastro de fornecedores
- Categorização de despesas
- Controle de vencimentos
- Alertas de contas atrasadas
- Análise de gastos por categoria

## 🚀 Como Usar

### 1️⃣ Configurar o Banco de Dados

Antes de usar o novo módulo, você precisa executar o SQL no Supabase:

1. Acesse https://supabase.com
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Execute o arquivo: `supabase/schema-financeiro.sql`

Este script irá criar:
- Tabela `contas_receber`
- Tabela `contas_pagar`
- Tabela `categorias_financeiras`
- Categorias pré-definidas de receitas e despesas
- Dados de teste

### 2️⃣ Acessar o Módulo Financeiro

1. Faça login no sistema
2. Clique em **Financeiro** no menu lateral
3. Você verá o dashboard com estatísticas gerais

## 📊 Dashboard Financeiro

O dashboard exibe 4 cards principais:

- **Total Recebido**: Soma de todas as contas recebidas (status: pago)
- **A Receber**: Soma de todas as contas pendentes
- **Total Pago**: Soma de todas as despesas pagas
- **Saldo**: Diferença entre receitas e despesas (Total Recebido - Total Pago)

### Gráfico de Distribuição
Mostra a distribuição percentual por categoria, alternando entre receitas e despesas conforme a aba ativa.

## 💵 Contas a Receber

### Cadastrar Nova Conta a Receber

1. Clique no botão **Nova Conta**
2. Certifique-se de estar na aba **Contas a Receber**
3. Preencha os campos:
   - **Paciente**: Selecione o paciente (obrigatório)
   - **Descrição**: Ex: "Consulta de rotina" (obrigatório)
   - **Valor**: Valor em reais (obrigatório)
   - **Categoria**: Tipo de serviço (Consulta, Limpeza, Restauração, etc.)
   - **Data Vencimento**: Quando deve ser pago (obrigatório)
   - **Data Recebimento**: Quando foi efetivamente pago
   - **Forma de Recebimento**: Dinheiro, PIX, Cartão, etc.
   - **Status**: Pendente, Pago ou Cancelado (obrigatório)
   - **Observações**: Informações adicionais
4. Clique em **Cadastrar**

### Categorias de Receitas Disponíveis
- Consulta
- Limpeza
- Restauração
- Ortodontia
- Implante
- Clareamento
- Outros Serviços

### Editar/Excluir Conta a Receber
- Clique no ícone de **lápis** para editar
- Clique no ícone de **lixeira** para excluir

## 💳 Contas a Pagar

### Cadastrar Nova Conta a Pagar

1. Clique no botão **Nova Conta**
2. Mude para a aba **Contas a Pagar**
3. Preencha os campos:
   - **Fornecedor**: Nome do fornecedor/empresa (obrigatório)
   - **Descrição**: Ex: "Aluguel do consultório" (obrigatório)
   - **Valor**: Valor em reais (obrigatório)
   - **Categoria**: Tipo de despesa
   - **Data Vencimento**: Quando deve ser pago (obrigatório)
   - **Data Pagamento**: Quando foi efetivamente pago
   - **Forma de Pagamento**: Dinheiro, PIX, Boleto, etc.
   - **Status**: Pendente, Pago, Atrasado ou Cancelado (obrigatório)
   - **Observações**: Informações adicionais
4. Clique em **Cadastrar**

### Categorias de Despesas Disponíveis
- Aluguel
- Energia
- Água
- Internet/Telefone
- Material Odontológico
- Equipamentos
- Salários
- Impostos
- Manutenção
- Marketing
- Outros

### Editar/Excluir Conta a Pagar
- Clique no ícone de **lápis** para editar
- Clique no ícone de **lixeira** para excluir

## 🔍 Filtros e Busca

### Buscar Contas
Digite no campo de busca:
- **Contas a Receber**: Busca por nome do paciente ou descrição
- **Contas a Pagar**: Busca por nome do fornecedor ou descrição

### Filtrar por Status
Clique nos botões de filtro:
- **Todos**: Exibe todas as contas
- **Pagos**: Apenas contas já pagas
- **Pendentes**: Apenas contas pendentes

## 📈 Indicadores de Status

As contas são coloridas automaticamente:

- 🟢 **Verde**: Conta paga
- 🟡 **Amarelo**: Conta pendente (dentro do prazo)
- 🔴 **Vermelho**: Conta atrasada (vencimento passou)
- ⚫ **Cinza**: Conta cancelada

## 💡 Dicas de Uso

### Gestão Eficiente
1. **Cadastre todas as receitas**: Mesmo as já recebidas, para ter histórico completo
2. **Atualize o status**: Quando receber um pagamento, mude o status para "Pago" e preencha a data de recebimento
3. **Use categorias**: Facilita a análise de onde vem seu faturamento
4. **Monitore o saldo**: O card de saldo mostra se você está no positivo ou negativo

### Contas a Pagar
1. **Cadastre despesas recorrentes**: Aluguel, energia, água, etc.
2. **Defina lembretes**: Use as datas de vencimento para não atrasar pagamentos
3. **Categorize corretamente**: Ajuda a identificar onde você gasta mais
4. **Acompanhe fornecedores**: Mantenha registro de todos os fornecedores

### Análise Financeira
1. **Compare receitas x despesas**: Use o card de Saldo
2. **Analise por categoria**: Use o gráfico de pizza para ver distribuição
3. **Identifique contas atrasadas**: Filtre por status para ver o que precisa atenção
4. **Planeje o futuro**: Use as contas pendentes para prever fluxo de caixa

## 🔧 Solução de Problemas

### Tabelas não encontradas
Se aparecer erro "relation does not exist":
1. Execute o arquivo `schema-financeiro.sql` no Supabase SQL Editor
2. Verifique se as tabelas foram criadas em **Database** → **Tables**

### Pacientes não aparecem
1. Certifique-se de ter pacientes cadastrados no módulo **Pacientes**
2. Verifique se o SQL schema foi executado corretamente

### Categorias não aparecem
1. Execute o arquivo `schema-financeiro.sql` que já inclui categorias padrão
2. Ou crie manualmente na tabela `categorias_financeiras`

### Erro ao salvar
1. Verifique se todos os campos obrigatórios (*) estão preenchidos
2. Confirme que o valor está em formato numérico válido
3. Verifique a conexão com o Supabase

## 📝 Estrutura das Tabelas

### contas_receber
- `id`: UUID (chave primária)
- `paciente_id`: UUID (referência a pacientes)
- `descricao`: Texto
- `valor`: Decimal(10,2)
- `data_vencimento`: Data
- `data_recebimento`: Data (opcional)
- `forma_recebimento`: Texto (opcional)
- `status`: Texto (pendente/pago/cancelado)
- `categoria`: Texto (opcional)
- `observacoes`: Texto (opcional)

### contas_pagar
- `id`: UUID (chave primária)
- `fornecedor`: Texto
- `descricao`: Texto
- `valor`: Decimal(10,2)
- `data_vencimento`: Data
- `data_pagamento`: Data (opcional)
- `forma_pagamento`: Texto (opcional)
- `status`: Texto (pendente/pago/atrasado/cancelado)
- `categoria`: Texto (opcional)
- `observacoes`: Texto (opcional)

### categorias_financeiras
- `id`: UUID (chave primária)
- `nome`: Texto
- `tipo`: Texto (receita/despesa)
- `cor`: Texto (código de cor)

## 🎯 Próximos Passos

Após configurar o módulo financeiro:
1. Cadastre suas contas a receber existentes
2. Cadastre suas despesas fixas mensais
3. Configure lembretes para vencimentos importantes
4. Analise os relatórios semanalmente
5. Use os dados para tomar decisões estratégicas

## 🆘 Precisa de Ajuda?

Se encontrar problemas:
1. Verifique o console do navegador (F12)
2. Confirme que o SQL foi executado corretamente
3. Verifique as permissões RLS no Supabase
4. Teste a conexão com o banco de dados
