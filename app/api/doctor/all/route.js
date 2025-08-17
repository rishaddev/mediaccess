import {
  collection,
  getDocs,
} from "firebase/firestore";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

export async function GET(req) {
  try {
    const doctorsCollection = collection(db, "doctors");
    const snapshot = await getDocs(doctorsCollection);

    const allDoctors = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(
      { allDoctors },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching doctors:", error);

    return NextResponse.json(
      { message: "Something went wrong.", error: error.message },
      { status: 500 }
    );
  }
}
