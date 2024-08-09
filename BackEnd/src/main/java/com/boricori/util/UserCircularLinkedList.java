package com.boricori.util;

import com.boricori.entity.User;
import java.util.List;

public class UserCircularLinkedList extends CircularLinkedList {

  public UserCircularLinkedList(Object o) {
    super(o);
  }

  public UserCircularLinkedList(List list) {
    super(list);
  }

  public void removeByName(String name) {
    Node<User> currNode = tail.next;
    Node<User> prevNode;

    for (int i = 0; i < size; i++) {
      prevNode = currNode;
      currNode = currNode.next;

      if (currNode.data.getUsername().equals(name)) {
        prevNode.next = currNode.next;
        size--;
        return;
      }
    }
  }

  public Node<User> getByUsername(String username) {
    Node<User> currNode = tail.next; // 시작 노드
    do {
      if (currNode.data.getUsername().equals(username)) {
        return currNode;
      }
      currNode = currNode.next;
    } while (currNode != tail.next); // 한 바퀴 다 돌면 종료

    return null;
  }

  public Node<User> killTarget(String username){

    Node<User> currNode = tail.next; // 시작 노드

    do {
      if (currNode.data.getUsername().equals(username)) {
        Node<User> target = currNode.next;
        currNode.next = target.next;
        size--;
        return target;
      }
      currNode = currNode.next;
    } while (currNode != tail.next); // 한 바퀴 다 돌면 종료

    return null;
  }

}

