"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/auth/Input";
import Button from "@/components/auth/Button";
import RadioGroup from "@/components/auth/RadioGroup";
import FormError from "@/components/auth/FormError";
import { api } from "@/lib/api";
import { setAuth } from "@/lib/auth";
import styles from "./page.module.css";

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    mobilenumber: "",
    password: "",
    confirmPassword: "",
    role: "student" as "student" | "teacher",
  });

  const [errors, setErrors] = useState({
    fname: "",
    lname: "",
    email: "",
    mobilenumber: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength checker
  const checkPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score; // 0 to 5
  };

  const getStrengthLabel = (score: number) => {
    if (score === 0) return { label: "", color: "transparent" };
    if (score <= 2) return { label: "Weak", color: "#ef4444" };
    if (score <= 4) return { label: "Medium", color: "#f59e0b" };
    return { label: "Strong", color: "#10b981" };
  };

  const passwordScore = formData.password ? checkPasswordStrength(formData.password) : 0;
  const strengthInfo = getStrengthLabel(passwordScore);

  const validate = () => {
    const newErrors = {
      fname: "",
      lname: "",
      email: "",
      mobilenumber: "",
      password: "",
      confirmPassword: "",
    };
    let isValid = true;

    if (!formData.fname.trim()) {
      newErrors.fname = "First name is required";
      isValid = false;
    }

    if (!formData.lname.trim()) {
      newErrors.lname = "Last name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    if (!formData.mobilenumber.trim()) {
      newErrors.mobilenumber = "Mobile number is required";
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.mobilenumber)) {
      newErrors.mobilenumber = "Mobile number must be exactly 10 digits";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (passwordScore < 5) {
      newErrors.password = "Password must be at least 8 chars, with uppercase, lowercase, number and special char";
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setIsLoading(true);

    try {
      const response = await api.signup({
        fname: formData.fname.trim(),
        lname: formData.lname.trim(),
        role: formData.role,
        email: formData.email.trim().toLowerCase(),
        mobileNumber: formData.mobilenumber.trim(),
        password: formData.password,
      } as any);

      const data = response as { success: boolean; data: { user: any; token: string } };
      setAuth(data.data.token, data.data.user);
      router.push("/dashboard");
    } catch (err: any) {
      if (err.data && Array.isArray(err.data)) {
        // Handle validation errors from backend
        const newErrors = { ...errors };
        err.data.forEach((validationErr: any) => {
          if (validationErr.field && newErrors.hasOwnProperty(validationErr.field)) {
            (newErrors as any)[validationErr.field] = validationErr.message;
          } else if (validationErr.field === 'mobileNumber') {
            newErrors.mobilenumber = validationErr.message;
          }
        });
        setErrors(newErrors);
        setError("Please fix the highlighted errors.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    // For mobile number, only allow numbers and max 10 chars
    if (field === "mobilenumber") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }
    
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className={styles.form}>
      <div className={styles.header}>
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>
          Already have an account?{" "}
          <Link href="/signin">Sign In</Link>
        </p>
      </div>

      {error && (
        <div className={styles.errorContainer}>
          <FormError message={error} />
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles.nameRow}>
          <Input
            label="First Name"
            placeholder="John"
            value={formData.fname}
            onChange={(e) => handleChange("fname", e.target.value)}
            error={errors.fname}
          />
          <Input
            label="Last Name"
            placeholder="Doe"
            value={formData.lname}
            onChange={(e) => handleChange("lname", e.target.value)}
            error={errors.lname}
          />
        </div>

        <Input
          label="Email"
          type="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          error={errors.email}
        />

        <Input
          label="Mobile Number"
          type="tel"
          placeholder="9876543210"
          value={formData.mobilenumber}
          onChange={(e) => handleChange("mobilenumber", e.target.value)}
          error={errors.mobilenumber}
        />

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => handleChange("password", e.target.value)}
          error={errors.password}
          rightElement={
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
          }
        />
        
        {/* Password Strength Indicator */}
        {formData.password && (
          <div style={{ marginTop: '-0.5rem', marginBottom: '1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ flex: 1, height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${(passwordScore / 5) * 100}%`, 
                height: '100%', 
                background: strengthInfo.color,
                transition: 'all 0.3s ease'
              }} />
            </div>
            <span style={{ color: strengthInfo.color, fontWeight: 500 }}>{strengthInfo.label}</span>
          </div>
        )}

        <Input
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
          error={errors.confirmPassword}
          rightElement={
            <button 
              type="button" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              {showConfirmPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
          }
        />

        <RadioGroup
          name="role"
          label="I am a"
          options={[
            { value: "student", label: "Student" },
            { value: "teacher", label: "Teacher" },
          ]}
          value={formData.role}
          onChange={(value) => handleChange("role", value)}
        />

        <Button type="submit" loading={isLoading} fullWidth>
          Create Account
        </Button>
      </form>
    </div>
  );
}
