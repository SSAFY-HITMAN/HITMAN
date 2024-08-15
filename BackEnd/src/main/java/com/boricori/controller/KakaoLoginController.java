package com.boricori.controller;


import com.boricori.dto.KakaoToken;
import com.boricori.dto.KakaoUserResponse;
import com.boricori.dto.request.User.SocialLoginRequest;
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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RequestMapping("/auth/kakao")
@RestController
public class KakaoLoginController {

  @Value("${kakao.REST_API_KEY}")
  private String apiKey;

  @Value("${kakao.CLIENT_SECRET}")
  private String clientSecret;

  @Value(("${kakao.REDIRECT_URL}"))
  private String redirectUri;

  @Autowired
  private JwtUtil jwtUtil;

  @Autowired
  private UserService userService;

  private static RestTemplate restTemplate = new RestTemplate();


  @GetMapping("/getURL")
  public ResponseEntity<String> getURL(HttpServletRequest request){
    // Create a state token to prevent request forgery.
// Store it in the session for later validation.
    HttpSession session = request.getSession();
    String state = new BigInteger(130, new SecureRandom()).toString(32);
    session.setAttribute("state", state);

    String url = "https://kauth.kakao.com/oauth/authorize?response_type=code&"
        + "client_id=" + apiKey + "&"
        + "redirect_uri=" + redirectUri +"&"
        + "state=" + state;
    String body = String.format("{\"link\":\"%s\"}", url);
    return ResponseEntity.status(200).body(body);
  }


  @PostMapping("/getToken")
  public ResponseEntity<UserLoginResponse> getToken(@RequestBody SocialLoginRequest socReq, HttpServletRequest request, HttpServletResponse resp) {

      HttpSession session = request.getSession();
      String code = socReq.getCode();
      String state = socReq.getState();

    if (session.getAttribute("state") == null || !session.getAttribute("state").equals(state)){
      return ResponseEntity.status(ResponseEnum.NOT_ACCEPTABLE.getCode()).body(null);
    }

    try{
      KakaoToken kakaoToken = exchangeCodeForToken(code);
      String email = getKakaoEmail(kakaoToken.getAccess_token());
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

  private KakaoToken exchangeCodeForToken(String code) {
    String url = "https://kauth.kakao.com/oauth/token";

    MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
    formData.add("grant_type", "authorization_code");
    formData.add("client_id", apiKey);
    formData.add("redirect_uri", redirectUri);
    formData.add("code", code);
    formData.add("client_secret", clientSecret);

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
    HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(formData, headers);

    ResponseEntity<KakaoToken> responseEntity = restTemplate.exchange(
        url,
        HttpMethod.POST,
        entity,
        KakaoToken.class
    );

    return responseEntity.getBody();
  }


  public String getKakaoEmail(String token) throws RuntimeException{
    String url = "https://kapi.kakao.com/v2/user/me";

    MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
    formData.add("property_keys", "[\"kakao_account.email\"]");

    HttpHeaders headers = new HttpHeaders();
    headers.set("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
    headers.set("Authorization", String.format("Bearer %s", token));
    HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(formData, headers);

    ResponseEntity<KakaoUserResponse> responseEntity = restTemplate.exchange(
        url,
        HttpMethod.POST,
        entity,
        KakaoUserResponse.class
    );
    KakaoUserResponse body = responseEntity.getBody();
    if (body == null || body.getKakao_account() == null){
      throw new RuntimeException();
    }
    return body.getKakao_account().getEmail();
  }


}
