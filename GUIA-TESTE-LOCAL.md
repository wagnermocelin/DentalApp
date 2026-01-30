# 🚀 Guia para Testar o DentalApp Localmente

## Passo 1: Configurar o Supabase

### Opção A: Criar conta gratuita no Supabase (Recomendado)

1. Acesse https://supabase.com e crie uma conta gratuita
2. Crie um novo projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** (algo como: https://xxxxx.supabase.co)
   - **anon/public key** (chave longa começando com eyJ...)

5. Edite o arquivo `.env` e cole suas credenciais:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

6. No Supabase, vá em **SQL Editor** e execute o arquivo:
   - `supabase/schema-simples.sql` (versão simplificada para testes)
   - OU `supabase/schema.sql` (versão completa)

7. Crie um usuário de teste:
   - Vá em **Authentication** → **Users**
   - Clique em **Add user** → **Create new user**
   - Email: `teste@dentalapp.com`
   - Password: `123456`

### Opção B: Usar Supabase Local (Avançado)

Se você tem Docker instalado:

```bash
npx supabase init
npx supabase start
```

## Passo 2: Instalar Dependências

```bash
npm install
```

## Passo 3: Iniciar o Servidor

```bash
npm run dev
```

O aplicativo estará disponível em: **http://localhost:5173**

## Passo 4: Fazer Login

Use as credenciais que você criou no Supabase:
- Email: `teste@dentalapp.com`
- Senha: `123456`

## 📋 Funcionalidades Disponíveis

✅ **Dashboard** - Visão geral com estatísticas e gráficos
✅ **Pacientes** - Cadastro e gerenciamento de pacientes
✅ **Agendamentos** - Calendário com visualização dia/semana/mês
✅ **Prontuários** - Odontograma interativo e histórico
✅ **Financeiro** - Controle de pagamentos e recebimentos
✅ **Configurações** - Perfil e preferências

## 🔧 Solução de Problemas

### Erro de conexão com Supabase
- Verifique se as credenciais no `.env` estão corretas
- Certifique-se de que o projeto Supabase está ativo

### Erro ao fazer login
- Verifique se você criou um usuário no Supabase
- Confirme se o email está verificado

### Tabelas não encontradas
- Execute o SQL no Supabase SQL Editor
- Verifique se as tabelas foram criadas corretamente

## 📝 Dados de Teste

O schema simplificado já inclui 3 pacientes de exemplo:
- João Silva
- Maria Santos
- Pedro Oliveira

Você pode criar agendamentos, prontuários e pagamentos para testá-los!

## 🎨 Personalização

Para alterar as cores do tema, edite o arquivo:
`tailwind.config.js`

## 📚 Estrutura do Projeto

```
DentalApp/
├── src/
│   ├── pages/          # Páginas da aplicação
│   ├── components/     # Componentes reutilizáveis
│   ├── lib/           # Configuração do Supabase
│   └── index.css      # Estilos globais
├── supabase/          # Schemas SQL
└── .env              # Variáveis de ambiente
```

## 🆘 Precisa de Ajuda?

Se encontrar problemas, verifique:
1. Console do navegador (F12) para erros JavaScript
2. Terminal onde o Vite está rodando para erros do servidor
3. Supabase Dashboard para logs do banco de dados
