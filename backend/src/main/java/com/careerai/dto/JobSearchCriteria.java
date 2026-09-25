package com.careerai.dto;

public class JobSearchCriteria {

    private String keyword;
    private String location;
    private String employmentType; // FULL_TIME, PART_TIME, INTERNSHIP, CONTRACT
    private String experienceLevel; // FRESHER, MID_LEVEL, SENIOR
    private String remoteType; // ON_SITE, REMOTE, HYBRID
    private String company;
    private Double minSalary;
    private String source; // INDEED, LINKEDIN, OFFICIAL_COMPANY, PARTNER
    private Integer postedWithinDays;
    private String category; // FRESHER, SENIOR, MID_LEVEL, ALL
    private String academicYear; // 1st Year, 2nd Year, 3rd Year, 4th Year, Fresh Graduate
    private Integer graduationYear; // 2026, 2027, etc.

    public JobSearchCriteria() {
    }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public Integer getGraduationYear() { return graduationYear; }
    public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }

    public String getKeyword() { return keyword; }
    public void setKeyword(String keyword) { this.keyword = keyword; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getEmploymentType() { return employmentType; }
    public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }

    public String getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }

    public String getRemoteType() { return remoteType; }
    public void setRemoteType(String remoteType) { this.remoteType = remoteType; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public Double getMinSalary() { return minSalary; }
    public void setMinSalary(Double minSalary) { this.minSalary = minSalary; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public Integer getPostedWithinDays() { return postedWithinDays; }
    public void setPostedWithinDays(Integer postedWithinDays) { this.postedWithinDays = postedWithinDays; }
}
