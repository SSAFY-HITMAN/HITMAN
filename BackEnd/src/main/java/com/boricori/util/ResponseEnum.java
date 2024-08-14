package com.boricori.util;

public enum ResponseEnum {
    SUCCESS(200), FAIL(400), NOT_FOUND(404), NOT_ACCEPTABLE(406)
    , TOKEN_RENEWED(7000), SIGNUP(5000), REDIRECT(302), CREATED(202);


    // 문자열을 저장할 필드
    private int code;

    // 생성자 (싱글톤)
    private ResponseEnum(int code) {
        this.code = code;
    }

    // Getter
    public int getCode() {
        return code;
    }
}
