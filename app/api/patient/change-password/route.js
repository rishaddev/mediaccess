import { doc, getDoc, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { verifyPassword, hashPassword } from "@/lib/auth";

export async function POST(req) {
  try {
    // Parse JSON data from request body
    const data = await req.json();
    const { id, email, oldPassword, newPassword, confirmPassword } = data;

    // Validate required fields
    if (!id || !email || !oldPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { message: "All fields are required (id, email, oldPassword, newPassword, confirmPassword)" },
        { status: 400 }
      );
    }

    // Validate new password confirmation
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { message: "New password and confirm password do not match" },
        { status: 400 }
      );
    }

    // Validate new password strength (optional - customize as needed)
    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "New password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Get patient document by ID
    const patientRef = doc(db, "patients", id);
    const patientDoc = await getDoc(patientRef);

    // Check if patient exists
    if (!patientDoc.exists()) {
      return NextResponse.json(
        { message: "Patient not found" },
        { status: 404 }
      );
    }

    const patientData = patientDoc.data();

    // Verify email matches (additional security check)
    if (patientData.email !== email) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify old password
    const isOldPasswordValid = await verifyPassword(oldPassword, patientData.password);

    if (!isOldPasswordValid) {
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Check if new password is same as old password
    const isSamePassword = await verifyPassword(newPassword, patientData.password);
    if (isSamePassword) {
      return NextResponse.json(
        { message: "New password must be different from current password" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update patient document with new password
    await updateDoc(patientRef, {
      password: hashedNewPassword,
      passwordUpdatedAt: new Date().toISOString(), // Optional: track when password was changed
    });

    return NextResponse.json(
      { 
        message: "Password changed successfully"
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { message: "Failed to change password", error: error.message },
      { status: 500 }
    );
  }
}