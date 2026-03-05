import { NavBar } from "../components/ui/nav-bar";
import Cards from "../components/ui/card";
import Table from "../components/ui/table";
import { mockUser } from "../mock/mock";

const calculateTotalHours = (
  distributionWork: typeof mockUser.distributionWork,
  field: "completed" | "hours",
) => distributionWork.reduce((total, item) => total + item[field], 0);

const getCurrentYieldCoefficient = () => {
  const lastSemesterIndex = mockUser.data.length - 1;
  return mockUser.data[lastSemesterIndex].yield_coefficient;
};

const getPreviousYieldCoefficient = () => {
  const previousSemesterIndex = mockUser.data.length - 2;
  return mockUser.data[previousSemesterIndex]?.yield_coefficient || 0;
};

const transformSemestersData = () =>
  mockUser.semesters.map((semester) => ({
    ...semester,
    data: semester.subjects,
  }));

export default function Home() {
  const completedHours = calculateTotalHours(
    mockUser.distributionWork,
    "completed",
  );
  const totalHours = calculateTotalHours(mockUser.distributionWork, "hours");
  const currentYield = getCurrentYieldCoefficient();
  const previousYield = getPreviousYieldCoefficient();
  const semestersWithSubjects = transformSemestersData();

  //!render
  return (
    <div className="bg-black text-white flex flex-col gap-10 overflow-scroll w-screen py-2 min-h-screen">
      <NavBar perfilImageUrl={mockUser.perfilImageUrl} />

      <section className="h-full w-full px-10 gap-10 flex flex-col">
        <div className="grid grid-cols-3 gap-10">
          <Cards.YieldCoefficient
            semesters={mockUser.data}
            percentage={currentYield}
            previousValue={previousYield}
          />

          <Cards.CourseProgress
            hoursCompleted={completedHours}
            hoursTotal={totalHours}
          />

          <Cards.AttentionRequired subjects={mockUser.courses} />

          <div className="w-full h-full col-span-2">
            <Cards.AverageRating semesters_data={mockUser.data} />
          </div>

          <Cards.DistributionWork ChartData={mockUser.distributionWork} />
        </div>

        <div className="flex flex-col gap-10">
          <Table.CourseStatus courses={mockUser.courses} />
          <Table.Semester data={semestersWithSubjects} />
        </div>
      </section>
    </div>
  );
}
