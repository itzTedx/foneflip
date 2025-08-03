"use server";

import { APIError } from "better-auth/api";

import { vendorRegistrationSchema, z } from "@ziron/validators";

import { auth, ErrorCode } from "@/lib/auth/server";
import { createLog } from "@/lib/utils";

const log = createLog("VendorAuth");

// Schema for vendor signup validation

export async function signUpEmailAction(formData: unknown) {
  try {
    // Validate input
    const { data, error, success } = vendorRegistrationSchema.safeParse(formData);
    if (!success) {
      return { error: error.issues[0]?.message ?? "Invalid data" };
    }

    // Create user account
    const result = await auth.api.signUpEmail({
      body: {
        name: data.name,
        email: data.email,
        password: data.password,
      },
    });

    if (!result.user) {
      return { error: "Failed to create user account" };
    }

    log.success("Vendor account created successfully", {
      userId: result.user.id,
      email: result.user.email,
    });

    return {
      success: true,
      error: null,
      data: {
        userId: result.user.id,
        email: result.user.email,
      },
    };
  } catch (err) {
    log.error("Vendor signup error:", err);

    if (err instanceof APIError) {
      const errCode = err.body ? (err.body.code as ErrorCode) : "UNKNOWN";

      switch (errCode) {
        case "USER_ALREADY_EXISTS":
          return { error: "An account with this email already exists" };
        case "INVALID_EMAIL":
          return { error: "Invalid email address" };
        case "INVALID_PASSWORD":
          return { error: "Password does not meet requirements" };

        default:
          return { error: err.message || "An unexpected error occurred" };
      }
    }

    return { error: "Internal Server Error" };
  }
}

const emailOTPSchema = z.object({
  email: z.email(),
  otp: z.string().length(6),
});

export async function verifyEmailOTPAction(formData: unknown) {
  try {
    const { data, error, success } = emailOTPSchema.safeParse(formData);

    if (!success) {
      return { error: error.issues[0]?.message ?? "Invalid data" };
    }

    // Verify email OTP using better-auth
    const result = await auth.api.verifyEmailOTP({
      body: {
        email: data.email,
        otp: data.otp,
      },
    });

    if (!result.user) {
      return { error: "OTP verification failed" };
    }

    log.success("Email OTP verified successfully", {
      userId: result.user.id,
      email: result.user.email,
    });

    return {
      success: true,
      error: null,
      data: {
        userId: result.user.id,
        email: result.user.email,
      },
    };
  } catch (err) {
    log.error("Email OTP verification error:", err);

    if (err instanceof APIError) {
      const errCode = err.body ? (err.body.code as ErrorCode) : "UNKNOWN";

      switch (errCode) {
        case "INVALID_OTP":
          return { error: "Invalid or expired OTP", code: "INVALID_OTP" };
        case "OTP_EXPIRED":
          return { error: "OTP has expired", code: "OTP_EXPIRED" };
        case "USER_NOT_FOUND":
          return { error: "User not found" };
        case "EMAIL_NOT_VERIFIED":
          return { error: "Email not verified" };
        case "INVALID_EMAIL":
          return { error: "Invalid email address" };

        case "TOO_MANY_ATTEMPTS":
          return { error: "Too many attempts. Please wait before trying again" };

        case "INVALID_TOKEN":
          return { error: "Invalid or expired token" };

        default:
          return { error: err.message || "An unexpected error occurred" };
      }
    }

    return { error: "Internal Server Error" };
  }
}

const emailSchema = z.object({
  email: z.email(),
});

export async function resendEmailOTPAction(formData: unknown) {
  const { data, error, success } = emailSchema.safeParse(formData);

  if (!success) {
    return { error: error.issues[0]?.message ?? "Invalid data" };
  }
  try {
    // For resending OTP, we'll trigger the signup process again
    // This will send a new OTP to the existing user
    const res = await auth.api.sendVerificationOTP({
      body: {
        email: data.email,
        type: "email-verification",
      },
    });

    // If user already exists, this will trigger a new OTP
    if (res.success) {
      log.success("Email OTP resent successfully", {
        email: data.email,
      });

      return {
        success: true,
        error: null,
        data: {
          email: data.email,
        },
      };
    }

    return { error: "Failed to resend OTP" };
  } catch (err) {
    log.error("Email OTP resend error:", err);

    if (err instanceof APIError) {
      const errCode = err.body ? (err.body.code as ErrorCode) : "UNKNOWN";

      switch (errCode) {
        case "USER_ALREADY_EXISTS":
          // This is expected for resend - the user already exists
          return {
            success: true,
            error: null,
            data: { email: data.email },
          };
        case "USER_NOT_FOUND":
          return { error: "User not found" };
        case "INVALID_EMAIL":
          return { error: "Invalid email address" };
        case "TOO_MANY_ATTEMPTS":
          return { error: "Too many attempts. Please wait before trying again" };
        case "EMAIL_NOT_VERIFIED":
          return { error: "Email not verified" };
        case "INVALID_TOKEN":
          return { error: "Invalid or expired token" };

        default:
          return { error: err.message || "An unexpected error occurred" };
      }
    }

    return { error: "Internal Server Error" };
  }
}
