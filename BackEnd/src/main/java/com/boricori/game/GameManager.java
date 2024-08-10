package com.boricori.game;

import com.boricori.entity.User;
import com.boricori.util.Node;
import com.boricori.util.UserCircularLinkedList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;

public class GameManager {

  private static GameManager gameManager = new GameManager();
  public static HashMap<Long, UserCircularLinkedList> catchableList = new HashMap<>();

  public static GameManager getGameManager() {
    if (gameManager == null) {
      gameManager = new GameManager();
    }
    return gameManager;
  }

  public Node<User> getByUsername(long gameId, String username){
      return catchableList.get(gameId).getByUsername(username);
  }

  public Node<User> killTarget(long gameId, String username) {
    return catchableList.get(gameId).killTarget(username);
  }

  public boolean isLastTwo(long gameId){
    return catchableList.get(gameId).size() < 3;
  }

  public void shuffleUsers(List<User> users) {
    Collections.shuffle(users);
  }

  public UserCircularLinkedList makeUserCatchableList(List<User> users) {
    return new UserCircularLinkedList(users);
  }

  public List<String> EndGameUserInfo(long gameId){
    return catchableList.get(gameId).toList();
  }

}
