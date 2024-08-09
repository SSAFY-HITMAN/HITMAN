import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "@/constants/baseURL";

const KakaoLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      alert("카카오 서버에서 인가코드를 받아오지 못했습니다.");
      navigate("/login");
      return;
    }

    axios
      .post(`${BASE_URL}/auth/kakao/getToken`, {code, state}) // 카카오 서버에서 받은 인가코드를 백엔드 서버로 전송
      .then(resp => {
        if (resp.status === 406) {
          alert("부적절한 요청입니다.");
          navigate("/login");
        } else if (resp.status === 5000) {
          const email = resp.data.email;
          localStorage.setItem("email", email);
          alert("가입 완료. 닉네임 설정페이지로 이동합니다.");
          navigate("/auth/setUsername");
        } else if (resp.status === 200) {
          const accessToken = resp.data.accessToken;
          localStorage.setItem("accessToken", accessToken);
          alert("카카오 로그인 성공");
          navigate("/home");
        }
      })
      .catch(() => {
        alert(
          "서버와 통신하는 중에 문제가 발생했습니다. 나중에 다시 시도해주세요."
        );
        navigate("/login");
      });
  }, [navigate, searchParams]);

  return null;
};

export default KakaoLogin;
