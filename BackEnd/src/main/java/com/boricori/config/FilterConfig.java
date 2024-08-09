package com.boricori.config;

import com.boricori.util.JwtAuthenticationFilter;
import com.boricori.util.JwtUtil;
import java.util.Collections;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class FilterConfig {

  private final JwtUtil jwtUtil;

  public FilterConfig(JwtUtil jwtUtil) {
    this.jwtUtil = jwtUtil;
  }

  @Bean
  public FilterRegistrationBean<JwtAuthenticationFilter> jwtFilter() {
    FilterRegistrationBean<JwtAuthenticationFilter> registrationBean = new FilterRegistrationBean<>();
    registrationBean.setFilter(new JwtAuthenticationFilter(jwtUtil));
    registrationBean.addUrlPatterns("/gameroom/**", "/in-game/init/*", "/participants/**",
        "/user/ranks/*", "/user/myProfile", "/user/updateProfile",
        "/user/profile/*"); // 필터를 적용할 URL 패턴 설정
    return registrationBean;
  }

  @Bean
  public CorsConfiguration corsConfiguration() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Collections.singletonList("https://i11b205.p.ssafy.io"));
    // configuration.setAllowedOrigins(Collections.singletonList("http://localhost:3000")); // 임시
    configuration.setAllowedMethods(Collections.singletonList("*"));
    configuration.setAllowCredentials(true);
    configuration.setAllowedHeaders(Collections.singletonList("*"));
    configuration.setExposedHeaders(Collections.singletonList("Authorization"));
    configuration.setMaxAge(3600L);
    return configuration;
  }

  @Bean
  public FilterRegistrationBean<CorsFilter> corsFilter() {
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", corsConfiguration());
    FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
    bean.setOrder(0); // Ensure this is applied before other filters
    return bean;
  }
}
