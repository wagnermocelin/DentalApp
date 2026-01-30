# 🦷 DentalApp - Sistema de Gestão Odontológica

Sistema completo e moderno para gestão de clínicas odontológicas, desenvolvido com React, TailwindCSS e Supabase.

## 🚀 Funcionalidades

- ✅ **Gestão de Pacientes** - Cadastro completo com histórico
- ✅ **Agendamentos** - Sistema de agenda com visualização por dia/semana/mês
- ✅ **Prontuários Eletrônicos** - Odontograma interativo e histórico de tratamentos
- ✅ **Controle Financeiro** - Pagamentos, recebimentos e relatórios
- ✅ **Dashboard Analítico** - Estatísticas e gráficos em tempo real
- ✅ **Autenticação Segura** - Login com Supabase Auth
- ✅ **Design Responsivo** - Interface moderna e intuitiva

## 📋 Pré-requisitos

- Node.js 18+ 
- Conta no Supabase (gratuita)

## 🔧 Instalação

1. Clone o repositório ou extraia os arquivos

2. Instale as dependências:
```bash
npm install
```

3. Configure o Supabase:
   - Crie um projeto em https://supabase.com
   - Copie a URL e a ANON KEY do projeto
   - Renomeie `.env.example` para `.env`
   - Preencha as variáveis com suas credenciais

4. Execute o script SQL no Supabase:
   - Acesse o SQL Editor no painel do Supabase
   - Execute o arquivo `supabase/schema.sql`

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

6. Acesse: http://localhost:5173

## 🗄️ Estrutura do Banco de Dados

- **pacientes** - Dados dos pacientes
- **agendamentos** - Consultas e procedimentos agendados
- **prontuarios** - Histórico clínico e tratamentos
- **procedimentos** - Catálogo de procedimentos odontológicos
- **pagamentos** - Controle financeiro
- **usuarios** - Dentistas e equipe

## 🎨 Tecnologias

- **Frontend**: React 18, TailwindCSS, Lucide Icons
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Gráficos**: Recharts
- **Roteamento**: React Router
- **Build**: Vite

## 📱 Módulos

### Dashboard
- Visão geral de consultas do dia
- Estatísticas de faturamento
- Gráficos de desempenho

### Pacientes
- Cadastro completo
- Histórico de consultas
- Documentos e fotos

### Agendamentos
- Calendário interativo
- Notificações automáticas
- Gestão de horários

### Prontuários
- Odontograma digital
- Planos de tratamento
- Evolução clínica

### Financeiro
- Contas a receber
- Relatórios financeiros
- Controle de pagamentos

## 🔐 Segurança

- Autenticação via Supabase Auth
- Row Level Security (RLS) habilitado
- Dados criptografados

## 📄 Licença

MIT License - Livre para uso comercial e pessoal

## 🤝 Suporte

Para dúvidas ou sugestões, abra uma issue no repositório.
