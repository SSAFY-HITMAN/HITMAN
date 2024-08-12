package com.boricori.repository.inGameRepo;

import com.boricori.entity.GameParticipants;
import com.boricori.entity.InGameItems;
import com.boricori.entity.Item;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InGameItemsRepository extends JpaRepository<InGameItems, Long> {

  Optional<InGameItems> findByUserAndItem(GameParticipants player, Item item);
}
