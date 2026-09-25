package com.careerai.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
    private String password;

    private String degree;

    private String college;

    private Integer graduationYear;

    private String academicYear;

    public RegisterRequest() {
    }

    public RegisterRequest(String name, String email, String password, String degree, String college, Integer graduationYear, String academicYear) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.degree = degree;
        this.college = college;
        this.graduationYear = graduationYear;
        this.academicYear = academicYear;
    }

    public RegisterRequest(String name, String email, String password, String degree, String college, Integer graduationYear) {
        this(name, email, password, degree, college, graduationYear, null);
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String name;
        private String email;
        private String password;
        private String degree;
        private String college;
        private Integer graduationYear;
        private String academicYear;

        public Builder name(String name) { this.name = name; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder password(String password) { this.password = password; return this; }
        public Builder degree(String degree) { this.degree = degree; return this; }
        public Builder college(String college) { this.college = college; return this; }
        public Builder graduationYear(Integer graduationYear) { this.graduationYear = graduationYear; return this; }
        public Builder academicYear(String academicYear) { this.academicYear = academicYear; return this; }

        public RegisterRequest build() {
            return new RegisterRequest(name, email, password, degree, college, graduationYear, academicYear);
        }
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getDegree() { return degree; }
    public void setDegree(String degree) { this.degree = degree; }

    public String getCollege() { return college; }
    public void setCollege(String college) { this.college = college; }

    public Integer getGraduationYear() { return graduationYear; }
    public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
}
