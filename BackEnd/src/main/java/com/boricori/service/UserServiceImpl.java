package com.boricori.service;

import com.boricori.dto.request.User.UserLoginRequest;
import com.boricori.dto.request.User.UserSignupRequest;
import com.boricori.dto.response.User.UserLoginResponse;
import com.boricori.entity.User;
import com.boricori.repository.userRepo.UserRepository;
import com.boricori.util.JwtUtil;
import com.boricori.util.ResponseEnum;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

  @Autowired
  UserRepository userRepo;

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
  public UserLoginResponse login(UserLoginRequest request) {
    User user = userRepo.findByEmail(request.getEmail());
    if (null != user) {
      String passwordEncoded = user.getPassword();
      if (passwordEncoder.matches(request.getPassword(), passwordEncoded)) {
        return UserLoginResponse.of(jwtUtil.createAccessToken(request.getEmail()),
            jwtUtil.createRefreshToken(request.getEmail()),
            ResponseEnum.SUCCESS);
      }
    }
    return UserLoginResponse.of(null, null, ResponseEnum.FAIL);
  }
}