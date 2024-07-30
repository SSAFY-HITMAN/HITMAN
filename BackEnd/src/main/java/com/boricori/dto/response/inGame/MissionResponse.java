package com.boricori.dto.response.inGame;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
public class MissionResponse {

  @Schema(description = "미션 아이디")
  Long missionId;

  @Schema(description = "미션 카테고리")
  int category;

  @Schema(description = "미션 목표")
  String target;

  @Schema(description = "미션 목표 영어")
  String targetEn;

  @Builder
  public MissionResponse(Long missionId, int category, String target, String targetEn){
    this.missionId = missionId;
    this.category = category;
    this.target = target;
    this.targetEn = targetEn;
  }
}
