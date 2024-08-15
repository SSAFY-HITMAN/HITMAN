package com.boricori.util;

import com.boricori.entity.User;

import java.util.ArrayList;
import java.util.List;

public class UserCircularLinkedList extends CircularLinkedList {

  public UserCircularLinkedList(Object o) {
    super(o);
  }

  public UserCircularLinkedList(List list) {
    super(list);
  }

  public Node<User> identifyTarget(String username) {
    Node<User> currNode = tail.next; // 시작 노드
    do {
      if (currNode.data.getUsername().equals(username)) {
        return currNode.next;
      }
      currNode = currNode.next;
    } while (currNode != tail.next); // 한 바퀴 다 돌면 종료

    return null;
  }

  public Node<User> removeTargetForUser(String username){

    if (size == 1) {
      // 만약 리스트에 하나의 노드만 있을 경우, 그 노드를 제거하고 리스트를 비웁니다.
      Node<User> soleNode = tail;
      tail = null;
      size = 0;
      return null; // 유저가 한명 남았을 때 타겟 잡기를 요청시 여기로 들어옴, 생길 일 없는 상황
    }

    Node<User> currNode = tail.next; // 시작 노드

    do {
      if (currNode.data.getUsername().equals(username)) {
        Node<User> target = currNode.next;
        currNode.next = target.next;
        size--;
        // 타겟이 tail인 경우 tail 업데이트
        if (target == tail) {
          tail = currNode;
        }

        return target; // 제거된 타겟 반환
      }
      currNode = currNode.next;
    } while (currNode != tail.next); // 한 바퀴 다 돌면 종료

    return null;
  }

  public List<String> toList() {
    List<String> usernameList = new ArrayList<>();
    if (isEmpty()) {
      return usernameList; // 빈 리스트를 반환
    }

    Node<User> currNode = tail.next;
    do {
      usernameList.add(currNode.data.getUsername()); // User 객체에서 username을 추출하여 추가
      currNode = currNode.next;
    } while (currNode != tail.next);

    return usernameList;
  }

  public Node<User> identifyHunter(String username) {
    if (isEmpty()) {
      return null; // 리스트가 비어 있는 경우 null 반환
    }

    Node<User> currNode = tail.next;
    do {
      if (currNode.next.data.getUsername().equals(username)) {
        return currNode; // 헌터 반환
      }
      currNode = currNode.next;
    } while (currNode != tail.next);

    return null; // 헌터를 찾지 못한 경우 null 반환
  }


  public Node<User> removePlayerAndReturnHunter(String username) {
    // 리스트에 노드가 하나만 남아 있을 경우 처리
    if (size == 1) {
      Node<User> soleNode = tail;
      tail = null;
      size = 0;
      return null;  // 유저가 혼자남았는데 나가버리면 여기 실행, 낮은 가능성 있지만 시간 없으므로 패스
    }

    Node<User> currNode = tail.next;  // 시작 노드

    // 원형 리스트에서 노드를 탐색하면서 헌터를 찾음
    do {
      if (currNode.next.data.getUsername().equals(username)) {
        Node<User> target = currNode.next;  // 타겟 노드
        currNode.next = target.next;  // 타겟 제거

        // 타겟이 tail인 경우 tail 업데이트
        if (target == tail) {
          tail = currNode;
        }

        size--;
        return currNode;  // 타겟의 헌터(이전 노드) 반환
      }
      currNode = currNode.next;
    } while (currNode != tail.next);  // 리스트 한 바퀴 돌기

    return null;  // 해당 유저를 찾지 못한 경우 null 반환
  }

}

