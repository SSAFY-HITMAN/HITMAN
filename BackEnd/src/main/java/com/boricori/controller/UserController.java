package com.boricori.controller;

import com.boricori.dto.request.User.CheckDupRequest;
import com.boricori.dto.request.User.UserLoginRequest;
import com.boricori.dto.request.User.UserSignupRequest;
import com.boricori.dto.request.User.UserUpdateRequest;
import com.boricori.dto.response.User.RankDtoResponse;
import com.boricori.dto.response.User.RankResponse;
import com.boricori.dto.response.User.UserLoginResponse;
import com.boricori.dto.response.User.UserResponse;
import com.boricori.entity.User;
import com.boricori.service.UserService;
import com.boricori.util.ResponseEnum;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/user")
@Tag(name = "유저 컨트롤러")
public class UserController {

  @Autowired
  private UserService userService;

  private static final Logger log = LoggerFactory.getLogger(UserController.class);

  @PostMapping("/login")
  @Operation(summary = "로그인", description = "로그인 성공시 JWT 발급")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "로그인 성공"),
      @ApiResponse(responseCode = "400", description = "로그인 실패"),
  })
  public ResponseEntity<UserLoginResponse> login(@RequestBody @Parameter(name = "유저 로그인 폼") UserLoginRequest loginRequest
  , HttpServletResponse response){
    UserLoginResponse res = userService.login(loginRequest, response);
    if (res != null){
      return ResponseEntity.status(ResponseEnum.SUCCESS.getCode()).body(res);
    }
    return ResponseEntity.status(ResponseEnum.FAIL.getCode()).body(null);
  }

  @PostMapping("/signup")
  @Operation(summary = "회원가입", description = "유효성 검사가 끝난 아이디와 비밀번호로 회원가입")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "회원가입 성공"),
      @ApiResponse(responseCode = "400", description = "회원가입 실패"),
  })
  public ResponseEntity<UserResponse> signup(@RequestBody @Parameter(name = "유저 회원가입 폼") UserSignupRequest signUpRequest){
    User user = userService.signup(signUpRequest);
    if (user != null){
      return ResponseEntity.status(ResponseEnum.SUCCESS.getCode()).body(UserResponse.of(user));
    }
    return ResponseEntity.status(ResponseEnum.FAIL.getCode()).body(null);
  }

  @PostMapping("/social-signup")
  public ResponseEntity<?> socialSignup(@RequestBody UserSignupRequest request){
    request.setPassword("db_GP1_ylS*JU");
    User user = userService.signup(request);
    if (user != null){
      return ResponseEntity.status(ResponseEnum.SUCCESS.getCode()).body(UserResponse.of(user));
    }
    return ResponseEntity.status(ResponseEnum.FAIL.getCode()).body(null);
  }

  @PostMapping("/isDuplicate")
  public ResponseEntity<String> isDuplicate(@RequestBody CheckDupRequest request){
    String type = request.getType();
    String value = request.getValue();
    boolean isDup = false;
    if (type.equals("email")){
      isDup = userService.isDupEmail(value);
    }else if (type.equals("username")){
      isDup = userService.isDupUsername(value);
    }
    if (isDup){
      return ResponseEntity.status(ResponseEnum.FAIL.getCode()).body(null);
    }else{
      return ResponseEntity.status(ResponseEnum.SUCCESS.getCode()).body(null);
    }
  }


  // 로그아웃은 프론트에서 처리, 백에서 할 일 없음
  @GetMapping("/logout")
  public void logout(){
  }

  @GetMapping("/ranks")
  @Operation(summary = "순위검색", description = "전체 유저 중 순위 출력")
  @ApiResponses(value = {
          @ApiResponse(responseCode = "200", description = "회원별 순위 리턴"),
          @ApiResponse(responseCode = "400", description = "표시할 내용 없음"),
  })
  public ResponseEntity<?> getRanks(){
    try{
      List<RankDtoResponse> allRank = userService.findAllRank();
      return ResponseEntity.status(200).body(allRank);
    }catch (Exception e){
      return ResponseEntity.status(400).body("Error fetching ranks");
    }
  }

  @GetMapping("/myProfile")
  @Operation(summary = "내 정보 보기", description = "현재 로그인 된 유저의 정보 열람")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "회원 정보 리턴")
  })
  public ResponseEntity<UserResponse> myProfile(@Parameter(hidden = true) HttpServletRequest req){
//    String username = req.getUsername();
//    User user = userService.getUser(username);
//    return ResponseEntity.status(200).body(UserResponse.of(user));
    return null;
  }

  @PatchMapping("/updateProfile")
  @Operation(summary = "회원정보 수정", description = "현재 로그인 된 유저의 정보 수정")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "정보 수정 성공")
  })
  public ResponseEntity<UserResponse> updateProfile(@Parameter(hidden = true) HttpServletRequest req,
      @RequestBody @Parameter(name = "유저 정보 수정 폼") UserUpdateRequest updateRequest) {
//    String username = req.getUsername();
//    User user = userService.updateUser(updateRequest, username);
//    return ResponseEntity.status(200).body(UserResponse.of(user));
    return null;
  }

  @GetMapping("/profile/{id}")
  @Operation(summary = "유저 검색", description = "유저의 아이디로 프로필 검색")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "검색 성공"),
      @ApiResponse(responseCode = "406", description = "유저 정보 없음"),
  })
  public ResponseEntity<UserResponse> getProfile(@PathVariable @Parameter(name = "검색할 유저 아이디") String id){
//    User user = userService.getUser(id);
//    return ResponseEntity.status(200).body(UserResponse.of(user));
    return null;
  }

}
