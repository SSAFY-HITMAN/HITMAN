package com.boricori.service;

import com.boricori.entity.Mission;
import com.boricori.util.GoogleVision;
import com.boricori.util.ResponseEnum;
import com.google.cloud.vision.v1.ColorInfo;
import com.google.cloud.vision.v1.EntityAnnotation;
import com.google.cloud.vision.v1.LocalizedObjectAnnotation;
import java.io.IOException;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ImageService {

  public boolean checkText(MultipartFile file, Mission mission)
      throws IOException {
      List<EntityAnnotation> res = GoogleVision.detectText(file);
      for (EntityAnnotation annotation :res){
        String text = annotation.getDescription();
        if (text.contains(mission.getTarget()) || text.contains(mission.getAlt())){
          return true;
        }
      }
      return false;
  }


  public boolean checkColours(MultipartFile file, Mission mission)
      throws IOException {
      List<ColorInfo> res = GoogleVision.detectPropertiesGcs(file);
      // 일단 유클리드거리로 계산,
      // 잘 안되면 CIEDE2000로 변경
    String hexCode = mission.getTarget();
    int red = Integer.valueOf(hexCode.substring(1, 3), 16);
    int green = Integer.valueOf(hexCode.substring(3, 5), 16);
    int blue = Integer.valueOf(hexCode.substring(5, 7), 16);
    System.out.println("targetRGB: " + red + " " + green + " " + blue);
      for (ColorInfo color : res){
        float score = color.getScore();
        if (score >= 0.1){
          float r = color.getColor().getRed();
          float g = color.getColor().getGreen();
          float b = color.getColor().getBlue();
          System.out.println("sampleRGB: " + r + " " + g + " " + b);
          double euclideanD = Math.sqrt(Math.pow(red - r, 2) +
              Math.pow(green - g, 2) +
              Math.pow(blue - b, 2));
          if (euclideanD < 50){
            return true;
          }
        }
      }
      return false;
  }

  public boolean checkObjects(MultipartFile file, Mission mission)
      throws IOException {
      List<LocalizedObjectAnnotation> res = GoogleVision.detectLocalizedObjects(file);
      for (LocalizedObjectAnnotation entity : res){
        String objName = entity.getName();
        float confidence = entity.getScore();
        if (confidence >= 0.5 && objName.equals(mission.getAlt())){
          return true;
        }
      }
      return false;
  }

  // 아마 안쓸듯..
  public ResponseEntity<String> checkLabels(@RequestParam("file") MultipartFile file, Mission mission) {
    try {
      List<EntityAnnotation> res = GoogleVision.getLabels(file);
    } catch (Exception e) {
      return ResponseEntity.status(ResponseEnum.FAIL.getCode()).body("오류가 발생했습니다. 다시 시도해주세요.");
    }
    return null;
  }


}
