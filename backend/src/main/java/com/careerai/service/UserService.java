package com.careerai.service;

import com.careerai.dto.UpdateProfileRequest;
import com.careerai.dto.UserDto;
import com.careerai.entity.User;
import com.careerai.exception.ResourceNotFoundException;
import com.careerai.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return UserDto.fromEntity(user);
    }

    @Transactional
    public UserDto updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        user.setName(request.getName().trim());
        user.setDegree(request.getDegree() != null ? request.getDegree().trim() : null);
        user.setCollege(request.getCollege() != null ? request.getCollege().trim() : null);
        user.setGraduationYear(request.getGraduationYear());
        if (request.getAcademicYear() != null && !request.getAcademicYear().trim().isEmpty()) {
            user.setAcademicYear(request.getAcademicYear().trim());
        }

        User savedUser = userRepository.save(user);
        return UserDto.fromEntity(savedUser);
    }
}
