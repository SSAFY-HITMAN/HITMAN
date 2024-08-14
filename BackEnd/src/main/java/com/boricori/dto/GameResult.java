  package com.boricori.dto;

  import com.boricori.dto.response.inGame.EndGameUserInfoResponse;
  import java.util.List;
  import lombok.AllArgsConstructor;
  import lombok.Data;

  @Data
  @AllArgsConstructor
  public class GameResult {

    long gameId;

    String winner1;

    String winner2;

    List<EndGameUserInfoResponse> result;

  }