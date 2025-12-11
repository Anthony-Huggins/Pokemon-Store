package com.skillstorm.pokemonstore.services;

import com.google.cloud.vision.v1.*;
import com.google.protobuf.ByteString;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Service
public class ScanService {

    /**
     * Sends a Base64 image to Google Cloud Vision and returns the raw text found.
     */
    public String detectText(String base64Image) {
        try (ImageAnnotatorClient vision = ImageAnnotatorClient.create()) {
            
            // 1. Decode Base64 string to bytes
            byte[] data = Base64.getDecoder().decode(base64Image);
            ByteString imgBytes = ByteString.copyFrom(data);

            // 2. Build the Image object
            Image img = Image.newBuilder().setContent(imgBytes).build();

            // 3. Define the Request (We want TEXT_DETECTION)
            Feature feat = Feature.newBuilder().setType(Feature.Type.TEXT_DETECTION).build();
            AnnotateImageRequest request = AnnotateImageRequest.newBuilder()
                    .addFeatures(feat)
                    .setImage(img)
                    .build();
            
            List<AnnotateImageRequest> requests = new ArrayList<>();
            requests.add(request);

            // 4. Call the API
            BatchAnnotateImagesResponse response = vision.batchAnnotateImages(requests);
            List<AnnotateImageResponse> responses = response.getResponsesList();

            // 5. Parse Response
            StringBuilder fullText = new StringBuilder();
            
            for (AnnotateImageResponse res : responses) {
                if (res.hasError()) {
                    System.err.printf("Error: %s\n", res.getError().getMessage());
                    return null;
                }

                // The first annotation is usually the "full text" block
                if (!res.getTextAnnotationsList().isEmpty()) {
                    fullText.append(res.getTextAnnotationsList().get(0).getDescription());
                }
            }

            return fullText.toString();

        } catch (IOException e) {
            throw new RuntimeException("Failed to initialize Google Vision Client", e);
        }
    }
}