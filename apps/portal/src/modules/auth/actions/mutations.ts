"use server";

import { APIError } from "better-auth/api";

import { vendorRegistrationSchema } from "@ziron/validators";

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
        case "USER_NOT_FOUND":
          return { error: "User not found" };
        case "EMAIL_NOT_VERIFIED":
          return { error: "Email not verified" };
        case "INVALID_TOKEN":
          return { error: "Invalid or expired token" };

        case "INVALID_OTP":
          return { error: "Invalid or expired OTP" };
        case "OTP_EXPIRED":
          return { error: "OTP has expired" };
        case "TOO_MANY_ATTEMPTS":
          return { error: "Too many attempts. Please wait before trying again" };

        default:
          return { error: err.message || "An unexpected error occurred" };
      }
    }

    return { error: "Internal Server Error" };
  }
}

// export async function verifyEmailOTPAction(data: {
//   email: string;
//   otp: string;
//   vendorDetails?: {
//     name: string;
//   };
// }) {
//   try {
//     const { email, otp, vendorDetails } = data;

//     // Validate input
//     if (!email || !otp) {
//       return { error: "Email and OTP are required" };
//     }

//     // Verify email OTP using better-auth
//     const result = await auth.api.verifyEmailOTP({
//       body: {
//         email,
//         otp,
//       },
//     });

//     if (!result.user) {
//       return { error: "OTP verification failed" };
//     }

//     // Create vendor record and link to user if vendor details are provided
//     let vendor = null;
//     if (vendorDetails) {
//       try {
//         // Note: This would need to be implemented based on your database schema
//         // For now, we'll just log the vendor details
//         log.success("Vendor details provided", {
//           userId: result.user.id,
//           vendorName: vendorDetails.name,
//         });

//         // TODO: Implement vendor creation logic here
//         // vendor = await createVendorWithUser(trx, vendorDetails, result.user.id);
//       } catch (vendorError) {
//         log.error("Failed to create vendor record:", vendorError);
//         return { error: "Failed to create vendor profile" };
//       }
//     }

//     log.success("Email OTP verified successfully", {
//       userId: result.user.id,
//       email: result.user.email,
//       vendorId: vendor?.id,
//     });

//     return {
//       success: true,
//       error: null,
//       data: {
//         userId: result.user.id,
//         email: result.user.email,
//         vendor: vendor
//           ? {
//               id: vendor.id,
//               name: vendor.name,
//               slug: vendor.slug,
//             }
//           : null,
//       },
//     };
//   } catch (err) {
//     log.error("Email OTP verification error:", err);

//     if (err instanceof APIError) {
//       const errCode = err.body ? (err.body.code as ErrorTypes) : "UNKNOWN";

//       switch (errCode) {
//         case "INVALID_OTP":
//           return { error: "Invalid or expired OTP" };
//         case "OTP_EXPIRED":
//           return { error: "OTP has expired" };
//         case "USER_NOT_FOUND":
//           return { error: "User not found" };
//         case "EMAIL_NOT_VERIFIED":
//           return { error: "Email not verified" };
//         case "INVALID_EMAIL":
//           return { error: "Invalid email address" };
//         case "RATE_LIMIT":
//           return { error: "Too many attempts. Please wait before trying again" };
//         case "TOO_MANY_ATTEMPTS":
//           return { error: "Too many attempts. Please wait before trying again" };
//         case "ACCOUNT_LOCKED":
//           return { error: "Account has been locked due to security concerns" };
//         case "INVALID_TOKEN":
//           return { error: "Invalid or expired token" };
//         case "TOKEN_EXPIRED":
//           return { error: "Token has expired" };
//         case "INVALID_REQUEST":
//           return { error: "Invalid request data" };
//         case "UNAUTHORIZED":
//           return { error: "Unauthorized access" };
//         case "FORBIDDEN":
//           return { error: "Access forbidden" };
//         case "NOT_FOUND":
//           return { error: "Resource not found" };
//         case "CONFLICT":
//           return { error: "Resource conflict" };
//         case "UNPROCESSABLE_ENTITY":
//           return { error: "Invalid data provided" };
//         case "INTERNAL_SERVER_ERROR":
//           return { error: "Internal server error" };
//         case "SERVICE_UNAVAILABLE":
//           return { error: "Service temporarily unavailable" };
//         case "BAD_GATEWAY":
//           return { error: "Bad gateway error" };
//         case "GATEWAY_TIMEOUT":
//           return { error: "Gateway timeout" };
//         default:
//           return { error: err.message || "An unexpected error occurred" };
//       }
//     }

//     return { error: "Internal Server Error" };
//   }
// }
