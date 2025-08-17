import { collection, query, where, getDocs } from "firebase/firestore";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { verifyPassword } from "@/lib/auth";

export async function POST(req) {
  try {
    // Parse JSON data from request body
    const data = await req.json();
    const { email, password } = data;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Query Firestore for patient with matching email
    const patientsRef = collection(db, "patients");
    const q = query(patientsRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    // Check if patient exists
    if (querySnapshot.empty) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Get the first (and should be only) patient document
    const patientDoc = querySnapshot.docs[0];
    const patientData = patientDoc.data();

    // Verify password
    const isPasswordValid = await verifyPassword(password, patientData.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Remove password from response data for security
    const { password: _, ...patientResponse } = patientData;

    // Return patient data (excluding password)
    const patient = {
      id: patientDoc.id,
      ...patientResponse,
    };

    return NextResponse.json(
      { 
        message: "Login successful",
        patient 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Patient login error:", error);
    return NextResponse.json(
      { message: "Failed to authenticate patient", error: error.message },
      { status: 500 }
    );
  }
}