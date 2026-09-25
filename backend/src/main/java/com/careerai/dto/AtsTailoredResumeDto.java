package com.careerai.dto;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class AtsTailoredResumeDto {

    private Long jobId;
    private String jobTitle;
    private String company;
    private String location;
    private String applyUrl;

    private String candidateName;
    private String candidateEmail;
    private String phone;
    private String tagline;
    private String githubUrl;
    private String linkedinUrl;
    private String degree;
    private String college;
    private Integer graduationYear;

    private int atsScore;
    private List<String> matchedKeywords = new ArrayList<>();
    private List<String> targetJobKeywords = new ArrayList<>();
    private List<String> missingKeywords = new ArrayList<>();

    private String professionalSummary;
    private List<String> coreSkills = new ArrayList<>();
    private List<String> technicalSkills = new ArrayList<>();
    private List<String> toolsAndPlatforms = new ArrayList<>();
    private Map<String, String> categorizedSkills = new LinkedHashMap<>();

    private List<ExperienceItemDto> experienceItems = new ArrayList<>();
    private List<ProjectItemDto> projectItems = new ArrayList<>();
    private List<EducationItemDto> educationItems = new ArrayList<>();
    private List<String> certifications = new ArrayList<>();
    private String educationSummary;
    private String rawAtsPlainText;

    public AtsTailoredResumeDto() {
    }

    public static class ExperienceItemDto {
        private String roleTitle;
        private String organization;
        private String duration;
        private List<String> bulletPoints = new ArrayList<>();

        public ExperienceItemDto() {}

        public ExperienceItemDto(String roleTitle, String organization, String duration, List<String> bulletPoints) {
            this.roleTitle = roleTitle;
            this.organization = organization;
            this.duration = duration;
            this.bulletPoints = bulletPoints != null ? bulletPoints : new ArrayList<>();
        }

        public String getRoleTitle() { return roleTitle; }
        public void setRoleTitle(String roleTitle) { this.roleTitle = roleTitle; }

        public String getOrganization() { return organization; }
        public void setOrganization(String organization) { this.organization = organization; }

        public String getDuration() { return duration; }
        public void setDuration(String duration) { this.duration = duration; }

        public List<String> getBulletPoints() { return bulletPoints; }
        public void setBulletPoints(List<String> bulletPoints) { this.bulletPoints = bulletPoints; }
    }

    public static class ProjectItemDto {
        private String projectTitle;
        private String techStack;
        private String projectLink;
        private List<String> bulletPoints = new ArrayList<>();

        public ProjectItemDto() {}

        public ProjectItemDto(String projectTitle, String techStack, List<String> bulletPoints) {
            this.projectTitle = projectTitle;
            this.techStack = techStack;
            this.bulletPoints = bulletPoints != null ? bulletPoints : new ArrayList<>();
        }

        public ProjectItemDto(String projectTitle, String techStack, String projectLink, List<String> bulletPoints) {
            this.projectTitle = projectTitle;
            this.techStack = techStack;
            this.projectLink = projectLink;
            this.bulletPoints = bulletPoints != null ? bulletPoints : new ArrayList<>();
        }

        public String getProjectTitle() { return projectTitle; }
        public void setProjectTitle(String projectTitle) { this.projectTitle = projectTitle; }

        public String getTechStack() { return techStack; }
        public void setTechStack(String techStack) { this.techStack = techStack; }

        public String getProjectLink() { return projectLink; }
        public void setProjectLink(String projectLink) { this.projectLink = projectLink; }

        public List<String> getBulletPoints() { return bulletPoints; }
        public void setBulletPoints(List<String> bulletPoints) { this.bulletPoints = bulletPoints; }
    }

    public static class EducationItemDto {
        private String institution;
        private String degree;
        private String duration;
        private String gradeDetails;

        public EducationItemDto() {}

        public EducationItemDto(String institution, String degree, String duration, String gradeDetails) {
            this.institution = institution;
            this.degree = degree;
            this.duration = duration;
            this.gradeDetails = gradeDetails;
        }

        public String getInstitution() { return institution; }
        public void setInstitution(String institution) { this.institution = institution; }

        public String getDegree() { return degree; }
        public void setDegree(String degree) { this.degree = degree; }

        public String getDuration() { return duration; }
        public void setDuration(String duration) { this.duration = duration; }

        public String getGradeDetails() { return gradeDetails; }
        public void setGradeDetails(String gradeDetails) { this.gradeDetails = gradeDetails; }
    }

    // Getters and Setters
    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getApplyUrl() { return applyUrl; }
    public void setApplyUrl(String applyUrl) { this.applyUrl = applyUrl; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public String getCandidateEmail() { return candidateEmail; }
    public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getTagline() { return tagline; }
    public void setTagline(String tagline) { this.tagline = tagline; }

    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }

    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }

    public String getDegree() { return degree; }
    public void setDegree(String degree) { this.degree = degree; }

    public String getCollege() { return college; }
    public void setCollege(String college) { this.college = college; }

    public Integer getGraduationYear() { return graduationYear; }
    public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }

    public int getAtsScore() { return atsScore; }
    public void setAtsScore(int atsScore) { this.atsScore = atsScore; }

    public List<String> getMatchedKeywords() { return matchedKeywords; }
    public void setMatchedKeywords(List<String> matchedKeywords) { this.matchedKeywords = matchedKeywords; }

    public List<String> getTargetJobKeywords() { return targetJobKeywords; }
    public void setTargetJobKeywords(List<String> targetJobKeywords) { this.targetJobKeywords = targetJobKeywords; }

    public List<String> getMissingKeywords() { return missingKeywords; }
    public void setMissingKeywords(List<String> missingKeywords) { this.missingKeywords = missingKeywords; }

    public String getProfessionalSummary() { return professionalSummary; }
    public void setProfessionalSummary(String professionalSummary) { this.professionalSummary = professionalSummary; }

    public List<String> getCoreSkills() { return coreSkills; }
    public void setCoreSkills(List<String> coreSkills) { this.coreSkills = coreSkills; }

    public List<String> getTechnicalSkills() { return technicalSkills; }
    public void setTechnicalSkills(List<String> technicalSkills) { this.technicalSkills = technicalSkills; }

    public List<String> getToolsAndPlatforms() { return toolsAndPlatforms; }
    public void setToolsAndPlatforms(List<String> toolsAndPlatforms) { this.toolsAndPlatforms = toolsAndPlatforms; }

    public Map<String, String> getCategorizedSkills() { return categorizedSkills; }
    public void setCategorizedSkills(Map<String, String> categorizedSkills) { this.categorizedSkills = categorizedSkills; }

    public List<ExperienceItemDto> getExperienceItems() { return experienceItems; }
    public void setExperienceItems(List<ExperienceItemDto> experienceItems) { this.experienceItems = experienceItems; }

    public List<ProjectItemDto> getProjectItems() { return projectItems; }
    public void setProjectItems(List<ProjectItemDto> projectItems) { this.projectItems = projectItems; }

    public List<EducationItemDto> getEducationItems() { return educationItems; }
    public void setEducationItems(List<EducationItemDto> educationItems) { this.educationItems = educationItems; }

    public List<String> getCertifications() { return certifications; }
    public void setCertifications(List<String> certifications) { this.certifications = certifications; }

    public String getEducationSummary() { return educationSummary; }
    public void setEducationSummary(String educationSummary) { this.educationSummary = educationSummary; }

    public String getRawAtsPlainText() { return rawAtsPlainText; }
    public void setRawAtsPlainText(String rawAtsPlainText) { this.rawAtsPlainText = rawAtsPlainText; }
}
