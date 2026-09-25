package com.careerai.service;

import com.careerai.entity.EmploymentType;
import com.careerai.entity.ExperienceLevel;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
public class JobClassificationService {

    // Regex for Internships with strict word boundaries (prevents matching 'internal' or 'international')
    private static final Pattern INTERN_PATTERN = Pattern.compile(
            "\\b(intern|internship|interns|co-op|coop|apprentice|apprenticeship|summer analyst|summer intern|student intern|fellowship)\\b",
            Pattern.CASE_INSENSITIVE
    );

    // Negative filter for intern pattern false positives
    private static final Pattern INTERN_NEGATIVE_PATTERN = Pattern.compile(
            "\\b(internal|international|internet)\\b",
            Pattern.CASE_INSENSITIVE
    );

    // Regex for Senior / Leadership roles
    private static final Pattern SENIOR_PATTERN = Pattern.compile(
            "\\b(senior|sr\\b|sr\\.|lead\\b|principal|staff\\b|distinguished|architect|director|head of|vp\\b|vice president|manager|chief|executive|group manager|tech lead|team lead|specialist ii|specialist iii|engineer iii|engineer iv|sde iii|sde iv|l5\\b|l6\\b|l7\\b)\\b",
            Pattern.CASE_INSENSITIVE
    );

    // Regex for Fresher / Student / Entry-level roles
    private static final Pattern FRESHER_PATTERN = Pattern.compile(
            "\\b(graduate|fresher|entry-level|entry level|junior|jr\\b|jr\\.|associate software engineer|associate engineer|associate developer|associate qa|associate analyst|campus|university|fresh|trainee|graduate engineer trainee|get\\b|sde 1|sde-1|sde i\\b|sde-i\\b|engineer 1|engineer i\\b|analyst 1|analyst i\\b|developer 1|developer i\\b|software engineer 1|l1\\b|level 1)\\b",
            Pattern.CASE_INSENSITIVE
    );

    public static class ClassificationResult {
        private final ExperienceLevel experienceLevel;
        private final EmploymentType employmentType;
        private final String experienceCategory; // FRESHER, SENIOR, MID_LEVEL
        private final String targetAcademicYears;
        private final String targetBatches;

        public ClassificationResult(ExperienceLevel experienceLevel, EmploymentType employmentType,
                                    String experienceCategory, String targetAcademicYears, String targetBatches) {
            this.experienceLevel = experienceLevel;
            this.employmentType = employmentType;
            this.experienceCategory = experienceCategory;
            this.targetAcademicYears = targetAcademicYears;
            this.targetBatches = targetBatches;
        }

        public ExperienceLevel getExperienceLevel() { return experienceLevel; }
        public EmploymentType getEmploymentType() { return employmentType; }
        public String getExperienceCategory() { return experienceCategory; }
        public String getTargetAcademicYears() { return targetAcademicYears; }
        public String getTargetBatches() { return targetBatches; }
    }

    public ClassificationResult classify(String title, String description, EmploymentType currentType) {
        String cleanTitle = title != null ? title.trim() : "";
        String lowerTitle = cleanTitle.toLowerCase();

        boolean hasInternMatch = INTERN_PATTERN.matcher(lowerTitle).find();
        boolean hasInternFalsePositive = INTERN_NEGATIVE_PATTERN.matcher(lowerTitle).find() && !lowerTitle.contains("internship");
        boolean isIntern = hasInternMatch && !hasInternFalsePositive;

        boolean isSenior = SENIOR_PATTERN.matcher(lowerTitle).find();
        // Exception: "Associate Manager" is Senior/Manager, but "Associate Engineer" is Fresher
        boolean isFresher = !isSenior && (isIntern || FRESHER_PATTERN.matcher(lowerTitle).find());

        if (isIntern) {
            return new ClassificationResult(
                    ExperienceLevel.FRESHER,
                    EmploymentType.INTERNSHIP,
                    "FRESHER",
                    "1st Year, 2nd Year, 3rd Year (Pre-Final)",
                    "2028, 2029, 2030"
            );
        }

        if (isFresher) {
            return new ClassificationResult(
                    ExperienceLevel.FRESHER,
                    currentType != null ? currentType : EmploymentType.FULL_TIME,
                    "FRESHER",
                    "4th Year (Final Year), Fresh Graduate",
                    "2026, 2027"
            );
        }

        if (isSenior) {
            return new ClassificationResult(
                    ExperienceLevel.SENIOR,
                    currentType != null ? currentType : EmploymentType.FULL_TIME,
                    "SENIOR",
                    "Experienced (5+ Yrs)",
                    "2021 & Earlier"
            );
        }

        // Default to Mid-Level (1-4 years experience)
        return new ClassificationResult(
                ExperienceLevel.MID_LEVEL,
                currentType != null ? currentType : EmploymentType.FULL_TIME,
                "MID_LEVEL",
                "Fresh Graduate (0-2 Yrs), Early Career",
                "2024, 2025, 2026"
        );
    }
}
