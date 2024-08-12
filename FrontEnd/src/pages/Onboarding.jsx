import { useNavigate } from "react-router-dom";
import { Button } from "@components/ui/Button";
import onboardingImage from "@assets/onboarding-image.png";

const Onboarding = () => {
  const navigate = useNavigate();

  return (
    <div className="m-4 flex h-screen flex-col items-center justify-center">
      <img
        src={onboardingImage}
        alt="onboardingImage"
        className="w-400 h-400 mb-8"
      />
      <h1 className="mb-2 p-4 text-2xl font-bold">
        <i>RunTail</i> 에<br /> 오신 것을 환영합니다
      </h1>
      <p className="mb-8"> 꼬리 한 번 잡아볼까요?</p>
      <Button
        onClick={() => navigate("/login")}
        className="bg-theme-color-1 font-bold"
      >
        Get Started &gt;
      </Button>
    </div>
  );
};

export default Onboarding;
