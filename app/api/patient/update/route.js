import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function PUT(req) {
  try {

    const body = await req.json();
    const { id, createdDate, createdTime, ...updatedDetails } = body;

    if (!id) {
      return NextResponse.json(
        { message: "No patient ID provided." },
        { status: 400 }
      );
    }

    const patientDoc = doc(db, "patients", id);

    const snapshot = await getDoc(patientDoc);
    if (!snapshot.exists()) {
      return NextResponse.json(
        { message: "Patient not found." },
        { status: 404 }
      );
    }

    await updateDoc(patientDoc, updatedDetails);

    return NextResponse.json(
      { message: "Details updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating patient:", error);
    return NextResponse.json(
      { message: "Something went wrong.", error: error.message },
      { status: 500 }
    );
  }
}
