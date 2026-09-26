package com.careerai.config;

import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url:}")
    private String configuredDbUrl;

    @Value("${spring.datasource.username:postgres}")
    private String defaultUsername;

    @Value("${spring.datasource.password:}")
    private String defaultPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariDataSource dataSource = new HikariDataSource();
        String rawUrl = resolveRawDatabaseUrl();

        log.info("Initializing DataSource. Raw target: {}", maskUrl(rawUrl));

        if (rawUrl.startsWith("postgres://") || rawUrl.startsWith("postgresql://")) {
            configureFromCloudUrl(dataSource, rawUrl);
        } else if (rawUrl.startsWith("jdbc:")) {
            dataSource.setJdbcUrl(rawUrl);
            dataSource.setUsername(defaultUsername);
            dataSource.setPassword(defaultPassword);
        } else {
            dataSource.setJdbcUrl("jdbc:postgresql://" + rawUrl);
            dataSource.setUsername(defaultUsername);
            dataSource.setPassword(defaultPassword);
        }

        // Warn if cloud environment is attempting to connect to localhost
        if (dataSource.getJdbcUrl() != null && dataSource.getJdbcUrl().contains("localhost:5432")) {
            boolean isCloud = System.getenv("RENDER") != null
                    || System.getenv("RAILWAY_ENVIRONMENT") != null
                    || System.getenv("FLY_APP_NAME") != null
                    || System.getenv("PORT") != null;

            if (isCloud) {
                log.error("""
                    \n========================================================================================
                    [FATAL CONFIGURATION ERROR] DATABASE_URL IS NOT SET IN YOUR CLOUD DASHBOARD!
                    The application is attempting to connect to 'localhost:5432', which does not exist in Render.
                    
                    HOW TO FIX ON RENDER:
                    1. Go to https://dashboard.render.com
                    2. Click on your PostgreSQL Database (e.g. 'careerai-db')
                    3. Copy the 'Internal Database URL' (starts with postgres://...)
                    4. Open your Backend Web Service -> Click 'Environment'
                    5. Add Environment Variable:
                       Key:   DATABASE_URL
                       Value: <paste the Internal Database URL>
                    6. Click 'Save Changes' to trigger redeployment.
                    ========================================================================================
                    """);
            }
        }

        dataSource.setDriverClassName("org.postgresql.Driver");
        dataSource.setMaximumPoolSize(10);
        dataSource.setMinimumIdle(2);
        dataSource.setConnectionTimeout(30000);
        return dataSource;
    }

    private String resolveRawDatabaseUrl() {
        // Check cloud environment variables first
        String[] envVars = {
                "DATABASE_URL",
                "DATABASE_INTERNAL_URL",
                "DATABASE_EXTERNAL_URL",
                "SPRING_DATASOURCE_URL",
                "POSTGRES_URL",
                "POSTGRESQL_URL"
        };

        for (String var : envVars) {
            String val = System.getenv(var);
            if (val != null && !val.isBlank()) {
                log.info("Detected database connection URL from environment variable [{}]", var);
                return val.trim();
            }
        }

        if (configuredDbUrl != null && !configuredDbUrl.isBlank()) {
            return configuredDbUrl.trim();
        }

        return "jdbc:postgresql://localhost:5432/careerai";
    }

    private void configureFromCloudUrl(HikariDataSource dataSource, String cloudUrl) {
        try {
            // Strip scheme prefix
            String withoutScheme = cloudUrl.replaceFirst("^postgres(ql)?://", "");

            String userInfo = null;
            String hostAndPath = withoutScheme;

            int atIndex = withoutScheme.indexOf('@');
            if (atIndex != -1) {
                userInfo = withoutScheme.substring(0, atIndex);
                hostAndPath = withoutScheme.substring(atIndex + 1);
            }

            // Parse username and password
            if (userInfo != null && !userInfo.isEmpty()) {
                int colonIndex = userInfo.indexOf(':');
                if (colonIndex != -1) {
                    String user = URLDecoder.decode(userInfo.substring(0, colonIndex), StandardCharsets.UTF_8);
                    String pass = URLDecoder.decode(userInfo.substring(colonIndex + 1), StandardCharsets.UTF_8);
                    dataSource.setUsername(user);
                    dataSource.setPassword(pass);
                } else {
                    dataSource.setUsername(URLDecoder.decode(userInfo, StandardCharsets.UTF_8));
                    dataSource.setPassword(defaultPassword);
                }
            } else {
                dataSource.setUsername(defaultUsername);
                dataSource.setPassword(defaultPassword);
            }

            String jdbcUrl = "jdbc:postgresql://" + hostAndPath;
            dataSource.setJdbcUrl(jdbcUrl);
            log.info("Configured JDBC URL successfully: jdbc:postgresql://{}", maskHostPath(hostAndPath));
        } catch (Exception e) {
            log.error("Failed to parse cloud database URL: {}", e.getMessage(), e);
            dataSource.setJdbcUrl("jdbc:postgresql://" + cloudUrl.replaceFirst("^postgres(ql)?://", ""));
            dataSource.setUsername(defaultUsername);
            dataSource.setPassword(defaultPassword);
        }
    }

    private String maskUrl(String url) {
        if (url == null) return "null";
        return url.replaceAll(":[^@/]+@", ":****@");
    }

    private String maskHostPath(String hostAndPath) {
        if (hostAndPath == null) return "null";
        int slash = hostAndPath.indexOf('/');
        if (slash != -1) {
            return hostAndPath.substring(0, slash) + "/...";
        }
        return hostAndPath;
    }
}
