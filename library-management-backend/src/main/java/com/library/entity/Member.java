package com.library.entity;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
@Entity
@Table(name="members", uniqueConstraints=@UniqueConstraint(columnNames="email"))
public class Member {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @NotBlank(message="Member name is required") @Size(max=120) @Column(nullable=false) private String fullName;
    @NotBlank(message="Email is required") @Email(message="Enter a valid email address") @Column(nullable=false, unique=true) private String email;
    @Size(max=30) private String phone;
    @Size(max=300) private String address;
    @Column(nullable=false) private LocalDate membershipDate;
    public Member() {}
    @PrePersist public void setMembershipDateIfMissing(){if(membershipDate==null) membershipDate=LocalDate.now();}
    public Long getId(){return id;} public void setId(Long v){id=v;}
    public String getFullName(){return fullName;} public void setFullName(String v){fullName=v;}
    public String getEmail(){return email;} public void setEmail(String v){email=v;}
    public String getPhone(){return phone;} public void setPhone(String v){phone=v;}
    public String getAddress(){return address;} public void setAddress(String v){address=v;}
    public LocalDate getMembershipDate(){return membershipDate;} public void setMembershipDate(LocalDate v){membershipDate=v;}
}
