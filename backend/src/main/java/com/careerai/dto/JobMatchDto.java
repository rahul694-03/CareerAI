package com.careerai.dto;

import java.util.ArrayList;
import java.util.List;

public class JobMatchDto {

    private JobDto job;
    private int matchScore; // 0 to 100 percentage
    private List<String> matchedSkills = new ArrayList<>();
    private List<String> missingSkills = new ArrayList<>();
    private List<String> strongMatches = new ArrayList<>();
    private List<String> potentialGaps = new ArrayList<>();
    private int requiredSkillsFoundCount;
    private int skillsNotFoundCount;
    private String disclaimer = "Not found in resume does not mean you do not possess the skill. CareerAI will never automatically alter your resume.";

    public JobMatchDto() {
    }

    public JobMatchDto(JobDto job, int matchScore, List<String> matchedSkills, List<String> missingSkills) {
        this.job = job;
        this.matchScore = matchScore;
        this.matchedSkills = matchedSkills != null ? matchedSkills : new ArrayList<>();
        this.missingSkills = missingSkills != null ? missingSkills : new ArrayList<>();
        this.strongMatches = this.matchedSkills;
        this.potentialGaps = this.missingSkills;
        this.requiredSkillsFoundCount = this.matchedSkills.size();
        this.skillsNotFoundCount = this.missingSkills.size();
    }

    public JobDto getJob() { return job; }
    public void setJob(JobDto job) { this.job = job; }

    public int getMatchScore() { return matchScore; }
    public void setMatchScore(int matchScore) { this.matchScore = matchScore; }

    public List<String> getMatchedSkills() { return matchedSkills; }
    public void setMatchedSkills(List<String> matchedSkills) {
        this.matchedSkills = matchedSkills;
        this.strongMatches = matchedSkills;
        this.requiredSkillsFoundCount = matchedSkills != null ? matchedSkills.size() : 0;
    }

    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> missingSkills) {
        this.missingSkills = missingSkills;
        this.potentialGaps = missingSkills;
        this.skillsNotFoundCount = missingSkills != null ? missingSkills.size() : 0;
    }

    public List<String> getStrongMatches() { return strongMatches; }
    public void setStrongMatches(List<String> strongMatches) { this.strongMatches = strongMatches; }

    public List<String> getPotentialGaps() { return potentialGaps; }
    public void setPotentialGaps(List<String> potentialGaps) { this.potentialGaps = potentialGaps; }

    public int getRequiredSkillsFoundCount() { return requiredSkillsFoundCount; }
    public void setRequiredSkillsFoundCount(int requiredSkillsFoundCount) { this.requiredSkillsFoundCount = requiredSkillsFoundCount; }

    public int getSkillsNotFoundCount() { return skillsNotFoundCount; }
    public void setSkillsNotFoundCount(int skillsNotFoundCount) { this.skillsNotFoundCount = skillsNotFoundCount; }

    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }
}
