package com.boricori.repository.inGameRepo;

import com.boricori.dto.ItemCount;
import com.boricori.dto.QItemCount;
import com.boricori.entity.GameParticipants;
import com.boricori.entity.InGameItems;
import com.boricori.entity.Mission;
import com.boricori.entity.QInGameItems;
import com.boricori.entity.QInGameMissions;
import com.boricori.entity.QMission;
import com.querydsl.jpa.impl.JPAQueryFactory;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public class InGameRepositoryImpl {
  private final JPAQueryFactory jpaQueryFactory;

  private QInGameItems ig_items = QInGameItems.inGameItems;

  private QInGameMissions ig_missions = QInGameMissions.inGameMissions;

  private QMission missions = QMission.mission;

  public InGameRepositoryImpl(JPAQueryFactory qf){
    jpaQueryFactory = qf;
  }


  public void updateMission(Long missionId, GameParticipants player) {
    jpaQueryFactory
        .update(ig_missions)
        .set(ig_missions.done, true)
        .where(ig_missions.user.id.eq(player.getId()).and(ig_missions.missionId.id.eq(missionId)))
        .execute();
  }


  public InGameItems getActivatedItem(GameParticipants player, Long itemId) {
    return jpaQueryFactory
        .select(ig_items)
        .from(ig_items)
        .where(ig_items.user.id.eq(player.getId())
            .and(ig_items.item.id.eq(itemId)))
        .fetchOne();
  }


  public List<InGameItems> targetItemsCount(GameParticipants target){
    return jpaQueryFactory
        .select(ig_items)
        .from(ig_items)
        .where(ig_items.user.id.eq(target.getId()))
        .fetch();
  }

  public List<ItemCount> getPlayersItems(GameParticipants user) {
    return jpaQueryFactory
        .select(new QItemCount(
            ig_items.item.id,
            ig_items.count
        ))
        .from(ig_items)
        .where(ig_items.user.id.eq(user.getId()))
        .fetch();
  }

  public List<Mission> getMissions(GameParticipants player) {
    return jpaQueryFactory
        .select(ig_missions.missionId)
        .from(ig_missions)
        .where(ig_missions.user.id.eq(player.getId()))
        .fetch();
  }

  public void addItems(GameParticipants participant, InGameItems igItem) {
    jpaQueryFactory.update(ig_items).set(ig_items.count, ig_items.count.add(igItem.getCount())).where(ig_items.user.id.eq(participant.getId())).execute();
  }
}
