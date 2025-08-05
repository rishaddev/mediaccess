import {
  collection,
  getDocs,
} from "firebase/firestore";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

export async function GET(req) {
  try {
    const patientsCollection = collection(db, "patients");
    const snapshot = await getDocs(patientsCollection);

    const allPatients = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(
      { allPatients },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching patients:", error);

    return NextResponse.json(
      { message: "Something went wrong.", error: error.message },
      { status: 500 }
    );
  }
}
