package com.boricori.util;

import com.google.cloud.vision.v1.AnnotateImageRequest;
import com.google.cloud.vision.v1.AnnotateImageResponse;
import com.google.cloud.vision.v1.BatchAnnotateImagesResponse;
import com.google.cloud.vision.v1.ColorInfo;
import com.google.cloud.vision.v1.DominantColorsAnnotation;
import com.google.cloud.vision.v1.EntityAnnotation;
import com.google.cloud.vision.v1.Feature;
import com.google.cloud.vision.v1.Feature.Type;
import com.google.cloud.vision.v1.Image;
import com.google.cloud.vision.v1.ImageAnnotatorClient;
import com.google.cloud.vision.v1.LocalizedObjectAnnotation;
import com.google.protobuf.ByteString;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;


public class  GoogleVision {

  private static List<AnnotateImageRequest> connection(MultipartFile file, Feature.Type type) throws IOException {
    List<AnnotateImageRequest> requests = new ArrayList<>();
    byte[] bytes = file.getBytes();
    ByteString imgBytes = ByteString.copyFrom(bytes);

    Image img = Image.newBuilder().setContent(imgBytes).build();
    Feature feat = Feature.newBuilder().setType(type).build();
    AnnotateImageRequest request =
        AnnotateImageRequest.newBuilder().addFeatures(feat).setImage(img).build();
    requests.add(request);
    return requests;
  }

  public static List<EntityAnnotation> getLabels(MultipartFile file)
      throws IOException {
    List<EntityAnnotation> results = new ArrayList<>();
    // Initialize client that will be used to send requests. This client only needs to be created
    // once, and can be reused for multiple requests. After completing all of your requests, call
    // the "close" method on the client to safely clean up any remaining background resources.
    try (ImageAnnotatorClient client = ImageAnnotatorClient.create()) {
      List<AnnotateImageRequest> requests = connection(file, Type.LABEL_DETECTION);
      BatchAnnotateImagesResponse response = client.batchAnnotateImages(requests);
      List<AnnotateImageResponse> responses = response.getResponsesList();

      for (AnnotateImageResponse res : responses) {
        if (res.hasError()) {
          System.out.format("Error: %s%n", res.getError().getMessage());
          return null;
        }
        System.out.println("res 줄바꿈================================================");
        // For full list of available annotations, see http://g.co/cloud/vision/docs
        for (EntityAnnotation annotation : res.getLabelAnnotationsList()) {
          annotation
              .getAllFields()
              .forEach((k, v) -> System.out.format("%s : %s%n", k, v.toString()));
        }
          results.addAll(res.getLabelAnnotationsList());
        }
      }catch(Exception e){
      throw new RuntimeException();
    }
    return results;
  }

// OCR
  public static List<EntityAnnotation> detectText(MultipartFile file) throws IOException {
    List<EntityAnnotation> results = new ArrayList<>();
    // Initialize client that will be used to send requests. This client only needs to be created
    // once, and can be reused for multiple requests. After completing all of your requests, call
    // the "close" method on the client to safely clean up any remaining background resources.
    try (ImageAnnotatorClient client = ImageAnnotatorClient.create()) {
      List<AnnotateImageRequest> requests = connection(file, Feature.Type.TEXT_DETECTION);
      BatchAnnotateImagesResponse response = client.batchAnnotateImages(requests);
      List<AnnotateImageResponse> responses = response.getResponsesList();

      for (AnnotateImageResponse res : responses) {
        if (res.hasError()) {
          System.out.format("Error: %s%n", res.getError().getMessage());
          return null;
        }
        System.out.println("res 줄바꿈================================================");
        // For full list of available annotations, see http://g.co/cloud/vision/docs
        for (EntityAnnotation annotation : res.getTextAnnotationsList()) {
          System.out.format("Text: %s%n", annotation.getDescription());
          System.out.format("Position : %s%n", annotation.getBoundingPoly());
        }
        results.addAll(res.getTextAnnotationsList());
      }
    }catch(Exception e){
      throw new RuntimeException();
    }
    return results;
  }

  // 색 감지
  public static List<ColorInfo> detectPropertiesGcs(MultipartFile file) throws IOException {
    List<ColorInfo> results = new ArrayList<>();
    // Initialize client that will be used to send requests. This client only needs to be created
    // once, and can be reused for multiple requests. After completing all of your requests, call
    // the "close" method on the client to safely clean up any remaining background resources.
    try (ImageAnnotatorClient client = ImageAnnotatorClient.create()) {
      List<AnnotateImageRequest> requests = connection(file, Feature.Type.IMAGE_PROPERTIES);
      BatchAnnotateImagesResponse response = client.batchAnnotateImages(requests);
      List<AnnotateImageResponse> responses = response.getResponsesList();

      for (AnnotateImageResponse res : responses) {
        if (res.hasError()) {
          System.out.format("Error: %s%n", res.getError().getMessage());
          return null;
        }
        System.out.println("res 줄바꿈================================================");
        // For full list of available annotations, see http://g.co/cloud/vision/docs
        DominantColorsAnnotation colors = res.getImagePropertiesAnnotation().getDominantColors();
        for (ColorInfo color : colors.getColorsList()) {
          System.out.println(String.format("=============score: %f=====================", color.getScore()));
          System.out.format(
              "fraction: %f%nr: %f, g: %f, b: %f%n",
              color.getPixelFraction(),
              color.getColor().getRed(),
              color.getColor().getGreen(),
              color.getColor().getBlue());
        }
        results.addAll(colors.getColorsList());
      }
    }catch(Exception e){
      throw new RuntimeException();
    }
    return results;
  }

  // 객체 (물체) 인식
  public static List<LocalizedObjectAnnotation> detectLocalizedObjects(MultipartFile file) throws IOException {
    List<LocalizedObjectAnnotation> results = new ArrayList<>();
    // Initialize client that will be used to send requests. This client only needs to be created
    // once, and can be reused for multiple requests. After completing all of your requests, call
    // the "close" method on the client to safely clean up any remaining background resources.
    try (ImageAnnotatorClient client = ImageAnnotatorClient.create()) {
      // Perform the request
      List<AnnotateImageRequest> requests = connection(file, Type.OBJECT_LOCALIZATION);
      BatchAnnotateImagesResponse response = client.batchAnnotateImages(requests);
      List<AnnotateImageResponse> responses = response.getResponsesList();

      // Display the results
      for (AnnotateImageResponse res : responses) {
        for (LocalizedObjectAnnotation entity : res.getLocalizedObjectAnnotationsList()) {
          System.out.format("Object name: %s%n", entity.getName());
          System.out.format("Confidence: %s%n", entity.getScore());
          System.out.format("Normalized Vertices:%n");
          entity
              .getBoundingPoly()
              .getNormalizedVerticesList()
              .forEach(vertex -> System.out.format("- (%s, %s)%n", vertex.getX(), vertex.getY()));
        }
        results.addAll(res.getLocalizedObjectAnnotationsList());
      }
    }catch(Exception e){
      throw new RuntimeException();
    }
    return results;
  }

}


