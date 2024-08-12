package com.boricori.repository.inGameRepo;

import com.boricori.entity.Mission;
import com.boricori.entity.QMission;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class MissionRepositoryImpl {

  QMission mission = QMission.mission;

  private final JPAQueryFactory jpaQueryFactory;

  public List<Mission> getMissions(int currPlayers) {
    return jpaQueryFactory.selectFrom(mission)
        .orderBy(Expressions.numberTemplate(Double.class, "function('rand')").asc())
        .limit(currPlayers-1) //몇개를 뽑아올건지
        .fetch();
  }

  public Mission changeMission(Long missionId) {
    return jpaQueryFactory.selectFrom(mission)
        .where(mission.id.ne(missionId))
        .orderBy(Expressions.numberTemplate(Double.class, "function('rand')").asc())
        .fetchFirst();
  }
}
