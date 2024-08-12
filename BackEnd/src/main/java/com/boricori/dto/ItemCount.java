package com.boricori.dto;

import com.querydsl.core.annotations.QueryProjection;
import lombok.Data;

@Data
public class ItemCount {

  Long itemId;

  int count;

  @QueryProjection
  public ItemCount(Long itemId, int count) {
    this.itemId = itemId;
    this.count = count;
  }
}
