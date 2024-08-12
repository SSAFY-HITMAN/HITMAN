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

  public Node<User> identifyTarget(long gameId, String username){
    return catchableList.get(gameId).identifyTarget(username);
  }

  public Node<User> catchTargetForUser(long gameId, String username) {
    return catchableList.get(gameId).removeTargetForUser(username);
  }


  public Node<User> identifyHunter(long gameId, String username) {
    return catchableList.get(gameId).identifyHunter(username);
  }


  public Node<User> removePlayerAndReturnHunter(long gameId, String username){
    return catchableList.get(gameId).removePlayerAndReturnHunter(username);

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
