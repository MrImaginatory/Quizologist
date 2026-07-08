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
    role: "student" as "student" | "teacher",
  });

  const [errors, setErrors] = useState({
    fname: "",
    lname: "",
    email: "",
    mobilenumber: "",
    password: "",
  });

  const validate = () => {
    const newErrors = {
      fname: "",
      lname: "",
      email: "",
      mobilenumber: "",
      password: "",
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
    } else if (formData.mobilenumber.length < 10) {
      newErrors.mobilenumber = "Mobile number must be at least 10 digits";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
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
        mobilenumber: formData.mobilenumber.trim(),
        password: formData.password,
      });

      const data = response as { success: boolean; data: { user: any; token: string } };
      setAuth(data.data.token, data.data.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
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
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => handleChange("password", e.target.value)}
          error={errors.password}
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
