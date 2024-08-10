import { useNavigate } from "react-router-dom";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@components/ui/Carousel";
import { Button } from "@components/ui/Button";
import onboardingImage1 from "@assets/onboarding-image-1.png";
import onboardingImage2 from "@assets/onboarding-image-2.png";
import onboardingImage3 from "@assets/onboarding-image-3.png";

const Onboarding = () => {
  const navigate = useNavigate();

  const item1 = (
    <div className="flex flex-col items-center">
      <img
        src={onboardingImage1}
        alt="onboarding-image-1"
        className="drop-shadow-2xl"
      />
      <article>
        <h1 className="mb-4 text-4xl font-bold leading-relaxed">
          현실에서 즐기는
          <br />
          <span className="bg-gradient-to-r from-amber-200 to-red-300 bg-clip-text text-transparent">
            추격 서바이벌
          </span>{" "}
          게임 !
        </h1>
        <p className="mb-16 leading-relaxed opacity-80">
          <i className="font-bold text-red-400">HITMAN</i> 에 오신 것을
          환영합니다.
        </p>
      </article>
      <div className="bg-gradient-rainbow animate-gradient-move bg-[length:200%_200%] bg-clip-text font-bold text-transparent opacity-60">
        &lt;&lt; 밀어서 넘기기{" "}
      </div>
    </div>
  );

  const item2 = (
    <div className="flex flex-col items-center justify-center">
      <article>
        <h1 className="mb-4 mt-12 text-4xl font-bold leading-relaxed">
          어릴 때 즐기던
          <br />
          <span className="bg-gradient-to-r from-rose-400 to-teal-300 bg-clip-text text-transparent">
            꼬리잡기 게임
          </span>{" "}
          그대로
        </h1>
        <p className="mb-16 leading-relaxed opacity-80">
          타겟을 잡고 최후의 1인이 되세요.
          <br />
          <span className="font-bold text-red-400">당신을 노리는 사람</span>이
          있다는 것도 잊지 마세요 !
        </p>
      </article>
      <img
        src={onboardingImage2}
        alt="onboarding-image-2"
        className="mb-12 w-80 drop-shadow-2xl"
      />
      <div className="bg-gradient-rainbow animate-gradient-move bg-[length:200%_200%] bg-clip-text font-bold text-transparent opacity-60">
        &lt;&lt; 밀어서 넘기기{" "}
      </div>
    </div>
  );

  const item3 = (
    <div className="flex flex-col items-center justify-center">
      <img
        src={onboardingImage3}
        alt="onboarding-image-3"
        className="mb-12 mt-12 w-96 drop-shadow-2xl"
      />
      <article>
        <h1 className="mb-4 text-4xl font-bold leading-relaxed">
          제한된 시간과 <br />
          <span className="bg-gradient-to-r from-emerald-200 to-pink-400 bg-clip-text text-transparent">
            줄어드는 생존 구역
          </span>
        </h1>
        <p className="mb-8 leading-relaxed opacity-80">
          카메라를 이용해 <span className="font-bold text-red-400">미션</span>을
          수행하고 <br />
          <span className="font-bold text-red-400">아이템</span>을 얻어 끝까지
          살아남으세요.
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

  return (
    <Carousel className="flex h-screen items-center justify-center overflow-hidden">
      <CarouselContent>
        <CarouselItem>{item1}</CarouselItem>
        <CarouselItem>{item2}</CarouselItem>
        <CarouselItem>{item3}</CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};

export default Onboarding;
