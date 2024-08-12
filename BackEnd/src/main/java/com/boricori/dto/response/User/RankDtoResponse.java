package com.boricori.dto.response.User;


import com.querydsl.core.annotations.QueryProjection;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Schema(name = "유저 랭크")
@Data
public class RankDtoResponse {

    @Schema(description = "유저 아이디")
    String username;
    @Schema(description = "누적 점수")
    int score;

    @QueryProjection
    public RankDtoResponse(String username, int score) {
        this.username = username;
        this.score = score;
    }
}

