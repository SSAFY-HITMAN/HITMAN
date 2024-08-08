package com.boricori.repository.inGameRepo;

import com.boricori.entity.GameParticipants;
import com.boricori.entity.InGameItems;
import com.boricori.entity.InGameMissions;
import com.boricori.entity.Item;
import com.boricori.entity.Mission;
import com.boricori.entity.QInGameItems;
import com.boricori.entity.QInGameMissions;
import com.boricori.entity.QMission;
import com.boricori.entity.User;
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
        .where(ig_missions.user.eq(player).and(ig_missions.missionId.id.eq(missionId)))
        .set(ig_missions.done, true)
        .execute();
  }


  public void useItem(GameParticipants player, Long itemId) {
    jpaQueryFactory
        .update(ig_items)
        .set(ig_items.used, true)
        .where(ig_items.user.id.eq(player.getId()).and(ig_items.item.id.eq(itemId)))
        .execute();
  }

  public List<Mission> getUserMissions(User user){
    return jpaQueryFactory
        .select(ig_missions.missionId)
        .from(ig_missions)
        .where(ig_missions.user.id.eq(user.getUserId()).and(ig_missions.done.eq(false)))
        .fetch();
  }

  public List<Item> getUserItems(User user){
    return jpaQueryFactory
        .select(ig_items.item)
        .from(ig_items)
        .where(ig_items.user.id.eq(user.getUserId()).and(ig_items.used.eq(false)))
        .fetch();
  }

  public List<Mission> getMissions(GameParticipants player) {
    return jpaQueryFactory
        .select(ig_missions.missionId)
        .from(ig_missions)
        .where(ig_missions.user.id.eq(player.getId()))
        .fetch();
  }

  public List<Item> getItems(GameParticipants player) {
    return jpaQueryFactory
        .select(ig_items.item)
        .from(ig_items)
        .where(ig_items.user.id.eq(player.getId()))
        .fetch();
  }
}
