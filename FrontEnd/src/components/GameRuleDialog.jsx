import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@components/ui/Dialog";

const GameRuleDialog = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-80">
        <DialogHeader>
          <DialogTitle className="mb-4 text-center text-2xl font-bold">
            게임 규칙 요약
          </DialogTitle>
          <DialogDescription className="whitespace-pre-wrap text-left">
            <div>
              <ol className="list-inside leading-relaxed">
                <li className="mb-4">
                  <b className="text-lg">1. 기본 규칙</b>
                  <br />
                  {"  "}지도에는 "내가 잡을" 타겟만 표시됩니다.
                  <div className="font-bold text-rose-400">
                    {"  "}"나를 잡을" 사람이 누구인지는 모릅니다.
                  </div>
                </li>
                <li className="mb-4">
                  <b className="text-lg">2. 생존구역 제한</b>
                  <br />
                  {"  "}구역을 일정 시간 벗어나면 아웃됩니다.
                  <div className="font-bold text-rose-400">
                    {"  "}구역은 시간에 따라 점점 줄어듭니다.
                  </div>
                </li>
                <li className="mb-4">
                  <b className="text-lg">3. 미션 </b>
                  <br />
                  {"  "}
                  <span className="font-bold text-rose-400">카메라</span>를
                  이용하여 특정 물체나 색상, 글자 등을 인식하는 미션이
                  주어집니다.
                  <br />
                  {"  "}미션 수행시 아이템을 얻을 수 있습니다.
                </li>
                <li className="mb-4">
                  <b className="text-lg">4. 아이템</b>
                  <br />
                  {"  "}잡기 사정거리 늘리기, 내 위치 숨기기, 원하는 사람의 위치
                  보기 등이 있습니다.
                </li>
                <li className="mb-4">
                  <b className="text-lg">5. 우승자 판단</b>
                  <br />
                  {"  "}마지막 2명이 남은 경우, 다음 기준에 따라 우승자를
                  정합니다.
                  <br />
                  {"  "}(1){" "}
                  <span className="font-bold text-rose-400">kill 수</span>가 더
                  높은 사람이 승리합니다.
                  <br />
                  {"  "}(2) kill 수가 같은 경우,{" "}
                  <span className="font-bold text-rose-400">
                    미션 수행 개수
                  </span>
                  가 더 많은 사람이 승리합니다.
                  <br />
                  {"  "}(3) 미션 수행 개수도 같은 경우, 무승부입니다.
                </li>
              </ol>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default GameRuleDialog;
