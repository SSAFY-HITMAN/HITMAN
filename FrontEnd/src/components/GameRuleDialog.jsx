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
            게임 규칙
          </DialogTitle>
          <DialogDescription className="whitespace-pre-wrap text-left">
            <div>
              <ol className="list-inside leading-relaxed">
                <li className="mb-4">
                  <b className="text-lg">1. 기본 규칙</b>
                  <br />
                  {"  "}지도에 표시되는 타겟을 잡아야 합니다. 잡기 버튼은 타겟이{" "}
                  <span className="font-bold text-rose-400">5m</span> 내에
                  들어오면 활성화 됩니다.{" "}
                  <span className="font-bold text-rose-400">
                    나를 잡으려는 추격자
                  </span>
                  를 피해 끝까지 살아 남는 것도 잊지 마세요 !
                </li>
                <li className="mb-4">
                  <b className="text-lg">2. 생존구역 제한</b>
                  <br />
                  {"  "}구역을 일정 시간 벗어나면 아웃됩니다.
                  <span className="font-bold text-rose-400">
                    {"  "}구역은 시간에 따라 점점 줄어듭니다.
                  </span>
                </li>
                <li className="mb-4">
                  <b className="text-lg">3. 미션 </b>
                  <br />
                  {"  "}
                  <span className="font-bold text-rose-400">카메라</span>를
                  이용하여 특정 물체나 색상, 글자 등을 인식하는 미션이
                  주어집니다. 미션을 성공하면 아이템을 얻을 수 있습니다.
                </li>
                <li className="mb-4">
                  <b className="text-lg">4. 아이템 (적용시간 30초)</b>
                  <br />
                  {"  "}
                  <b>스텔스 망토</b> : 추격자가 내 위치를 못보게 제한
                  <br />
                  {"  "}
                  <b>방해 폭탄</b> : 추격자의 화면 사용 제한
                  <br />
                  {"  "}
                  <b>강화 총알</b> : 잡기 사정거리가 10m로 증가
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
