package com.boricori.dto.request.gameroom;


import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class GameRequest {
    @Schema(description = "게임방 이름", example = "gameRoom1")
    private String name;

    @Schema(description = "게임방 인원 제한", example = "10")
    private int maxPlayer;

    @Schema(description = "게임 시간", example = "10")
    private int gameTime; // 게임 시간

    @Schema(description = "맵 크기", example = "100")
    private int mapSize;
}
