package com.boricori.util;


import com.boricori.exception.NoSuchTokenException;
import com.boricori.exception.TokenExpiredException;
import com.boricori.exception.TokenFormatException;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;


public class JwtAuthenticationFilter implements Filter {

  JwtUtil jwtUtil;

  public JwtAuthenticationFilter(JwtUtil jwtUtil){
    this.jwtUtil = jwtUtil;
  }

  @Override
  public void init(FilterConfig filterConfig) throws ServletException {
    Filter.super.init(filterConfig);
  }

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
      throws IOException {
    HttpServletRequest httpRequest = (HttpServletRequest) request;
    HttpServletResponse httpResponse = (HttpServletResponse) response;
    Cookie[] cookies = httpRequest.getCookies();
    String refreshToken = null;
    if (cookies != null) {
      for (Cookie cookie : cookies) {
        if ("refreshToken".equals(cookie.getName())) {
          refreshToken = cookie.getValue();
        }
      }
    }
    String authHeader = httpRequest.getHeader("Authorization");

    try {
      if (authHeader == null || !authHeader.startsWith("Bearer ")) {
        throw new TokenFormatException();
      }
      String accessToken = authHeader.substring(7);
     if (isValidAccessToken(httpRequest, httpResponse, chain,accessToken)){
       chain.doFilter(httpRequest, httpResponse);
     }else {
       if (refreshToken == null){
         throw new TokenFormatException();
       }
       processRefreshToken(httpRequest, httpResponse, accessToken, refreshToken);
     }
    } catch (NoSuchTokenException | TokenExpiredException | TokenFormatException e) {
      System.out.println("filter exception");
      httpResponse.sendError(HttpServletResponse.SC_UNAUTHORIZED, "유효하지 않은 토큰입니다. 다시 로그인 해주세요.");
    } catch (Exception e) {
      System.out.println("filter exception2");
      httpResponse.sendError(HttpServletResponse.SC_UNAUTHORIZED, e.getMessage());
    }
  }

  private boolean isValidAccessToken(HttpServletRequest httpRequest, HttpServletResponse httpResponse, FilterChain chain, String accessToken) {
    if (jwtUtil.isExpired(accessToken)) {
      return false;
    }
    String username = jwtUtil.getUsername(accessToken);
    httpRequest.setAttribute("username", username);
    return true;
  }

  private void processRefreshToken(HttpServletRequest httpRequest, HttpServletResponse httpResponse, String accessToken, String refreshToken)
      throws IOException, NoSuchTokenException {
    if (!refreshToken.startsWith("Bearer ")) {
      throw new TokenFormatException();
    }
    refreshToken = refreshToken.substring(7);
    if (!jwtUtil.isValidRefreshToken(jwtUtil.getUsername(accessToken), refreshToken)) {
      throw new TokenExpiredException();
    }
    String newToken = jwtUtil.createAccessToken(jwtUtil.getUsername(accessToken));
    httpResponse.addHeader("newToken", newToken);
    httpResponse.sendError(ResponseEnum.TOKEN_RENEWED.getCode(), "토큰 재발급 완료");
  }


}


