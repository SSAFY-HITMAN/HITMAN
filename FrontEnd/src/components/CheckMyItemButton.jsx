import { Button } from "@/components/ui/Button";

const CheckMyItemButton = () => {
  return (
    <div>
      <Button className="m-1 h-[8vh] w-[8vh] rounded-full border-2 border-black bg-white text-black shadow-xl hover:bg-white">
        MyItem
      </Button>
    </div>
  );
};

export default CheckMyItemButton;
