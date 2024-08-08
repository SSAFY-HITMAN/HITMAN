package com.boricori.dto.response.inGame;

import com.boricori.entity.Mission;
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
  String alt;

  @Builder
  public MissionResponse(Long missionId, int category, String target, String alt){
    this.missionId = missionId;
    this.category = category;
    this.target = target;
    this.alt = alt;
  }

  public static MissionResponse of(Mission mission){
    return MissionResponse.builder()
        .missionId(mission.getId())
        .category(mission.getCategory())
        .target(mission.getTarget())
        .alt(mission.getAlt())
        .build();
  }
}
