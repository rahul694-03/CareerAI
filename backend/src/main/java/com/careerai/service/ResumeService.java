package com.careerai.service;

import com.careerai.dto.ResumeResponseDto;
import com.careerai.entity.Resume;
import com.careerai.entity.User;
import com.careerai.exception.ResourceNotFoundException;
import com.careerai.repository.ResumeRepository;
import com.careerai.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final ResumeParserService resumeParserService;

    public ResumeService(ResumeRepository resumeRepository, UserRepository userRepository, ResumeParserService resumeParserService) {
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.resumeParserService = resumeParserService;
    }

    @Transactional
    public ResumeResponseDto uploadResume(String userEmail, MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded resume file cannot be empty");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        String rawText = resumeParserService.extractText(file);
        List<String> skills = resumeParserService.extractSkills(rawText);

        Optional<Resume> existingResumeOpt = resumeRepository.findByUser(user);
        Resume resume = existingResumeOpt.orElseGet(Resume::new);

        resume.setUser(user);
        resume.setFileName(file.getOriginalFilename() != null ? file.getOriginalFilename() : "resume.pdf");
        resume.setFileType(file.getContentType());
        resume.setFileSize(file.getSize());
        resume.setRawText(rawText);
        resume.setExtractedSkills(skills);

        Resume savedResume = resumeRepository.save(resume);

        return mapToDto(savedResume);
    }

    @Transactional(readOnly = true)
    public Optional<ResumeResponseDto> getResumeByEmail(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        return resumeRepository.findByUser(user).map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public List<String> getUserSkills(String userEmail) {
        return getResumeByEmail(userEmail)
                .map(ResumeResponseDto::getExtractedSkills)
                .orElse(Collections.emptyList());
    }

    private ResumeResponseDto mapToDto(Resume resume) {
        return new ResumeResponseDto(
                resume.getId(),
                resume.getFileName(),
                resume.getFileType(),
                resume.getFileSize(),
                resume.getExtractedSkills(),
                resume.getUploadedAt()
        );
    }
}
