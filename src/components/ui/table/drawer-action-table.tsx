import { GoPlus } from "react-icons/go";
import { Button } from "../../shadcn-ui/button";
import {
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
  Drawer,
} from "../../shadcn-ui/drawer";

import { CourseStatusCardProps } from "./course-status-table";

const DrawerAction: React.FC<{ course: CourseStatusCardProps }> = ({
  course,
}) => {
  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button className="p-1 cursor-pointer">
          <GoPlus className="text-lg" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-black text-white px-5">
        <DrawerHeader>
          <DrawerTitle>{course.subject_name}</DrawerTitle>
          <DrawerDescription>{course.code}</DrawerDescription>
        </DrawerHeader>
        Nada ainda, mas aqui você pode colocar ações relacionadas a{" "}
        {course.subject_name}!
        <DrawerFooter>
          <Button>Atualizar</Button>
          <DrawerClose asChild>
            <Button
              className="bg-white text-black hover:bg-gray-200"
              variant="outline"
            >
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerAction;
