# 💳 Guia do Sistema de Pagamentos - DentalApp

## 📋 Visão Geral

O sistema de pagamentos do DentalApp oferece flexibilidade total para gerenciar diferentes formas de pagamento e parcelamentos, com regras específicas para cada modalidade.

## 🎯 Regras de Pagamento

### ✅ Pagamentos Quitados Imediatamente

Estas formas de pagamento são consideradas **QUITADAS** no momento do registro:

- 💵 **Dinheiro** - Pagamento à vista em espécie
- 📱 **PIX** - Transferência instantânea
- 💳 **Cartão de Débito** - Débito em conta imediato
- 💳 **Cartão de Crédito Parcelado** - Operadora recebe parcelado (você recebe à vista)

**Resultado**: 
- Status da conta: `PAGO`
- Data de recebimento: Data da sessão
- Valor do tratamento é atualizado como "pago"

### ⏳ Pagamentos Pendentes

Estas formas ficam **PENDENTES** até o recebimento:

- 🧾 **Boleto** - Aguarda compensação
- 📝 **Cheque** - Aguarda compensação
- 📋 **Parcelado em Carteira** - Aguarda recebimento de cada parcela

**Resultado**:
- Status da conta: `PENDENTE`
- Data de recebimento: Vazia (preencher ao receber)
- Valor do tratamento permanece como "pendente"

## 💰 Tipos de Parcelamento

### 1️⃣ À Vista

**Quando usar**: Pagamento único, sem parcelamento

**Como funciona**:
- Cria 1 conta a receber
- Valor total da sessão
- Status depende da forma de pagamento

**Exemplo**:
```
Valor: R$ 500,00
Forma: PIX
Resultado: 1 conta de R$ 500,00 (PAGO)
```

### 2️⃣ Parcelado no Cartão de Crédito

**Quando usar**: Cliente parcela no cartão, operadora recebe parcelado

**Como funciona**:
- Cria 1 conta a receber
- Valor total da sessão
- Status: **PAGO** (você recebe à vista da operadora)
- Observação registra número de parcelas

**Exemplo**:
```
Valor: R$ 1.200,00
Parcelas: 3x
Forma: Cartão de Crédito
Resultado: 1 conta de R$ 1.200,00 (PAGO)
Observação: "Parcelado em 3x no cartão de crédito"
```

**Por que fica PAGO?**
- A operadora do cartão te paga o valor total
- O cliente é quem paga parcelado para a operadora
- Você não precisa cobrar cada parcela

### 3️⃣ Parcelado em Carteira

**Quando usar**: Você parcela direto com o cliente (carnê)

**Como funciona**:
- Cria MÚLTIPLAS contas a receber (uma para cada parcela)
- Valor dividido igualmente
- Status: **PENDENTE** (você recebe cada parcela)
- Vencimentos mensais

**Exemplo**:
```
Valor: R$ 1.200,00
Parcelas: 3x
Primeira parcela: 15/02/2026
Forma: Boleto
Resultado: 
  - Parcela 1/3: R$ 400,00 venc. 15/02/2026 (PENDENTE)
  - Parcela 2/3: R$ 400,00 venc. 15/03/2026 (PENDENTE)
  - Parcela 3/3: R$ 400,00 venc. 15/04/2026 (PENDENTE)
```

**Por que fica PENDENTE?**
- Você precisa receber cada parcela do cliente
- Cada parcela tem vencimento próprio
- Você marca como pago ao receber cada uma

## 🔄 Fluxo Completo de Pagamento

### Passo 1: Registrar Sessão
1. Acesse **Atendimento** → **Tratamentos**
2. Clique no **+** verde em um tratamento ativo
3. Preencha dados da sessão
4. Selecione procedimentos realizados
5. Marque "Gerar Cobrança" nos procedimentos
6. Clique em **Avançar para Pagamento**

### Passo 2: Escolher Forma de Pagamento
1. Selecione a forma de pagamento:
   - Dinheiro, PIX, Débito → Quitado automaticamente
   - Cartão de Crédito → Escolher tipo de parcelamento
   - Boleto, Cheque → Fica pendente

### Passo 3: Definir Parcelamento (se aplicável)

#### Se escolheu Cartão de Crédito:
- **À Vista**: 1 conta, quitada
- **Parcelado no Cartão**: 1 conta, quitada (operadora paga)
- **Parcelado em Carteira**: Múltiplas contas, pendentes

#### Se escolheu Parcelado em Carteira:
1. Escolha número de parcelas (1x a 12x)
2. Defina data da primeira parcela
3. Sistema calcula automaticamente:
   - Valor de cada parcela
   - Datas de vencimento (mensais)
   - Cria todas as contas

### Passo 4: Confirmar
1. Revise o resumo do parcelamento
2. Clique em **Confirmar Pagamento**
3. Sistema cria automaticamente:
   - Sessão de tratamento
   - Procedimentos realizados
   - Contas a receber (1 ou múltiplas)
   - Atualiza valores do tratamento

## 📊 Exemplos Práticos

### Exemplo 1: Pagamento à Vista em Dinheiro

**Cenário**: Restauração de R$ 350,00

**Passos**:
1. Registrar sessão
2. Selecionar procedimento
3. Forma de pagamento: **Dinheiro**
4. Tipo: **À Vista**

**Resultado**:
- ✅ 1 conta a receber de R$ 350,00
- ✅ Status: PAGO
- ✅ Data recebimento: Hoje
- ✅ Tratamento: Valor pago +R$ 350,00

### Exemplo 2: Parcelado 6x no Cartão

**Cenário**: Implante de R$ 3.000,00

**Passos**:
1. Registrar sessão
2. Selecionar procedimento
3. Forma de pagamento: **Cartão de Crédito**
4. Tipo: **Parcelado no Cartão de Crédito**
5. Parcelas: **6x de R$ 500,00**

**Resultado**:
- ✅ 1 conta a receber de R$ 3.000,00
- ✅ Status: PAGO
- ✅ Data recebimento: Hoje
- ✅ Observação: "Parcelado em 6x no cartão de crédito"
- ✅ Tratamento: Valor pago +R$ 3.000,00

**Por quê?** A operadora do cartão te paga R$ 3.000,00 à vista. O cliente paga 6x R$ 500,00 para a operadora.

### Exemplo 3: Parcelado 4x em Carteira

**Cenário**: Ortodontia de R$ 2.000,00

**Passos**:
1. Registrar sessão
2. Selecionar procedimento
3. Forma de pagamento: **Boleto**
4. Tipo: **Parcelado em Carteira**
5. Parcelas: **4x de R$ 500,00**
6. Primeira parcela: **15/02/2026**

**Resultado**:
- ✅ 4 contas a receber criadas:
  - Parcela 1/4: R$ 500,00 venc. 15/02/2026 (PENDENTE)
  - Parcela 2/4: R$ 500,00 venc. 15/03/2026 (PENDENTE)
  - Parcela 3/4: R$ 500,00 venc. 15/04/2026 (PENDENTE)
  - Parcela 4/4: R$ 500,00 venc. 15/05/2026 (PENDENTE)
- ✅ Tratamento: Valor pendente R$ 2.000,00

**Depois**: Conforme receber cada parcela, vá em **Financeiro** → **Contas a Receber** e marque como PAGO.

## 🔍 Gerenciando Contas a Receber

### Ver Contas Criadas
1. Vá em **Financeiro** → **Contas a Receber**
2. Filtre por paciente ou data
3. Veja todas as contas (pagas e pendentes)

### Marcar Parcela como Paga
1. Localize a parcela pendente
2. Clique no ícone de **editar**
3. Altere status para **PAGO**
4. Preencha:
   - Data de recebimento
   - Forma de recebimento (se diferente)
5. Salve

### Acompanhar Inadimplência
- Contas atrasadas aparecem em **vermelho**
- Use filtro **Pendentes** para ver o que falta receber
- Dashboard mostra total atrasado

## 💡 Dicas Importantes

### ✅ Boas Práticas

1. **Sempre confirme a forma de pagamento com o paciente** antes de registrar
2. **Use parcelamento em carteira** apenas se tiver acordo formal
3. **Parcelamento no cartão** é mais seguro (você recebe à vista)
4. **Registre imediatamente** após o atendimento
5. **Acompanhe diariamente** as contas pendentes

### ⚠️ Atenções

1. **Parcelamento em carteira** requer controle rigoroso
2. **Boletos** podem atrasar - considere taxa de inadimplência
3. **Cheques** verificar fundos antes de considerar pago
4. **Cartão de crédito parcelado** - operadora cobra taxa (considere no preço)

### 🎯 Estratégias

**Para aumentar recebimento à vista**:
- Ofereça desconto para dinheiro/PIX
- Limite parcelas em carteira
- Incentive cartão de crédito (você recebe à vista)

**Para reduzir inadimplência**:
- Prefira cartão de crédito
- Boleto com vencimento curto
- Lembre paciente antes do vencimento
- Cobre juros em atrasos (configure no sistema)

## 📈 Relatórios e Análises

### Dashboard Financeiro
- Total a receber (pendente)
- Total recebido (pago)
- Contas atrasadas
- Saldo (receitas - despesas)

### Por Forma de Pagamento
Veja quanto recebe por cada forma:
- Dinheiro
- PIX
- Cartão (débito/crédito)
- Boleto
- Outros

### Por Período
- Recebimentos do mês
- Previsão de recebimentos futuros
- Histórico de inadimplência

## 🆘 Solução de Problemas

### Conta não foi criada
- Verifique se marcou "Gerar Cobrança"
- Confirme que o SQL foi executado (tabela contas_receber existe)
- Veja console do navegador (F12) para erros

### Status errado (deveria estar pago)
- Verifique a forma de pagamento selecionada
- Dinheiro, PIX e Débito ficam pagos automaticamente
- Boleto e Cheque ficam pendentes (correto)

### Parcelas não foram criadas
- Certifique-se de escolher "Parcelado em Carteira"
- "Parcelado no Cartão" cria apenas 1 conta (correto)
- Verifique número de parcelas selecionado

### Valor do tratamento não atualizou
- Apenas pagamentos quitados atualizam valor pago
- Pendentes ficam em "valor pendente"
- Ao marcar parcela como paga, atualize manualmente o tratamento

## 📝 Resumo Rápido

| Forma de Pagamento | Status | Parcelas | Você Recebe |
|-------------------|--------|----------|-------------|
| Dinheiro | PAGO | 1 conta | À vista |
| PIX | PAGO | 1 conta | À vista |
| Cartão Débito | PAGO | 1 conta | À vista |
| Cartão Crédito Parcelado | PAGO | 1 conta | À vista (operadora) |
| Parcelado em Carteira | PENDENTE | Múltiplas | Mensalmente |
| Boleto | PENDENTE | 1 ou múltiplas | Após compensação |
| Cheque | PENDENTE | 1 ou múltiplas | Após compensação |

---

**Sistema desenvolvido para facilitar sua gestão financeira! 💰**
