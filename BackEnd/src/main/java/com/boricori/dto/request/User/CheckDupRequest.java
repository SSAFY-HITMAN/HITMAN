package com.boricori.dto.request.User;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class CheckDupRequest {
  @Schema(name = "검사할 항목", example = "email or username")
  String type;
  @Schema(name = "검사할 값", example = "myEmail@naver.com")
  String value;

}
