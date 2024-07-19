package com.boricori.repository.userRepo;

import com.boricori.dto.request.User.UserLoginRequest;
import com.boricori.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {

<<<<<<< HEAD
    @Query(value = "SELECT COUNT(*) + 1 " +
            "FROM User " +
            "WHERE scores > (SELECT scores FROM User WHERE email = :email)")
    int findUserRankingByEmail(@Param("email") String email);

    List<User> findAllByOrderByScoresAsc();
=======
      User findByEmail(String email);
>>>>>>> 95e5f312786646cd1408a8623fd6b6b074dd9dd7
}
