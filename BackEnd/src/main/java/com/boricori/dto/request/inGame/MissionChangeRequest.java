package com.boricori.dto.request.inGame;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class MissionChangeRequest {
    @Schema(description = "유저 닉네임")
    private String username;
    @Schema(description = "게임방 번호")
    private long gameId;
    @Schema(description = "미션 아이디")
    Long missionId;
}
