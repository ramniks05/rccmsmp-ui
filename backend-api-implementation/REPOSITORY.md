# Repository Layer

## File: src/main/java/com/rccms/repository/UserRepository.java

```java
package com.rccms.repository;

import com.rccms.entity.User;
import com.rccms.enums.UserType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find user by email
     */
    Optional<User> findByEmail(String email);

    /**
     * Find user by mobile number
     */
    Optional<User> findByMobileNumber(String mobileNumber);

    /**
     * Find user by Aadhar number
     */
    Optional<User> findByAadharNumber(String aadharNumber);

    /**
     * Find user by email or mobile number
     */
    @Query("SELECT u FROM User u WHERE u.email = :identifier OR u.mobileNumber = :identifier")
    Optional<User> findByEmailOrMobileNumber(@Param("identifier") String identifier);

    /**
     * Find user by email or mobile number and user type
     */
    @Query("SELECT u FROM User u WHERE (u.email = :identifier OR u.mobileNumber = :identifier) AND u.userType = :userType")
    Optional<User> findByEmailOrMobileNumberAndUserType(@Param("identifier") String identifier, @Param("userType") UserType userType);

    /**
     * Check if email exists
     */
    boolean existsByEmail(String email);

    /**
     * Check if mobile number exists
     */
    boolean existsByMobileNumber(String mobileNumber);

    /**
     * Check if Aadhar number exists
     */
    boolean existsByAadharNumber(String aadharNumber);
}
```

