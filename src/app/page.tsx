import { NavBar } from "../components/shadcn-ui/nav-bar";
import Cards from "../components/ui/card";

const user = {
  data: [
    { semester: "2026.1", yield_coefficient: 6.0 },
    { semester: "2026.2", yield_coefficient: 7.9 },
    { semester: "2027.1", yield_coefficient: 8.1 },
    { semester: "2027.2", yield_coefficient: 8.2 },
    { semester: "2028.1", yield_coefficient: 9.4 },
  ],

  courses: [
    {
      subject_name: "Cálculo 1",
      code: "MAT101",
      status: "Cursando",
      absences: 10,
      maxAbsences: 12,
      partial_grade: 8.5,
    },
    {
      subject_name: "Introdução à Programação",
      code: "CS101",
      status: "Cursando",
      absences: 19,
      maxAbsences: 20,
      partial_grade: 4.0,
    },
    {
      subject_name: "Física 1",
      code: "PHY101",
      status: "Aprovado",
      absences: 4,
      maxAbsences: 10,
      partial_grade: 9.0,
    },
    {
      subject_name: "Química Geral",
      code: "CHE101",
      status: "Reprovado",
      absences: 6,
      maxAbsences: 8,
      partial_grade: 9.5,
    },
  ],
};

export default function Home() {
  return (
    <div className="bg-black text-white h-screen flex flex-col gap-10">
      <NavBar />
      <div className="grid grid-cols-3 gap-10 px-10">
        <Cards.YieldCoefficient
          semesters={user.data}
          percentage={user.data[user.data.length - 1].yield_coefficient}
          previousValue={
            user.data[user.data.length - 2]?.yield_coefficient || 0
          }
        />
        <Cards.CourseProgress hoursCompleted={2020} hoursTotal={3600} />
        <Cards.AttentionRequired />
      </div>
      <div className="px-10">
        <Cards.CourseStatus courses={user.courses} />
      </div>
    </div>
  );
}
