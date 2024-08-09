package com.boricori.util;

import com.boricori.exception.NoSuchTokenException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

  @Value("${jwt.secret}")
  private String secret;

  private SecretKey secretKey;

  @Autowired
  private RedisTemplate<String, String> redisTemplate;

  @PostConstruct
  protected void init() {
    secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8),
        Jwts.SIG.HS256.key().build().getAlgorithm());
  }

  public String createAccessToken(String username) {
    Claims claims = Jwts.claims().subject(username).build();
    long validFor = 1000 * 60 * 60; // 1 hour
    return Jwts.builder()
        .claims(claims)
        .issuedAt(new Date(System.currentTimeMillis()))
        .expiration(new Date(System.currentTimeMillis() + validFor))
//            .signWith(secretKey)
        .signWith(secretKey, SignatureAlgorithm.HS256)
        .compact();
  }


  public String createRefreshToken(String username) {
    String token = UUID.randomUUID().toString();
    redisTemplate.opsForValue()
        .set(username + "-refresh", token, 100 * 60 * 60 * 24 * 14, TimeUnit.SECONDS);
    return token;
  }

//  public String createRefreshToken(String username) {
//    Claims claims = Jwts.claims().subject(username).build();
//    long validFor = 1000 * 60 * 60 * 24 * 14; // 2 weeks
//    String token = Jwts.builder()
//        .claims(claims)
//        .issuedAt(new Date(System.currentTimeMillis()))
//        .expiration(new Date(System.currentTimeMillis() + validFor))
//        .signWith(secretKey)
//        .compact();
//
//    return token;
//  }


  public Boolean isExpired(String token) throws NoSuchTokenException {
    try {
      return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload()
          .getExpiration().before(new Date());
    } catch (Exception e) {
      throw new NoSuchTokenException();
    }
  }

  public String getUsername(String accessToken) {
    Claims claim = Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(accessToken)
        .getPayload();
    return claim.getSubject();
  }


  public boolean isValidRefreshToken(String username, String refreshToken) {
    String token = redisTemplate.opsForValue().get(username + "-refresh");
    return refreshToken.equals(token);
  }

}
