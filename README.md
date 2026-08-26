# Smart Wallet

Aplicação para gerenciamento de finanças pessoais, permitindo o acompanhamento, organização e análise de receitas e despesas.

## Status

Em desenvolvimento.

## Objetivo

O Smart Wallet tem como objetivo fornecer uma forma simples e organizada de acompanhar a vida financeira, permitindo:

- Gerenciar receitas e despesas
- Organizar transações por categorias
- Acompanhar saldo e movimentações
- Visualizar informações financeiras
- Analisar gastos ao longo do tempo
- Gerenciar carteiras financeiras

## Arquitetura

O backend segue uma abordagem de **monólito modular**, organizado em módulos de negócio e utilizando uma estrutura próxima ao conceito de **Vertical Slice Architecture**.

A aplicação busca manter as regras de negócio isoladas das preocupações de infraestrutura, mantendo ao mesmo tempo uma arquitetura simples de desenvolver e executar.

## Tecnologias

### Backend

- Java 21
- Spring Boot
- Maven
- PostgreSQL
- Lombok

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Tremor

## Estrutura

```text
smart-wallet/
├── backend/
│   └── ...
│
├── frontend/
│   └── ...
│
├── DESIGN.md
└── README.md
```

A estrutura do projeto pode evoluir conforme o desenvolvimento.

## Desenvolvimento

Clone o repositório:

```bash
git clone <repository-url>
cd smart-wallet
```

As instruções específicas de execução e configuração estão disponíveis nos diretórios `backend` e `frontend`.

## Design

A interface utiliza o **Tremor** como principal referência visual e de componentes.

O projeto prioriza:

- Interface limpa e moderna
- Visualização de dados financeiros
- Responsividade
- Consistência visual
- Acessibilidade
- Hierarquia clara de informações

As diretrizes visuais estão documentadas no arquivo [`DESIGN.md`](./DESIGN.md).

## Funcionalidades

- Dashboard
- Gerenciamento de despesas
- Gerenciamento de receitas
- Gerenciamento de carteiras
- Categorias financeiras
- Relatórios e análises
- Autenticação e autorização
- Interface responsiva
