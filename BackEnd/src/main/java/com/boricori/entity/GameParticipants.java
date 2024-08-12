package com.boricori.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GameParticipants {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "play_id")
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "game_id")
  private GameRoom gameRoom;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  private User user;

  @ColumnDefault("true")
  private boolean alive;
  @ColumnDefault("0")
  private int missionComplete;
  @ColumnDefault("0")
  private int kills;
  @ColumnDefault("0")
  private int bullets;
  @ColumnDefault("0")
  private int score;

  @Builder
  public GameParticipants(GameRoom gameRoom, User user) {
    this.gameRoom = gameRoom;
    this.user = user;
    alive = true;
  }

  public void eliminate() {
    this.alive = false;
  }

  public void aliveUser() {
    this.alive = true;
  }

  public void missionCompleted() {
    this.missionComplete++;
    score += 50;
  }

  public void kill() {
    this.kills++;
    this.bullets--;
    score += 100;
  }

  public void getBullet() {
    this.bullets++;
  }


  public void addBullets(int bullets) {
    this.bullets += bullets;
  }
}
