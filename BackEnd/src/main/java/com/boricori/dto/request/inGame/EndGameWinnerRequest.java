package com.boricori.dto.request.inGame;

import lombok.Data;

@Data
public class EndGameWinnerRequest {
    private String type;
    private String username;

    public EndGameWinnerRequest(String type, String username) {
        this.type = type;
        this.username = username;
    }
}
