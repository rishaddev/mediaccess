import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    const homevisitsCollection = collection(db, "homevisits");
    let homevisitsQuery;

    // If patientId is provided, filter homevisits for that patient
    if (patientId) {
      homevisitsQuery = query(
        homevisitsCollection,
        where("patientId", "==", patientId)
      );
    } else {
      // If no patientId, get all homevisits
      homevisitsQuery = homevisitsCollection;
    }

    // Execute the query
    const snapshot = await getDocs(homevisitsQuery);

    // Check if any homevisits exist
    if (snapshot.empty) {
      const message = patientId 
        ? `No home visits found for patient ID: ${patientId}` 
        : "No home visits found";
      
      return NextResponse.json(
        { message, homevisits: [] },
        { status: 200 }
      );
    }

    // Map through the documents and extract homevisit data
    const homevisits = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const message = patientId 
      ? `Found ${homevisits.length} home visit(s) for patient ID: ${patientId}`
      : `Found ${homevisits.length} total home visit(s)`;

    return NextResponse.json({ 
      homevisits, 
      count: homevisits.length,
      message 
    }, { status: 200 });

  } catch (error) {
    console.error("Home visit fetch error:", error);
    return NextResponse.json(
      { 
        message: "Failed to fetch home visits", 
        error: error.message,
        homevisits: [] 
      },
      { status: 500 }
    );
  }
}