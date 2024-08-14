package com.boricori.repository.GameRoomRepo;

import com.boricori.entity.GameRoom;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface GameRoomRepository extends JpaRepository<GameRoom, Long> {

    @Query("SELECT g.maxPlayer FROM GameRoom g WHERE g.id = :roomId")
    int findMaxPlayerByRoomId(@Param("roomId") Long roomId);

    Optional<GameRoom> findByGameCodeAndIsActivated(String gameCode, boolean active);
}
