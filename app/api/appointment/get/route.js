import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // Validate if the ID is provided
    if (!id) {
      return NextResponse.json(
        { message: "Invalid Appointment ID format" },
        { status: 400 }
      );
    }

    // Reference the specific appointment in Firestore
    const appointmentDoc = doc(db, "appointments", id);
    const snapshot = await getDoc(appointmentDoc);

    // Check if the appointment exists
    if (!snapshot.exists()) {
      return NextResponse.json(
        { message: "Appointment not found" },
        { status: 404 }
      );
    }

    // Fetch the appointment data
    const appointment = {
      id: snapshot.id, // Include the document ID
      ...snapshot.data(),
    };

    return NextResponse.json({ appointment }, { status: 200 });
  } catch (error) {
    console.error("Appointment fetch error:", error);
    return NextResponse.json(
      { message: "Failed to fetch Appointment details", error: error.message },
      { status: 500 }
    );
  }
}
