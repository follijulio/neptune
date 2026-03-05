import { NavBar } from "../components/ui/nav-bar";
import Cards from "../components/ui/card";
import Table from "../components/ui/table";
import { mockUser } from "../mock/mock";


/**
 * TODO: Move to backend - Calculate total hours from workload
 * Future endpoint: GET /api/workload/total
 */
const calculateTotalHours = (
  workload: typeof mockUser.workloadDistribution,
  field: "completedHours" | "totalHours",
) => workload.reduce((sum, item) => sum + item[field], 0);

/**
 * TODO: Move to backend - Get current yield coefficient
 * Future endpoint: GET /api/performance/current-yield
 */
const getCurrentYieldCoefficient = () => {
  const lastIndex = mockUser.academicPerformance.length - 1;
  return mockUser.academicPerformance[lastIndex].yieldCoefficient;
};

/**
 * TODO: Move to backend - Get previous yield coefficient
 * Future endpoint: GET /api/performance/previous-yield
 */
const getPreviousYieldCoefficient = () => {
  const previousIndex = mockUser.academicPerformance.length - 2;
  return mockUser.academicPerformance[previousIndex]?.yieldCoefficient || 0;
};

/**
 * TODO: Move to backend - Map semesters data
 * Future endpoint: GET /api/semesters/table-format
 */
const mapSemestersToTableFormat = () =>
  mockUser.semesters.map((semester) => ({
    semester: semester.period,
    status: semester.status,
    data: semester.subjects.map((subject) => ({
      subject_name: subject.name,
      code: subject.code,
      status: subject.status,
      partial_grade: subject.grade,
    })),
  }));

/**
 * TODO: Move to backend - Get courses requiring attention
 * Future endpoint: GET /api/courses/attention-needed
 */
const mapCoursesToAttentionFormat = () =>
  mockUser.enrolledCourses.map((course) => ({
    subject_name: course.name,
    absences: course.absences,
    maxAbsences: course.maxAbsences,
  }));

/**
 * TODO: Move to backend - Get academic performance chart data
 * Future endpoint: GET /api/performance/chart-data
 */
const mapAcademicPerformanceToChartFormat = () =>
  mockUser.academicPerformance.map((performance) => ({
    semester: performance.semester,
    yield_coefficient: performance.yieldCoefficient,
  }));

/**
 * TODO: Move to backend - Get workload distribution chart data
 * Future endpoint: GET /api/workload/chart-data
 */
const mapWorkloadDistributionToChartFormat = () =>
  mockUser.workloadDistribution.map((item) => ({
    hours_name: item.category,
    hours: item.completedHours,
  }));

/**
 * TODO: Move to backend - Get enrolled courses status
 * Future endpoint: GET /api/courses/status
 */
const mapEnrolledCoursesToStatusFormat = () =>
  mockUser.enrolledCourses.map((course) => ({
    subject_name: course.name,
    code: course.code,
    status: course.status,
    absences: course.absences,
    maxAbsences: course.maxAbsences,
    partial_grade: course.grade,
  }));


export default function Home() {
  const completedHours = calculateTotalHours(
    mockUser.workloadDistribution,
    "completedHours",
  );
  const totalHours = calculateTotalHours(
    mockUser.workloadDistribution,
    "totalHours",
  );
  const currentYield = getCurrentYieldCoefficient();
  const previousYield = getPreviousYieldCoefficient();
  const semestersData = mapSemestersToTableFormat();
  const coursesWithAttentionNeeded = mapCoursesToAttentionFormat();
  const academicPerformanceData = mapAcademicPerformanceToChartFormat();
  const workloadDistributionData = mapWorkloadDistributionToChartFormat();
  const courseStatusData = mapEnrolledCoursesToStatusFormat();

  return (
    <div className="bg-black text-white flex flex-col gap-10 overflow-scroll w-screen py-2 min-h-screen">
      <NavBar profileImageUrl={mockUser.profileImageUrl} />

      <section className="h-full w-full px-10 gap-10 flex flex-col">
        <div className="grid grid-cols-3 gap-10">
          <Cards.YieldCoefficient
            semesters={mockUser.academicPerformance}
            currentValue={currentYield}
            previousValue={previousYield}
          />

          <Cards.CourseProgress
            hoursCompleted={completedHours}
            hoursTotal={totalHours}
          />

          <Cards.AttentionRequired subjects={coursesWithAttentionNeeded} />

          <div className="w-full h-full col-span-2">
            <Cards.AverageRating semesters_data={academicPerformanceData} />
          </div>

          <Cards.DistributionWork ChartData={workloadDistributionData} />
        </div>

        <div className="flex flex-col gap-10">
          <Table.CourseStatus courses={courseStatusData} />
          <Table.Semester data={semestersData} />
        </div>
      </section>
    </div>
  );
}
