package com.careerai.repository;

import com.careerai.dto.JobSearchCriteria;
import com.careerai.entity.EmploymentType;
import com.careerai.entity.ExperienceLevel;
import com.careerai.entity.Job;
import com.careerai.entity.JobSource;
import com.careerai.entity.RemoteType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class JobSpecification {

    public static Specification<Job> withCriteria(JobSearchCriteria criteria) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Always enforce active jobs
            predicates.add(cb.isTrue(root.get("isActive")));

            if (criteria == null) {
                return cb.and(predicates.toArray(new Predicate[0]));
            }

            // Keyword (title, company, description)
            if (criteria.getKeyword() != null && !criteria.getKeyword().trim().isEmpty()) {
                String pattern = "%" + criteria.getKeyword().trim().toLowerCase() + "%";
                Predicate titleLike = cb.like(cb.lower(root.get("title")), pattern);
                Predicate companyLike = cb.like(cb.lower(root.get("company")), pattern);
                Predicate descLike = cb.like(cb.lower(root.get("description")), pattern);
                predicates.add(cb.or(titleLike, companyLike, descLike));
            }

            // Location
            if (criteria.getLocation() != null && !criteria.getLocation().trim().isEmpty()) {
                String locPattern = "%" + criteria.getLocation().trim().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("location")), locPattern));
            }

            // Company
            if (criteria.getCompany() != null && !criteria.getCompany().trim().isEmpty()) {
                String compPattern = "%" + criteria.getCompany().trim().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("company")), compPattern));
            }

            // Employment Type
            if (criteria.getEmploymentType() != null && !criteria.getEmploymentType().trim().isEmpty()) {
                try {
                    EmploymentType type = EmploymentType.valueOf(criteria.getEmploymentType().toUpperCase());
                    predicates.add(cb.equal(root.get("employmentType"), type));
                } catch (IllegalArgumentException ignored) {
                }
            }

            // Category (FRESHER vs SENIOR vs MID_LEVEL vs ALL)
            if (criteria.getCategory() != null && !criteria.getCategory().trim().isEmpty()) {
                String cat = criteria.getCategory().trim().toUpperCase();
                if ("FRESHER".equals(cat) || "STUDENT".equals(cat)) {
                    Predicate isFresherLevel = cb.equal(root.get("experienceLevel"), ExperienceLevel.FRESHER);
                    Predicate isInternshipType = cb.equal(root.get("employmentType"), EmploymentType.INTERNSHIP);
                    Predicate isFresherCat = cb.equal(root.get("experienceCategory"), "FRESHER");
                    Predicate notSenior = cb.and(
                            cb.notEqual(root.get("experienceLevel"), ExperienceLevel.SENIOR),
                            cb.notEqual(root.get("experienceLevel"), ExperienceLevel.EXECUTIVE)
                    );
                    predicates.add(cb.and(cb.or(isFresherLevel, isInternshipType, isFresherCat), notSenior));
                } else if ("SENIOR".equals(cat) || "EXPERIENCED".equals(cat)) {
                    Predicate isSeniorLevel = cb.equal(root.get("experienceLevel"), ExperienceLevel.SENIOR);
                    Predicate isExec = cb.equal(root.get("experienceLevel"), ExperienceLevel.EXECUTIVE);
                    Predicate isSeniorCat = cb.equal(root.get("experienceCategory"), "SENIOR");
                    predicates.add(cb.or(isSeniorLevel, isExec, isSeniorCat));
                } else if ("MID_LEVEL".equals(cat)) {
                    predicates.add(cb.equal(root.get("experienceLevel"), ExperienceLevel.MID_LEVEL));
                }
            }

            // Academic Year / Stage Filtering
            if (criteria.getAcademicYear() != null && !criteria.getAcademicYear().trim().isEmpty()) {
                String year = criteria.getAcademicYear().toLowerCase();
                if (year.contains("1st") || year.contains("2nd") || year.contains("3rd") || year.contains("intern")) {
                    // Pre-final & early undergrads: Primarily Internships, Trainee, Apprentice
                    Predicate isIntern = cb.equal(root.get("employmentType"), EmploymentType.INTERNSHIP);
                    Predicate hasInternWord = cb.like(cb.lower(root.get("title")), "%intern%");
                    Predicate hasTrainee = cb.like(cb.lower(root.get("title")), "%trainee%");
                    Predicate targetYearMatch = cb.like(cb.lower(root.get("targetAcademicYears")), "%" + (year.contains("3rd") ? "3rd" : "year") + "%");
                    predicates.add(cb.or(isIntern, hasInternWord, hasTrainee, targetYearMatch));
                } else if (year.contains("4th") || year.contains("final")) {
                    // Final year: Full-time fresher, GET, Campus hiring, and 6-month internships
                    Predicate isFresher = cb.equal(root.get("experienceLevel"), ExperienceLevel.FRESHER);
                    Predicate isIntern = cb.equal(root.get("employmentType"), EmploymentType.INTERNSHIP);
                    Predicate isCampus = cb.like(cb.lower(root.get("title")), "%graduate%");
                    Predicate targetBatch = cb.like(cb.lower(root.get("targetBatches")), "%2026%");
                    predicates.add(cb.or(isFresher, isIntern, isCampus, targetBatch));
                } else if (year.contains("grad")) {
                    // Fresh Graduates (0-2 yrs): Full-time fresher and entry associate positions
                    Predicate isFresher = cb.equal(root.get("experienceLevel"), ExperienceLevel.FRESHER);
                    Predicate targetBatch = cb.like(cb.lower(root.get("targetBatches")), "%2025%");
                    predicates.add(cb.or(isFresher, targetBatch));
                }
            }

            // Experience Level
            if (criteria.getExperienceLevel() != null && !criteria.getExperienceLevel().trim().isEmpty()) {
                try {
                    ExperienceLevel level = ExperienceLevel.valueOf(criteria.getExperienceLevel().toUpperCase());
                    predicates.add(cb.equal(root.get("experienceLevel"), level));
                } catch (IllegalArgumentException ignored) {
                }
            }

            // Remote Type
            if (criteria.getRemoteType() != null && !criteria.getRemoteType().trim().isEmpty()) {
                try {
                    RemoteType remote = RemoteType.valueOf(criteria.getRemoteType().toUpperCase());
                    predicates.add(cb.equal(root.get("remoteType"), remote));
                } catch (IllegalArgumentException ignored) {
                }
            }

            // Source
            if (criteria.getSource() != null && !criteria.getSource().trim().isEmpty()) {
                try {
                    JobSource src = JobSource.valueOf(criteria.getSource().toUpperCase());
                    predicates.add(cb.equal(root.get("source"), src));
                } catch (IllegalArgumentException ignored) {
                }
            }

            // Minimum Salary
            if (criteria.getMinSalary() != null && criteria.getMinSalary() > 0) {
                predicates.add(cb.or(
                        cb.greaterThanOrEqualTo(root.get("salaryMin"), criteria.getMinSalary()),
                        cb.greaterThanOrEqualTo(root.get("salaryMax"), criteria.getMinSalary())
                ));
            }

            // Posted within days
            if (criteria.getPostedWithinDays() != null && criteria.getPostedWithinDays() > 0) {
                LocalDateTime threshold = LocalDateTime.now().minusDays(criteria.getPostedWithinDays());
                predicates.add(cb.greaterThanOrEqualTo(root.get("postedDate"), threshold));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
