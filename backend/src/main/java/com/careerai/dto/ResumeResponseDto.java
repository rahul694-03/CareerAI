package com.careerai.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ResumeResponseDto {

    private Long id;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private List<String> extractedSkills;
    private LocalDateTime uploadedAt;

    public ResumeResponseDto() {
    }

    public ResumeResponseDto(Long id, String fileName, String fileType, Long fileSize,
                             List<String> extractedSkills, LocalDateTime uploadedAt) {
        this.id = id;
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.extractedSkills = extractedSkills;
        this.uploadedAt = uploadedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public List<String> getExtractedSkills() { return extractedSkills; }
    public void setExtractedSkills(List<String> extractedSkills) { this.extractedSkills = extractedSkills; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
