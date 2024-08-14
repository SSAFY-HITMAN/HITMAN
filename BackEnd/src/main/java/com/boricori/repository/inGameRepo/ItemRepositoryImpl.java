package com.boricori.repository.inGameRepo;

import com.boricori.entity.Item;
import com.boricori.entity.QItem;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ItemRepositoryImpl {
  QItem items = QItem.item;

  private final JPAQueryFactory jpaQueryFactory;

  public Item getItem() {
    return jpaQueryFactory.selectFrom(items)
        .orderBy(Expressions.numberTemplate(Double.class, "function('rand')").asc())
        .fetchFirst();
  }

  public List<Item> allItems(){
    return jpaQueryFactory.select(items)
        .from(items)
        .fetch();
  }
}
