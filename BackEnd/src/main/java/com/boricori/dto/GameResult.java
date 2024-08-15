  package com.boricori.dto;

  import com.boricori.dto.response.inGame.EndGameUserInfoResponse;
  import java.util.List;
  import lombok.AllArgsConstructor;
  import lombok.Data;

  @Data
  public class GameResult {

    long gameId;

    String winner1;

    String winner2;

    List<EndGameUserInfoResponse> result;

    public GameResult(long gameId, String winner1, String winner2,
        List<EndGameUserInfoResponse> result) {
      this.gameId = gameId;
      this.winner1 = winner1;
      this.winner2 = winner2;
      this.result = result;
    }
  }