//package com.a601.moba.global.service;
//
//import com.amazonaws.services.s3.AmazonS3;
//import com.amazonaws.services.s3.model.CannedAccessControlList;
//import com.amazonaws.services.s3.model.ObjectMetadata;
//import com.amazonaws.services.s3.model.PutObjectRequest;
//import java.io.IOException;
//import java.util.UUID;
//import lombok.RequiredArgsConstructor;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Service;
//import org.springframework.web.multipart.MultipartFile;
//
//@Service
//@RequiredArgsConstructor
//public class S3Service {
//
//    private final AmazonS3 amazonS3;
//
//    @Value("${cloud.aws.s3.bucket}")
//    private String bucket;
//
//    public String uploadFile(MultipartFile file) {
//        String originalFilename = file.getOriginalFilename();
//        String extension = originalFilename != null && originalFilename.contains(".")
//                ? originalFilename.substring(originalFilename.lastIndexOf("."))
//                : "";
//        String fileName = "profile/" + UUID.randomUUID() + extension;
//
//        try {
//            ObjectMetadata metadata = new ObjectMetadata();
//            metadata.setContentLength(file.getSize());
//            metadata.setContentType(file.getContentType());
//
//            amazonS3.putObject(
//                    new PutObjectRequest(bucket, fileName, file.getInputStream(), metadata)
//                            .withCannedAcl(CannedAccessControlList.PublicRead)
//            );
//
//            return amazonS3.getUrl(bucket, fileName).toString();
//
//        } catch (IOException e) {
//            throw new RuntimeException("S3 파일 업로드 실패", e);
//        }
//    }
//}
