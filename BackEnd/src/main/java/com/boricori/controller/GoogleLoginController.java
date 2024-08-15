package com.boricori.controller;

import com.boricori.dto.SocialProfile;
import com.boricori.dto.request.User.SocialLoginRequest;
import com.boricori.dto.AuthToken;
import com.boricori.dto.response.User.UserLoginResponse;
import com.boricori.entity.User;
import com.boricori.service.UserService;
import com.boricori.util.CookieUtil;
import com.boricori.util.JwtUtil;
import com.boricori.util.ResponseEnum;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.math.BigInteger;
import java.security.SecureRandom;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/auth/google")
public class GoogleLoginController {

  @Value("${google.redirect_url}")
  private String REDIRECT_URL;
  @Value("${google.client_id}")
  private String CLIENT_ID;
  @Value("${google.client_secret}")
  private String CLIENT_SECRET;

  @Autowired
  private JwtUtil jwtUtil;

  private static final String scope = "https://www.googleapis.com/auth/userinfo.email";

  private static RestTemplate restTemplate = new RestTemplate();

  @Autowired
  private UserService userService;

  @GetMapping("/getURL")
  public ResponseEntity<String> getURL(HttpServletRequest request){
    // Create a state token to prevent request forgery.
    // Store it in the session for later validation.
    HttpSession session = request.getSession();
    String state = new BigInteger(130, new SecureRandom()).toString(32);
    session.setAttribute("state", state);

    String url = "https://accounts.google.com/o/oauth2/v2/auth?"
        + "scope=" + scope + "&"
        + "access_type=offline&"
        + "include_granted_scopes=true&"
        + "response_type=code&"
        + "state=" + state + "&"
        + "redirect_uri=" + REDIRECT_URL + "&"
        + "client_id=" + CLIENT_ID;
    String body = String.format("{\"link\":\"%s\"}", url);
    return ResponseEntity.status(200).body(body);
  }

  @GetMapping("/getToken")
  public ResponseEntity<UserLoginResponse> getToken(@RequestBody SocialLoginRequest socReq,HttpServletRequest req, HttpServletResponse resp) throws IOException {
    String code = socReq.getCode();
    String state = socReq.getState();
    HttpSession session = req.getSession();
    if (session.getAttribute("state") == null || !session.getAttribute("state").equals(state)){
      return ResponseEntity.status(ResponseEnum.NOT_ACCEPTABLE.getCode()).body(null);
//      return "state 안맞음, expected: " + session.getAttribute("state") + ", actual: " + state; // 누군가 탈취한 정보로 접근중
    }

    try{
      AuthToken token = exchangeCodeForToken(code);
      String email = getGoogleEmail(token.getAccess_token());
      User user = userService.findByEmail(email);
      if (user == null) {
        // 새로 가입할 유저
        UserLoginResponse userLoginResponse = UserLoginResponse.builder()
            .email(email)
            .build();
        return ResponseEntity.status(ResponseEnum.SIGNUP.getCode()).body(userLoginResponse);
      } else {
        // 기존 유저 로그인 수행
        String access = jwtUtil.createAccessToken(user.getUsername());
        Cookie cookie = CookieUtil.createCookie("refreshToken", jwtUtil.createRefreshToken(user.getUsername()));
        resp.addCookie(cookie);
        UserLoginResponse userLoginResponse = UserLoginResponse.builder()
            .email(user.getEmail())
            .username(user.getUsername())
            .accessToken(access)
            .build();
        return ResponseEntity.status(ResponseEnum.SUCCESS.getCode()).body(userLoginResponse);
      }
    }catch(Exception e){
      return ResponseEntity.status(ResponseEnum.NOT_ACCEPTABLE.getCode()).body(null);
    }
  }

  private AuthToken exchangeCodeForToken(String code){
    String requestURL = "https://oauth2.googleapis.com/token";

    MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
    formData.add("client_id", CLIENT_ID);
    formData.add("client_secret", CLIENT_SECRET);
    formData.add("code", code);
    formData.add("grant_type", "authorization_code");
    formData.add("redirect_uri", REDIRECT_URL);

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
    HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(formData, headers);

    ResponseEntity<AuthToken> responseEntity = restTemplate.exchange(
        requestURL,
        HttpMethod.POST,
        entity,
        AuthToken.class
    );

    return responseEntity.getBody();
  }


  public String getGoogleEmail(String token) throws RuntimeException{
    String url = "https://www.googleapis.com/oauth2/v2/userinfo";

    HttpHeaders headers = new HttpHeaders();
    headers.set("Authorization", String.format("Bearer %s", token));

    HttpEntity<String> entity = new HttpEntity<>(headers);

    ResponseEntity<SocialProfile> responseEntity = restTemplate.exchange(url, HttpMethod.GET,
          entity, SocialProfile.class);
    SocialProfile body = responseEntity.getBody();
    if (body == null){
      throw new RuntimeException();
    }
    return body.getEmail();
  }


}
