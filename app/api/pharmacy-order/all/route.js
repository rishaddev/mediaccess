import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    const pharmacyordersCollection = collection(db, "pharmacyorders");
    let pharmacyordersQuery;

    // If patientId is provided, filter pharmacyorders for that patient
    if (patientId) {
      pharmacyordersQuery = query(
        pharmacyordersCollection,
        where("patientId", "==", patientId)
      );
    } else {
      // If no patientId, get all pharmacyorders
      pharmacyordersQuery = pharmacyordersCollection;
    }

    // Execute the query
    const snapshot = await getDocs(pharmacyordersQuery);

    // Check if any pharmacyorders exist
    if (snapshot.empty) {
      const message = patientId 
        ? `No pharmacy orders found for patient ID: ${patientId}` 
        : "No pharmacy orders found";
      
      return NextResponse.json(
        { message, pharmacyorders: [] },
        { status: 200 }
      );
    }

    // Map through the documents and extract pharmacyorder data
    const pharmacyorders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const message = patientId 
      ? `Found ${pharmacyorders.length} pharmacy order(s) for patient ID: ${patientId}`
      : `Found ${pharmacyorders.length} total pharmacy order(s)`;

    return NextResponse.json({ 
      pharmacyorders, 
      count: pharmacyorders.length,
      message 
    }, { status: 200 });

  } catch (error) {
    console.error("Home visit fetch error:", error);
    return NextResponse.json(
      { 
        message: "Failed to fetch pharmacy orders", 
        error: error.message,
        pharmacyorders: [] 
      },
      { status: 500 }
    );
  }
}