package com.boricori.entity;


import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Builder;
import lombok.Getter;

@Entity
@Getter
public class InGameItems {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long inItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "play_id")
    private GameParticipants user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private Item item;

    private boolean used;

    @Builder
    public InGameItems(GameParticipants user, Item item){
      this.user = user;
      this.item = item;
      used = false;
    }

    public void useItem(){
      used = !used;
    }

}