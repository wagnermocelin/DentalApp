# 📋 Guia de Receitas e Atestados - DentalApp

## 🎯 Visão Geral

O módulo de Atendimento agora permite emitir **Receitas Odontológicas** e **Atestados** diretamente do sistema, com opção de salvar no banco de dados e imprimir.

## 🚀 Como Usar

### 📝 Emitir Receita

1. **Acesse** Atendimento → Tratamentos
2. **Localize** o tratamento do paciente
3. **Clique** no ícone roxo 📄 (Emitir Receita)
4. **Preencha** os dados:
   - Data de emissão
   - Medicamentos prescritos (com posologia)
   - Observações (opcional)
5. **Escolha uma ação**:
   - **Salvar**: Salva no banco de dados
   - **Imprimir**: Abre janela de impressão
   - **Salvar e Imprimir**: Faz ambos

### 📋 Emitir Atestado

1. **Acesse** Atendimento → Tratamentos
2. **Localize** o tratamento do paciente
3. **Clique** no ícone laranja 📋 (Emitir Atestado)
4. **Preencha** os dados:
   - Data de emissão
   - Data início do afastamento
   - Data fim do afastamento
   - Dias (calculado automaticamente)
   - CID (opcional)
   - Motivo do atestado
   - Observações (opcional)
5. **Escolha uma ação**:
   - **Salvar**: Salva no banco de dados
   - **Imprimir**: Abre janela de impressão
   - **Salvar e Imprimir**: Faz ambos

## 📄 Exemplo de Receita

```
RECEITA ODONTOLÓGICA

Dr(a). Nome do Dentista
CRO: 12345
Endereço da Clínica
Telefone: (00) 0000-0000

Data: 30/01/2026
Paciente: Maria Silva

Prescrição:

1. Amoxicilina 500mg
   Tomar 1 cápsula de 8 em 8 horas por 7 dias

2. Ibuprofeno 600mg
   Tomar 1 comprimido de 8 em 8 horas se dor (máximo 3 dias)

Observações: Evitar alimentos duros nas primeiras 24 horas

_________________________________
Assinatura e Carimbo do Dentista
```

## 📋 Exemplo de Atestado

```
ATESTADO ODONTOLÓGICO

Dr(a). Nome do Dentista
CRO: 12345
Endereço da Clínica
Telefone: (00) 0000-0000

Atesto para os devidos fins que o(a) paciente João Santos,
CPF 123.456.789-00, esteve sob meus cuidados profissionais
e necessita de afastamento de suas atividades habituais pelo
período de dois (2) dia(s), no período de 30/01/2026 a 31/01/2026.

Motivo: Procedimento odontológico (extração dentária)

CID: K04.7

30 de janeiro de 2026

_________________________________
Assinatura e Carimbo do Dentista
CRO: 12345
```

## 🗄️ Banco de Dados

### Executar SQL

Antes de usar, execute o SQL no Supabase:

```bash
supabase/schema-receitas-atestados.sql
```

Isso cria as tabelas:
- `receitas` - Armazena todas as receitas emitidas
- `atestados` - Armazena todos os atestados emitidos

### Estrutura das Tabelas

**receitas:**
- paciente_id
- tratamento_id (opcional)
- data_emissao
- medicamentos (texto completo)
- observacoes

**atestados:**
- paciente_id
- tratamento_id (opcional)
- data_emissao
- data_inicio
- data_fim
- dias
- cid (opcional)
- motivo
- observacoes

## 🖨️ Impressão

### Como Funciona

O sistema usa CSS `@media print` para:
- Ocultar botões e formulários
- Mostrar apenas o documento formatado
- Manter formatação profissional

### Dicas de Impressão

1. **Salvar como PDF**: Na janela de impressão, escolha "Salvar como PDF"
2. **Configurações**: Use orientação Retrato, margens normais
3. **Papel**: Tamanho A4
4. **Cabeçalho/Rodapé**: Desabilite para melhor aparência

## ✏️ Personalização

### Dados do Dentista

Atualmente os dados estão fixos no código. Para personalizar:

1. Edite `src/components/ModalReceita.jsx`
2. Edite `src/components/ModalAtestado.jsx`
3. Localize a seção de cabeçalho
4. Altere:
   - Nome do dentista
   - CRO
   - Endereço da clínica
   - Telefone

**Exemplo:**
```jsx
<div className="text-sm text-gray-600">
  <p>Dr(a). Seu Nome Aqui</p>
  <p>CRO: 12345-SP</p>
  <p>Rua Exemplo, 123 - São Paulo/SP</p>
  <p>Telefone: (11) 98765-4321</p>
</div>
```

### Futuras Melhorias

- [ ] Configurações do dentista no banco de dados
- [ ] Múltiplos dentistas
- [ ] Logo da clínica
- [ ] Templates personalizados
- [ ] Histórico de receitas/atestados por paciente

## 💡 Dicas de Uso

### Receitas

1. **Seja específico**: Inclua nome do medicamento, dosagem e posologia
2. **Numere os itens**: Facilita a leitura
3. **Use observações**: Para instruções especiais
4. **Salve sempre**: Mantém histórico do paciente

### Atestados

1. **Calcule os dias**: Sistema calcula automaticamente
2. **Use CID quando apropriado**: Ajuda em questões trabalhistas
3. **Seja claro no motivo**: Evite termos muito técnicos
4. **Verifique datas**: Início e fim devem fazer sentido

## 🔒 Segurança e Privacidade

- ✅ Dados salvos no Supabase (criptografado)
- ✅ RLS habilitado (apenas usuários autenticados)
- ✅ Histórico completo mantido
- ✅ Vinculação com tratamento e paciente

## 📊 Relatórios

Você pode consultar receitas e atestados emitidos:

```sql
-- Receitas de um paciente
SELECT * FROM receitas 
WHERE paciente_id = 'uuid-do-paciente'
ORDER BY data_emissao DESC;

-- Atestados de um período
SELECT * FROM atestados 
WHERE data_emissao BETWEEN '2026-01-01' AND '2026-01-31'
ORDER BY data_emissao DESC;
```

## 🆘 Solução de Problemas

### Tabelas não encontradas
Execute o SQL: `schema-receitas-atestados.sql`

### Impressão não funciona
- Verifique se o navegador permite pop-ups
- Use Ctrl+P manualmente se necessário
- Salve como PDF primeiro

### Dados do paciente não aparecem
- Verifique se o tratamento tem paciente vinculado
- Recarregue a página de atendimento

### Não consegue salvar
- Verifique conexão com Supabase
- Veja console do navegador (F12) para erros
- Confirme que as tabelas foram criadas

---

**Sistema pronto para emitir receitas e atestados profissionais! 📋✨**
