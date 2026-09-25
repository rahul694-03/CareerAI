package com.careerai.repository;

import com.careerai.entity.EmploymentType;
import com.careerai.entity.Job;
import com.careerai.entity.JobSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {

    List<Job> findByIsActiveTrue();

    Page<Job> findByIsActiveTrue(Pageable pageable);

    long countByIsActiveTrue();

    long countByIsActiveTrueAndEmploymentType(EmploymentType employmentType);

    Optional<Job> findBySourceAndSourceJobId(JobSource source, String sourceJobId);

    Optional<Job> findBySourceJobId(String sourceJobId);

    List<Job> findByCompanyIgnoreCase(String company);

    @org.springframework.transaction.annotation.Transactional
    void deleteBySource(JobSource source);
}
