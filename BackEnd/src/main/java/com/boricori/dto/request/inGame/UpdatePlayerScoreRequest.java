package com.boricori.dto.request.inGame;

import com.querydsl.core.annotations.QueryProjection;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
public class UpdatePlayerScoreRequest {

    @Schema(description = "유저 아이디")
    private Long userId;
    @Schema(description = "미션 수행 여부")
    private int missionComplete;
    @Schema(description = "킬 수")
    private int kills;

    @QueryProjection
    @Builder
    public UpdatePlayerScoreRequest(Long userId, int missionComplete, int kills) {
        this.userId = userId;
        this.missionComplete = missionComplete;
        this.kills = kills;
    }
}
