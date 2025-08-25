import { addDoc, collection, doc, updateDoc, getDoc, arrayUnion } from "firebase/firestore";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

export async function POST(req) {
  try {
    const data = await req.json();
    const {
      guardianId = "",
      guardianName = "",
      name = "",
      relationship = "",
      dateOfBirth = "",
      gender = "",
      contactNumber = "",
    } = data;

    // Validate required fields
    if (!guardianId || !name || !relationship || !dateOfBirth) {
      return NextResponse.json(
        { message: "Missing required fields: guardianId, name, relationship, or dateOfBirth" },
        { status: 422 }
      );
    }

    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);
    const createdDate = istDate.toISOString().split("T")[0];
    const createdTime = istDate.toISOString().split("T")[1].split(".")[0];

    // Create new patient document for the dependent
    const dependentPatientData = {
      name,
      email: "", // Empty as per requirement
      password: "", // Empty as per requirement
      contactNumber,
      dob: dateOfBirth,
      gender,
      nicNo: "",
      address: "",
      bloodType: "",
      allergy: "",
      medications: "",
      emergencyContact: [],
      createdDate,
      createdTime,
      isDependent: true, // Flag to identify dependent patients
      guardianId, // Reference to guardian
    };

    // Add the new patient document
    const newPatientDocRef = await addDoc(collection(db, "patients"), dependentPatientData);
    const newPatientId = newPatientDocRef.id;

    // Get the guardian document to check if dependent array exists
    const guardianDocRef = doc(db, "patients", guardianId);
    const guardianDoc = await getDoc(guardianDocRef);

    if (!guardianDoc.exists()) {
      // If guardian doesn't exist, delete the newly created patient and return error
      await deleteDoc(newPatientDocRef);
      return NextResponse.json(
        { message: "Guardian patient not found" },
        { status: 404 }
      );
    }

    // Prepare dependent info to add to guardian's dependent array
    const dependentInfo = {
      id: newPatientId,
      name,
      relationship,
      dob: dateOfBirth
    };

    // Update guardian document with new dependent
    await updateDoc(guardianDocRef, {
      dependent: arrayUnion(dependentInfo)
    });

    return NextResponse.json(
      {
        message: "Dependent added successfully!",
        dependentPatientId: newPatientId,
        guardianId: guardianId,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error adding dependent:", error);
    return NextResponse.json(
      { message: "Something went wrong on the backend.", error: error.message },
      { status: 500 }
    );
  }
}