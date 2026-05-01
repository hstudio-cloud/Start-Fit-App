# 🏋️ StartFit App

<p align="center">
  <img src="frontend/public/logo.jpg" alt="StartFit Logo" width="120" style="border-radius:20px"/>
</p>

<p align="center">
  <strong>Sistema completo de gestão para academias</strong><br/>
  React · Node.js · MongoDB · JWT
</p>

---

## 🚀 Funcionalidades

### 👤 Aluno
- Login e cadastro
- Questionário fitness inicial com geração de treino por IA
- Dashboard com IMC, mensalidade, treino do dia e lembretes
- Sessão de treino com marcação por exercício, carga, reps e observações
- Cronômetro de descanso e tempo total de treino
- Gráficos de evolução: peso, IMC, frequência semanal

### 🛡️ Administrador
- Dashboard geral com métricas da academia
- CRUD completo de alunos
- Controle de mensalidades com baixa de pagamento
- Monitoramento de frequência e alunos inativos
- Vinculação de professores aos alunos
- Cadastro de professores

### 👨‍🏫 Professor
- Dashboard pessoal
- Visualização de alunos vinculados com detalhes
- Acompanhamento de evolução por gráficos
- Adição de observações no perfil do aluno

---

## 🛠️ Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | Node.js + Express |
| Banco de Dados | MongoDB + Mongoose |
| Autenticação | JWT |
| Gráficos | Recharts |
| Ícones | Lucide React |

---

## 📁 Estrutura do Projeto

```
StartFit-App/
├── backend/
│   ├── controllers/     # authController, adminController, studentController, teacherController
│   ├── middleware/       # auth.js (JWT), roles.js (RBAC)
│   ├── models/           # User, Student, Workout, WorkoutSession, Payment, Progress
│   ├── routes/           # auth, admin, student, teacher
│   ├── services/         # imcCalculator, workoutGenerator (banco de 40+ exercícios)
│   ├── seed.js           # Popular banco com dados de teste
│   └── server.js
│
└── frontend/
    └── src/
        ├── components/   # Layout (sidebar), Timer (cronômetro)
        ├── context/      # AuthContext (estado global de auth)
        ├── pages/
        │   ├── Login.jsx
        │   ├── admin/    # Dashboard, Students, Payments
        │   ├── student/  # Dashboard, Questionnaire, WorkoutSession, Evolution
        │   └── teacher/  # Dashboard, Students
        └── services/     # api.js (Axios)
```

---

## ⚡ Como Rodar

### Pré-requisitos
- Node.js 18+
- MongoDB (local ou Atlas)

### Backend

```bash
cd backend
cp .env.example .env
# Edite o .env com sua MONGODB_URI e JWT_SECRET
npm install
npm run seed   # Popula o banco com dados de teste
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse: **http://localhost:5173**

---

## 🔑 Contas de Teste (após seed)

| Perfil | Email | Senha |
|--------|-------|-------|
| Admin | admin@startfit.com | 123456 |
| Professor | professor@startfit.com | 123456 |
| Aluno | joao@email.com | 123456 |
| Aluno (sem questionário) | maria@email.com | 123456 |

---

## 🧠 Gerador de Treinos

O `workoutGenerator.js` cria planos personalizados com base em:
- **Objetivo**: emagrecer, ganhar massa, condicionamento, saúde, força
- **Nível**: iniciante, intermediário, avançado
- **Dias disponíveis**: split automático (1 a 6 dias/semana)
- **Tempo por treino**: ajusta quantidade de exercícios
- **Músculos de foco**: prioriza grupos selecionados

Banco de dados: **40+ exercícios** organizados em peito, costas, ombros, bíceps, tríceps, pernas, abdômen e cardio.

---

## 📊 Modelos de Dados

```
User        → name, email, password (hash), role, active
Student     → user, teacher, questionnaire, imc, payments, notes
Workout     → student, exercises[], weekDay, objective, generatedBy
WorkoutSession → student, exercises[], startTime, endTime, rating
Payment     → student, amount, dueDate, status, paymentMethod
Progress    → student, weight, height, imc, measurements, date
```

---

## 🎨 Design System

Cores: `#070b10` (fundo) · `#0077b6` (brand) · `#00b4d8` (accent) · `#fff` (texto)

---

## 📄 Licença

MIT © 2024 StartFit App
