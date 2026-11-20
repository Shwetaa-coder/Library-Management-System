package com.library.repository;
import com.library.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
public interface MemberRepository extends JpaRepository<Member,Long> {
    boolean existsByEmail(String email);
    boolean existsByEmailAndIdNot(String email,Long id);
}
