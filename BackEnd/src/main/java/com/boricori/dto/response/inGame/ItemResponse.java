package com.boricori.dto.response.inGame;

import com.boricori.entity.Item;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
public class ItemResponse {
  @Schema(description = "아이템 아이디")
  private Long itemId;

  @Schema(description = "아이템 이름")
  private String name;

  @Schema(description = "아이템 설명")
  private String description;


  @Builder
  public ItemResponse(Long itemId, String name, String description){
    this.itemId = itemId;
    this.name = name;
    this.description = description;
  }

  public static ItemResponse of(Item item){
    return ItemResponse.builder()
        .itemId(item.getId())
        .description(item.getDescription())
        .build();
  }
}
