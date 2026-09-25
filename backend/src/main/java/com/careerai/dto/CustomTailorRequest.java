package com.careerai.dto;

public class CustomTailorRequest {
    private String jobTitle;
    private String company;
    private String jobDescription;

    public CustomTailorRequest() {}

    public CustomTailorRequest(String jobTitle, String company, String jobDescription) {
        this.jobTitle = jobTitle;
        this.company = company;
        this.jobDescription = jobDescription;
    }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getJobDescription() { return jobDescription; }
    public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }
}
