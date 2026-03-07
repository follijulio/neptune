import bcrypt from "bcryptjs";
import { prisma } from "./lib/prisma";

async function main() {
  console.log("🌱 Iniciando o seed do banco de dados...");

  // 1. Limpar banco de dados (CUIDADO: isso apaga tudo para recriar do zero)
  await prisma.enrollment.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.semester.deleteMany();
  await prisma.workload.deleteMany();
  await prisma.user.deleteMany();

  // 2. Criar o Hash da Senha que você pediu
  const hashedPassword = await bcrypt.hash("miau1423", 10);

  // 3. Criar o seu Usuário
  const user = await prisma.user.create({
    data: {
      name: "Júlio Folli",
      username: "folliro",
      email: "follijulio@gmail.com",
      passwordHash: hashedPassword,
      profileImageUrl: "https://github.com/follijulio.png", // Puxando sua foto do Github de brinde!
    },
  });

  console.log(`👤 Usuário criado: ${user.name}`);

  // 4. Criar Cargas Horárias (Workload)
  await prisma.workload.createMany({
    data: [
      {
        category: "Disciplinas Obrigatórias",
        totalHours: 2400,
        completedHours: 360,
        userId: user.id,
      },
      {
        category: "Disciplinas Optativas",
        totalHours: 400,
        completedHours: 60,
        userId: user.id,
      },
      {
        category: "Atividades Complementares",
        totalHours: 200,
        completedHours: 20,
        userId: user.id,
      },
    ],
  });

  // 5. Criar Semestres
  const semester1 = await prisma.semester.create({
    data: {
      period: "2026.1",
      status: "CONCLUIDO",
      yieldCoefficient: 8.7,
      userId: user.id,
    },
  });

  const semester2 = await prisma.semester.create({
    data: {
      period: "2026.2",
      status: "CURSANDO",
      yieldCoefficient: null,
      userId: user.id,
    },
  });

  // 6. Criar Disciplinas (Subjects)
  const calc1 = await prisma.subject.create({
    data: { code: "MAT001", name: "Cálculo Diferencial e Integral I" },
  });
  const geoAnalitica = await prisma.subject.create({
    data: { code: "MAT002", name: "Geometria Analítica" },
  });
  const logica = await prisma.subject.create({
    data: { code: "MAT003", name: "Lógica Matemática" },
  });
  const algebra = await prisma.subject.create({
    data: { code: "MAT004", name: "Álgebra Linear" },
  });

  // 7. Criar Matrículas (Enrollments)
  await prisma.enrollment.createMany({
    data: [
      // Semestre 2026.1 (Concluído)
      {
        status: "APROVADO",
        grade: 8.5,
        absences: 4,
        maxAbsences: 18,
        userId: user.id,
        subjectId: calc1.id,
        semesterId: semester1.id,
      },
      {
        status: "APROVADO",
        grade: 9.0,
        absences: 2,
        maxAbsences: 18,
        userId: user.id,
        subjectId: geoAnalitica.id,
        semesterId: semester1.id,
      },

      // Semestre 2026.2 (Cursando)
      {
        status: "CURSANDO",
        grade: 7.5,
        absences: 0,
        maxAbsences: 18,
        userId: user.id,
        subjectId: logica.id,
        semesterId: semester2.id,
      },
      {
        status: "CURSANDO",
        grade: null,
        absences: 2,
        maxAbsences: 18,
        userId: user.id,
        subjectId: algebra.id,
        semesterId: semester2.id,
      },
    ],
  });

  console.log("✅ Seed finalizado com sucesso! Seu banco está populado.");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao rodar o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
