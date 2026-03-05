import { GoPlus } from "react-icons/go";
import { Button } from "../../shadcn-ui/button";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "../../shadcn-ui/drawer";
import { CourseStatusCardProps } from "./course-status-table";

interface CourseDrawerActionProps {
  course: CourseStatusCardProps;
}

const CourseDrawerAction: React.FC<CourseDrawerActionProps> = ({ course }) => {
  const handleUpdate = () => {
    console.log("Update course:", course.code);
  };

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button
          className="p-1 cursor-pointer"
          aria-label="Abrir ações do curso"
        >
          <GoPlus className="text-lg" />
        </Button>
      </DrawerTrigger>

      <DrawerContent className="bg-black text-white px-5">
        <DrawerHeader>
          <DrawerTitle>{course.subject_name}</DrawerTitle>
          <DrawerDescription>{course.code}</DrawerDescription>
        </DrawerHeader>

        <div className="flex-1">
          Nada ainda, mas aqui você pode colocar ações relacionadas a{" "}
          {course.subject_name}!
        </div>

        <DrawerFooter>
          <Button onClick={handleUpdate}>Atualizar</Button>
          <DrawerClose asChild>
            <Button
              className="bg-white text-black hover:bg-gray-200"
              variant="outline"
            >
              Cancelar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default CourseDrawerAction;
