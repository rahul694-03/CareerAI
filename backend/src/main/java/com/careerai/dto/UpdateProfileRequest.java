package com.careerai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateProfileRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    private String degree;

    private String college;

    private Integer graduationYear;

    private String academicYear;

    public UpdateProfileRequest() {
    }

    public UpdateProfileRequest(String name, String degree, String college, Integer graduationYear, String academicYear) {
        this.name = name;
        this.degree = degree;
        this.college = college;
        this.graduationYear = graduationYear;
        this.academicYear = academicYear;
    }

    public UpdateProfileRequest(String name, String degree, String college, Integer graduationYear) {
        this(name, degree, college, graduationYear, null);
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String name;
        private String degree;
        private String college;
        private Integer graduationYear;
        private String academicYear;

        public Builder name(String name) { this.name = name; return this; }
        public Builder degree(String degree) { this.degree = degree; return this; }
        public Builder college(String college) { this.college = college; return this; }
        public Builder graduationYear(Integer graduationYear) { this.graduationYear = graduationYear; return this; }
        public Builder academicYear(String academicYear) { this.academicYear = academicYear; return this; }

        public UpdateProfileRequest build() {
            return new UpdateProfileRequest(name, degree, college, graduationYear, academicYear);
        }
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDegree() { return degree; }
    public void setDegree(String degree) { this.degree = degree; }

    public String getCollege() { return college; }
    public void setCollege(String college) { this.college = college; }

    public Integer getGraduationYear() { return graduationYear; }
    public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
}
