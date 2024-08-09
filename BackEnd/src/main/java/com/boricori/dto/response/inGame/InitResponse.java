package com.boricori.dto.response.inGame;

import com.boricori.dto.response.gameroom.GameInfo;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
public class InitResponse {

  String status;

  private GameInfo gameInfo;

  @Schema(description = "내가 쫓는 사람의 닉네임")
  private String targetName;

  private List<MissionResponse> myMissions;

  private List<ItemResponse> myItems;

  @Builder
  public InitResponse(String status, GameInfo gameInfo, String targetName,
      List<MissionResponse> myMissions, List<ItemResponse> myItems) {
    this.status = status;
    this.gameInfo = gameInfo;
    this.targetName = targetName;
    this.myMissions = myMissions;
    this.myItems = myItems;
  }
}
