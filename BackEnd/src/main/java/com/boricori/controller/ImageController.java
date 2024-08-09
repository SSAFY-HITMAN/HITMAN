package com.boricori.controller;

import com.boricori.util.GoogleVision;
import com.boricori.util.ResponseEnum;
import com.google.cloud.vision.v1.ColorInfo;
import com.google.cloud.vision.v1.EntityAnnotation;
import com.google.cloud.vision.v1.LocalizedObjectAnnotation;
import java.io.File;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RequestMapping("/image")
@RestController
public class ImageController {

  private static final String UPLOAD_DIR = "C:/ssafyTempImg/uploads/";


  @PostMapping("/upload")
  public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) {
    if (file.isEmpty()) {
      return new ResponseEntity<>("Please select a file to upload", HttpStatus.BAD_REQUEST);
    }
    try {
      // Ensure the directory exists
      File uploadDir = new File(UPLOAD_DIR);
      if (!uploadDir.exists()) {
        uploadDir.mkdirs();
      }
      // Construct the full path to the file
      String fileName = file.getOriginalFilename();
      File dest = new File(UPLOAD_DIR + fileName);
      // Save the file
      file.transferTo(dest);
      return new ResponseEntity<>("Successfully uploaded: " + fileName, HttpStatus.OK);
    } catch (IOException e) {
      e.printStackTrace();
      return new ResponseEntity<>("Failed to upload file: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @PostMapping("/ocr")
  public ResponseEntity<String> text(@RequestParam("file") MultipartFile file) {
    try {
      List<EntityAnnotation> res = GoogleVision.detectText(file);
      for (EntityAnnotation annotation :res){
        String text = annotation.getDescription();
        if (text.contains("L")){ // 임시값
          return ResponseEntity.status(ResponseEnum.SUCCESS.getCode()).body("미션 성공");
        }
      }
      return ResponseEntity.status(ResponseEnum.NOT_ACCEPTABLE.getCode()).body("미션 실패");
    } catch (Exception e) {
      return ResponseEntity.status(ResponseEnum.FAIL.getCode()).body("오류가 발생했습니다. 다시 시도해주세요.");
    }
  }


  @PostMapping("/colours")
  public ResponseEntity<String> colours(@RequestParam("file") MultipartFile file) {
    try {
      List<ColorInfo> res = GoogleVision.detectPropertiesGcs(file);
      // 일단 유클리드거리로 계산,
      // 잘 안되면 CIEDE2000로 변경
      int[] targetColor = {120, 120, 100}; // 임시값
      for (ColorInfo color : res){
        float score = color.getScore();
        if (score >= 0.1){
          float r = color.getColor().getRed();
          float g = color.getColor().getGreen();
          float b = color.getColor().getBlue();
          double euclideanD = Math.sqrt(Math.pow(targetColor[0] - r, 2) +
              Math.pow(targetColor[1] - g, 2) +
              Math.pow(targetColor[2] - b, 2));
          if (euclideanD < 50){
            return ResponseEntity.status(ResponseEnum.SUCCESS.getCode()).body("미션 성공");
          }
        }
      }
      return ResponseEntity.status(ResponseEnum.NOT_ACCEPTABLE.getCode()).body("미션 실패");
    } catch (Exception e) {
      return ResponseEntity.status(ResponseEnum.FAIL.getCode()).body("오류가 발생했습니다. 다시 시도해주세요.");
    }
  }

  @PostMapping("/objects")
  public ResponseEntity<String> objects(@RequestParam("file") MultipartFile file) {
    try {
      List<LocalizedObjectAnnotation> res = GoogleVision.detectLocalizedObjects(file);
      for (LocalizedObjectAnnotation entity : res){
        String objName = entity.getName();
        float confidence = entity.getScore();
        if (confidence >= 0.5 && objName.equals("Cat")){ // 임시값
          return ResponseEntity.status(ResponseEnum.SUCCESS.getCode()).body("미션 성공");
        }
      }
      return ResponseEntity.status(ResponseEnum.NOT_ACCEPTABLE.getCode()).body("미션 실패");
    } catch (Exception e) {
      return ResponseEntity.status(ResponseEnum.FAIL.getCode()).body("오류가 발생했습니다. 다시 시도해주세요.");
    }
  }

  // 아마 안쓸듯..
  @PostMapping("/labels")
  public ResponseEntity<String> labels(@RequestParam("file") MultipartFile file) {
    try {
      List<EntityAnnotation> res = GoogleVision.getLabels(file);
    } catch (Exception e) {
      return ResponseEntity.status(ResponseEnum.FAIL.getCode()).body("오류가 발생했습니다. 다시 시도해주세요.");
    }
    return null;
  }

}
