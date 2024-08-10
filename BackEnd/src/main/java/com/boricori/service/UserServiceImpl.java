package com.boricori.service;

import com.boricori.dto.request.User.UserLoginRequest;
import com.boricori.dto.request.User.UserSignupRequest;
import com.boricori.dto.response.User.RankDtoResponse;
import com.boricori.dto.response.User.UserLoginResponse;
import com.boricori.entity.GameRoom;
import com.boricori.entity.User;
import com.boricori.repository.userRepo.UserRepository;
import com.boricori.repository.userRepo.UserRepositoryImpl;
import com.boricori.util.CookieUtil;
import com.boricori.util.JwtUtil;
import com.boricori.util.ResponseEnum;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {

  @Autowired
  UserRepository userRepo;

  @Autowired
  UserRepositoryImpl userRepoImpl;

  @Autowired
  PasswordEncoder passwordEncoder;

  @Autowired
  JwtUtil jwtUtil;

  @Override
  public User signup(UserSignupRequest request) {
    User newUser = User.builder()
        .email(request.getEmail())
        .password(passwordEncoder.encode(request.getPassword()))
        .username(request.getUsername())
        .build();

    User signedUp = userRepo.save(newUser);
    return signedUp;
  }

  @Override
  public int findUserScore(String email){
    return userRepo.findUserRankingByEmail(email);
  }

  @Override
  public List<RankDtoResponse> findAllRank(){
    List<User> RankAll = userRepo.findAllByOrderByScoresAsc();
    List<RankDtoResponse> rankList = new ArrayList<>();
    for (int i=0; i<RankAll.size(); i++) {
      rankList.add(new RankDtoResponse(i+1, RankAll.get(i)));
    }

    return rankList;
  }

  public UserLoginResponse login(UserLoginRequest request, HttpServletResponse response) {
    User user = userRepo.findByEmail(request.getEmail());
    if (null != user) {
      String passwordEncoded = user.getPassword();
      if (passwordEncoder.matches(request.getPassword(), passwordEncoded)) {
        String access = jwtUtil.createAccessToken(user.getUsername());
        Cookie cookie = CookieUtil.createCookie("refreshToken", jwtUtil.createRefreshToken(user.getUsername()));
        response.addCookie(cookie);
        return UserLoginResponse.builder()
            .email(user.getEmail())
            .username(user.getUsername())
            .accessToken(access)
            .build();
      }
    }
    return null;
  }

  @Override
  public User findByEmail(String email){
    return userRepo.findByEmail(email);
  }

  @Override
  public User findByUsername(String username) {
    return userRepo.findByUsername(username);
  }

  @Override
  public boolean isDupEmail(String value) {
    return userRepo.findByEmail(value) != null;
  }

  @Override
  public boolean isDupUsername(String value) {
    return userRepo.findByUsername(value) != null;
  }


}
