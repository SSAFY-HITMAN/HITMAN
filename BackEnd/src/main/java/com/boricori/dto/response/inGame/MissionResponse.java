package com.boricori.dto.response.inGame;

import com.boricori.entity.Mission;
import com.querydsl.core.annotations.QueryProjection;
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

  @Schema(description = "미션 완료 여부")
  boolean done;

  @QueryProjection
  @Builder
  public MissionResponse(Long missionId, int category, String target, String alt, boolean done){
    this.missionId = missionId;
    this.category = category;
    this.target = target;
    this.alt = alt;
    this.done = done;
  }

  public static MissionResponse of(Mission mission){
    return MissionResponse.builder()
        .missionId(mission.getId())
        .category(mission.getCategory())
        .target(mission.getTarget())
        .alt(mission.getAlt())
        .done(false)
        .build();
  }
}
