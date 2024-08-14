package com.boricori.entity;

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

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InGameMissions {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long inMissionId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "play_id")
  private GameParticipants user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "mission_id")
  private Mission missionId;

  private boolean done;

  @Builder
  public InGameMissions(GameParticipants user, Mission missionId){
    this.user = user;
    this.missionId = missionId;
    done = false;
  }

  public void completeMission(){
    done = !done;
  }

}
