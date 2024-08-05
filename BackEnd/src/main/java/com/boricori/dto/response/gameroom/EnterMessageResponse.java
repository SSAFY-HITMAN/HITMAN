package com.boricori.dto.response.gameroom;

import lombok.Data;

import java.util.List;

@Data
public class EnterMessageResponse {
    private String msgType;
    private List<String> users;

    public EnterMessageResponse(String msgType, List<String> users) {
        this.msgType = msgType;
        this.users = users;
    }
}
