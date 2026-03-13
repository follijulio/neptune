# Netuno

**Plataforma Integrada de Gestão Acadêmica e Produtividade**

O Netuno é um Software as a Service (SaaS) desenvolvido para centralizar, automatizar e otimizar a rotina de estudantes do ensino superior. A plataforma consolida dados acadêmicos complexos em um painel visualmente sofisticado, combinando ferramentas de controle de notas, gestão de tempo e produtividade profunda em um único ecossistema.

<img width="1000" alt="image" src="https://github.com/user-attachments/assets/de9d4501-7b11-435e-90aa-bb1d7b8039d2" />

---

## Proposta de Valor

Diferente de gerenciadores de tarefas genéricos, o Netuno foi arquitetado em torno das regras de negócio e exigências do ambiente universitário brasileiro (com foco nas normativas de instituições federais, como a UFAL). O sistema substitui planilhas manuais e múltiplos aplicativos fragmentados por uma infraestrutura centralizada e reativa.

---

## Funcionalidades Principais

### 1. Gestão Curricular e Motor Matemático

O sistema processa e calcula automaticamente a situação do aluno com base nos critérios institucionais de aprovação.

- **Cálculo Preditivo:** Processamento automático de médias parciais (AB1, AB2) e substituição automática da menor nota pela Reavaliação.
- **Projeção de Exame Final:** Cálculo exato da nota necessária na Prova Final para garantir a aprovação.
- **Controle de Assiduidade:** Barras de progresso dinâmicas que monitoram o limite de faltas (25% da carga horária), emitindo alertas visuais antes da reprovação por ausência.

<img width="1000" alt="image" src="https://github.com/user-attachments/assets/e5fbd47c-3e50-4117-9368-ba930da98289" />

### 2. Automação via Inteligência Artificial

Eliminação de entrada manual de dados acadêmicos pregressos através de processamento inteligente de documentos.

- **Extração via LLM:** Integração com modelos de linguagem de grande escala (através da API Groq) para ler históricos escolares em PDF.
- **Criação de Banco de Dados:** O sistema analisa o histórico e constrói automaticamente toda a árvore de semestres, disciplinas, notas e cargas horárias anteriores do usuário.

### 3. Ecossistema de Produtividade Integrado

Ferramentas de hiperfoco e organização diretamente acopladas à rotina de estudos.

- **Timer Pomodoro Nativo:** Sistema de ciclos de foco e descanso com design tabular anti-distração e alertas sonoros no navegador.
- **Mural de Anotações Rápido:** Interface para rascunhos, tarefas e lembretes com persistência em tempo real.
- **Calendário Sincronizado:** Agenda inteligente com integração bidirecional ao Google Calendar.
- **Central de Links:** Agregador de recursos acadêmicos de acesso rápido.
<table>
  <tr>
    <td width="50%">
      <img src="https://github.com/user-attachments/assets/7d2b9cf3-640f-403c-84a9-f72603b40157" alt="Screenshot 1" width="100%">
    </td>
    <td width="50%">
      <img src="https://github.com/user-attachments/assets/ffbd2939-b711-4901-8f01-19fcc790e583" alt="Screenshot 2" width="100%">
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="https://github.com/user-attachments/assets/9f4d5636-89d0-4cb6-bb17-2f662df0f997" alt="Screenshot 3" width="100%">
    </td>
    <td width="50%">
      <img src="https://github.com/user-attachments/assets/bebc2592-5173-4f5a-864e-207515b85a97" alt="Screenshot 4" width="100%">
    </td>
  </tr>
</table>

---

## Arquitetura e Stack Tecnológica

A aplicação foi construída visando alta performance, tipagem rigorosa e segurança no tráfego de dados, adotando as práticas mais recentes do ecossistema React.

- **Framework Core:** Next.js 15 (App Router)
- **Linguagem:** TypeScript (Tipagem estrita)
- **Banco de Dados:** PostgreSQL
- **ORM:** Prisma
- **Autenticação e Segurança:** Auth.js (NextAuth) com provedores OAuth e credenciais customizadas.
- **Comunicação de Dados:** Server Actions (eliminando a necessidade de rotas de API intermediárias para operações CRUD).
- **Estilização e UI:** Tailwind CSS, Radix UI e componentes Shadcn/ui.
- **Infraestrutura Transacional:** Nodemailer configurado para envios de verificação e recuperação de senhas.

<img width="1000"  alt="image" src="https://github.com/user-attachments/assets/0f3599d6-ed14-4636-b3af-de99c4a05544" />

---

## Padrões de Qualidade de Código

O repositório mantém verificação contínua de qualidade técnica:

- Ordenação de importações automatizada via `eslint-plugin-simple-import-sort`.
- Checagem de tipagem estrita via `tsc --noEmit`.
- Análise de dependências mortas e código não utilizado garantida por scripts de validação interna.
