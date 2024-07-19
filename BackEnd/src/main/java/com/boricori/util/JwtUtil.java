package com.boricori.util;

import com.boricori.exception.TokenExpiredException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    private SecretKey secretKey;


    private Map<UUID, String> refreshTokens = new HashMap<>();

  @PostConstruct
    protected void init(){
    System.out.println("secret: " + secret);
    secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), Jwts.SIG.HS256.key().build().getAlgorithm());
    }

    public String createAccessToken(String email) {
      Claims claims = Jwts.claims().subject(email).build();
      long validFor = 1000 * 60 * 60; // 1 hour
      return Jwts.builder()
            .claims(claims)
            .issuedAt(new Date(System.currentTimeMillis()))
            .expiration(new Date(System.currentTimeMillis() + validFor))
            .signWith(secretKey)
            .compact();
    }


  public UUID createRefreshToken(String email) {
    UUID token = UUID.randomUUID();
    refreshTokens.put(token, email);
    return token;
  }

  public Boolean isExpired(String token) {
    return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload().getExpiration().before(new Date());
  }


  public boolean verifyAccessToken(String accessToken) {
        try {
          if (isExpired(accessToken)){
            return false;
          }
            Claims claim = Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(accessToken).getPayload();
            return claim.getSubject();
        }

        catch (Exception e) {
            return false;
        }
    }


    public void verify(String accessToken, String refreshToken){
        if (isExpired(accessToken)){
          if (isExpired(refreshToken)){
            throw new TokenExpiredException();
          }
          else{

          }
        }
    }


}
