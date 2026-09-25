package com.careerai.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class ResumeParserService {

    private static final Logger log = LoggerFactory.getLogger(ResumeParserService.class);

    // Curated catalog of recognized skills across multiple college disciplines & tech domains
    private static final List<String> SKILL_CATALOG = List.of(
            // Programming Languages
            "Java", "Python", "JavaScript", "TypeScript", "C++", "C#", "C", "Go", "Rust", "PHP", "Ruby", "Kotlin", "Swift", "Dart", "R",
            // Web & Frontend
            "React", "React.js", "Next.js", "Angular", "Vue.js", "HTML", "HTML5", "CSS", "CSS3", "Tailwind CSS", "Bootstrap", "Redux", "Sass", "Webpack", "Vite",
            // Backend & Frameworks
            "Spring", "Spring Boot", "Node.js", "Express", "Express.js", "Django", "Flask", "FastAPI", "ASP.NET", "Hibernate", "REST API", "GraphQL", "Microservices",
            // Databases
            "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Oracle", "Cassandra", "DynamoDB", "Elasticsearch",
            // Cloud & DevOps
            "AWS", "Azure", "Google Cloud", "GCP", "Docker", "Kubernetes", "Git", "GitHub", "GitLab", "CI/CD", "Linux", "Terraform", "Jenkins",
            // Data Science & AI/ML
            "Machine Learning", "Deep Learning", "Artificial Intelligence", "Data Analysis", "Data Science", "Pandas", "NumPy", "Scikit-Learn", "TensorFlow", "PyTorch", "Tableau", "Power BI", "NLP", "Computer Vision",
            // Design & Product
            "UI/UX Design", "Figma", "Adobe XD", "Wireframing", "Prototyping", "User Research", "Product Management",
            // Core Engineering & College Disciplines
            "Data Structures", "Algorithms", "Object-Oriented Programming", "OOP", "DBMS", "Operating Systems", "Computer Networks", "Software Engineering",
            // Business, Finance & Soft Skills
            "Excel", "Financial Modeling", "Accounting", "Marketing", "Digital Marketing", "SEO", "Content Writing", "Project Management", "Agile", "Scrum", "Communication", "Problem Solving"
    );

    public String extractText(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return "";
        }

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";

        try {
            byte[] bytes = file.getBytes();

            if (originalFilename.endsWith(".pdf") || "application/pdf".equalsIgnoreCase(file.getContentType())) {
                return extractTextFromPdf(bytes);
            } else if (originalFilename.endsWith(".docx")) {
                return extractTextFromDocx(bytes);
            } else {
                // Fallback for TXT, CSV, or plain text files
                return new String(bytes, StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            log.warn("Failed to extract text from file {}: {}", file.getOriginalFilename(), e.getMessage());
            return "";
        }
    }

    private String extractTextFromPdf(byte[] bytes) {
        try (PDDocument document = Loader.loadPDF(bytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        } catch (Exception e) {
            log.error("Error reading PDF content: {}", e.getMessage());
            return "";
        }
    }

    private String extractTextFromDocx(byte[] bytes) {
        // DOCX is a zip archive containing word/document.xml with XML text tags <w:t>...</w:t>
        StringBuilder extracted = new StringBuilder();
        try (ZipInputStream zip = new ZipInputStream(new ByteArrayInputStream(bytes))) {
            ZipEntry entry;
            while ((entry = zip.getNextEntry()) != null) {
                if ("word/document.xml".equals(entry.getName())) {
                    Scanner scanner = new Scanner(zip, StandardCharsets.UTF_8.name());
                    while (scanner.hasNextLine()) {
                        String line = scanner.nextLine();
                        // Strip XML tags to get raw content
                        String text = line.replaceAll("<[^>]+>", " ");
                        extracted.append(text).append(" ");
                    }
                    break;
                }
            }
        } catch (Exception e) {
            log.warn("Error reading DOCX: {}", e.getMessage());
        }
        return extracted.toString();
    }

    public List<String> extractSkills(String text) {
        if (text == null || text.isBlank()) {
            return Collections.emptyList();
        }

        String lowerText = text.toLowerCase();
        Set<String> detected = new LinkedHashSet<>();

        for (String skill : SKILL_CATALOG) {
            String skillLower = skill.toLowerCase();

            // Handle special cases with punctuation like C++, C#, .NET, Node.js, React.js
            String regex;
            if (skill.equals("C++")) {
                regex = "(?i)(^|[^a-zA-Z0-9])c\\+\\+([^a-zA-Z0-9]|$)";
            } else if (skill.equals("C#")) {
                regex = "(?i)(^|[^a-zA-Z0-9])c#([^a-zA-Z0-9]|$)";
            } else if (skill.equals("C")) {
                regex = "(?i)(^|[^a-zA-Z0-9])c([^a-zA-Z0-9+]|$)";
            } else if (skill.equals("R")) {
                regex = "(?i)(^|[^a-zA-Z0-9])r([^a-zA-Z0-9]|$)";
            } else if (skill.contains(".")) {
                regex = "(?i)\\b" + Pattern.quote(skillLower) + "\\b";
            } else {
                regex = "(?i)\\b" + Pattern.quote(skillLower) + "\\b";
            }

            Pattern pattern = Pattern.compile(regex);
            Matcher matcher = pattern.matcher(text);
            if (matcher.find()) {
                // Normalize names (e.g. React.js -> React)
                if (skill.equalsIgnoreCase("React.js")) {
                    detected.add("React");
                } else if (skill.equalsIgnoreCase("Express.js")) {
                    detected.add("Express");
                } else if (skill.equalsIgnoreCase("Vue.js")) {
                    detected.add("Vue");
                } else {
                    detected.add(skill);
                }
            }
        }

        return new ArrayList<>(detected);
    }
}
