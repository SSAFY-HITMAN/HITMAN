package com.boricori.dto;

import com.querydsl.core.annotations.QueryProjection;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ItemCount {

  Long itemId;

  int count;

  @QueryProjection
  @Builder
  public ItemCount(Long itemId, int count) {
    this.itemId = itemId;
    this.count = count;
  }
}
