import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    const appointmentsCollection = collection(db, "appointments");
    let appointmentsQuery;

    // If patientId is provided, filter appointments for that patient
    if (patientId) {
      appointmentsQuery = query(
        appointmentsCollection,
        where("patientId", "==", patientId)
      );
    } else {
      // If no patientId, get all appointments
      appointmentsQuery = appointmentsCollection;
    }

    // Execute the query
    const snapshot = await getDocs(appointmentsQuery);

    // Check if any appointments exist
    if (snapshot.empty) {
      const message = patientId 
        ? `No appointments found for patient ID: ${patientId}` 
        : "No appointments found";
      
      return NextResponse.json(
        { message, appointments: [] },
        { status: 200 }
      );
    }

    // Map through the documents and extract appointment data
    const appointments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const message = patientId 
      ? `Found ${appointments.length} appointment(s) for patient ID: ${patientId}`
      : `Found ${appointments.length} total appointment(s)`;

    return NextResponse.json({ 
      appointments, 
      count: appointments.length,
      message 
    }, { status: 200 });

  } catch (error) {
    console.error("Appointments fetch error:", error);
    return NextResponse.json(
      { 
        message: "Failed to fetch appointments", 
        error: error.message,
        appointments: [] 
      },
      { status: 500 }
    );
  }
}