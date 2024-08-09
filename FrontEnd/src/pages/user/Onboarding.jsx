import { useNavigate } from "react-router-dom";
import { Button } from "@components/ui/Button";
import onboardingImage from "@assets/onboarding-image.png";

const Onboarding = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <img src={onboardingImage} alt="onboardingImage" className="w-400" />
      <article>
        <h1 className="mb-4 text-4xl font-bold leading-relaxed">
          현실에서 즐기는 <br />
          추격 서바이벌 게임 !
        </h1>
        <p className="mb-8 leading-relaxed opacity-80">
          <i className="font-bold">HITMAN</i> 에 오신 것을 환영합니다. <br />
          타겟을 잡고 최후의 1인이 되세요 !
        </p>
      </article>
      <Button
        onClick={() => navigate("/login")}
        className="bg-gradient-rainbow animate-gradient-move shadow-3d w-60 bg-[length:200%_200%] font-bold"
      >
        시작하기
      </Button>
    </div>
  );
};

export default Onboarding;
