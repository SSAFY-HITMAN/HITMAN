package com.boricori.repository.ParticipantRepo;

import com.boricori.dto.request.inGame.QUpdatePlayerScoreRequest;
import com.boricori.dto.request.inGame.UpdatePlayerScoreRequest;
import com.boricori.dto.response.inGame.EndGameUserInfoResponse;
import com.boricori.dto.response.inGame.QEndGameUserInfoResponse;
import com.boricori.entity.GameParticipants;
import com.boricori.entity.GameRoom;
import com.boricori.entity.QGameParticipants;
import com.boricori.entity.QUser;
import com.boricori.entity.User;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ParticipantRepositoryImpl {

  private EntityManager em;

  private JPAQueryFactory queryFactory;

  private QGameParticipants participants = QGameParticipants.gameParticipants;

  private QUser user = QUser.user;

  public ParticipantRepositoryImpl(
      @Autowired EntityManager em) {
    this.queryFactory = new JPAQueryFactory(em);
  }

  public void makeGameParticipants() {

  }

  public GameParticipants getByUsername(String username, Long roomId){
    return queryFactory
        .selectFrom(participants)
        .where(participants.user.username.eq(username)
        .and(participants.gameRoom.id.eq(roomId)))
        .fetchOne();
  }

  public long addKills(User user) {
    return queryFactory.update(participants)
        .set(participants.kills, participants.kills.add(1))
        .where(participants.user.userId.eq(user.getUserId()))
        .execute();
  }

  public long changeStatus(User target, long gameId) {
    return queryFactory.update(participants)
        .set(participants.alive, false)
        .where(participants.user.userId.eq(target.getUserId()).and(participants.gameRoom.id.eq(gameId)))
        .execute();
  }

  public long changeStatusByName(String username, long gameId) {
    return queryFactory.update(participants)
        .set(participants.alive, false)
        .where(participants.user.username.eq(username).and(participants.gameRoom.id.eq(gameId)))
        .execute();
  }

  public GameRoom getPlaying(String username) {
    return queryFactory
        .select(participants.gameRoom)
        .from(participants)
        .where(participants.user.username.eq(username).and(participants.gameRoom.isActivated.eq(true)))
        .fetchOne();
  }

  public List<EndGameUserInfoResponse> getEndGamePlayersInfo(Long roomId) {
    return queryFactory
            .select(new QEndGameUserInfoResponse(
                    participants.user.username,
                    participants.missionComplete,
                    participants.kills,
                    participants.score
            ))
            .from(participants)
            .join(participants.user, user)
            .where(participants.gameRoom.id.eq(roomId))
            .orderBy(participants.score.desc())
            .fetch();
  }
  
  public UpdatePlayerScoreRequest getTwoUserInfo(String username, Long roomId){
    return queryFactory
            .select(new QUpdatePlayerScoreRequest(
                    participants.user.userId,
                    participants.missionComplete,
                    participants.kills))
            .from(participants)
            .where(participants.user.username.eq(username)
                    .and(participants.gameRoom.id.eq(roomId)))
            .fetchOne();
  }

  public void updateUserScore(Long userId, int score) {
    queryFactory.update(participants)
            .set(participants.score, participants.score.add(score))
            .where(participants.user.userId.eq(userId))
            .execute();
  }

  public List<GameParticipants> getPlayersInfo(Long roomId){
    return queryFactory
            .selectFrom(participants)
            .where(participants.gameRoom.id.eq(roomId))
            .fetch();
  }
}
