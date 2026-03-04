import { NavBar } from "../components/ui/nav-bar";
import Cards from "../components/ui/card";
import Table from "../components/ui/table";
import { mockUser } from "../mock/mock";

export default function Home() {
  return (
    <div className="bg-black text-white h-screen flex flex-col gap-10 overflow-scroll w-screen py-2">
      <NavBar perfilImageUrl={mockUser.perfilImageUrl} />
      <div className="grid grid-cols-3 gap-10 px-10">
        <Cards.YieldCoefficient
          semesters={mockUser.data}
          percentage={mockUser.data[mockUser.data.length - 1].yield_coefficient}
          previousValue={
            mockUser.data[mockUser.data.length - 2]?.yield_coefficient || 0
          }
        />
        <Cards.CourseProgress
          hoursCompleted={mockUser.distributionWork.reduce(
            (total, item) => total + item.completede,
            0,
          )}
          hoursTotal={mockUser.distributionWork.reduce(
            (total, item) => total + item.hours,
            0,
          )}
        />
        <Cards.AttentionRequired subjects={mockUser.courses} />
        <div className="w-full h-full col-span-2">
          <Cards.AverageRating semesters_data={mockUser.data} />
        </div>
        <Cards.DistributionWork ChartData={mockUser.distributionWork} />
      </div>
      <div className="px-10">
        <Table.CourseStatus courses={mockUser.courses} />
      </div>
    </div>
  );
}
