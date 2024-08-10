package com.boricori.dto.response.inGame;

import com.boricori.entity.GameParticipants;
import com.querydsl.core.annotations.QueryProjection;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Data
public class EndGameUserInfoResponse {

    @Schema(description = "유저 이름")
    private String userName;
    @Schema(description = "미션 수행 여부")
    private int missionComplete;
    @Schema(description = "킬 수")
    private int kills;

    @QueryProjection
    @Builder
    public EndGameUserInfoResponse(String userName, int missionComplete, int kills) {
        this.userName = userName;
        this.missionComplete = missionComplete;
        this.kills = kills;
    }
}
