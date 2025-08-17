import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { hashPassword } from "@/lib/auth";

export async function POST(req) {
  try {
    const data = await req.json();
    const {
      name,
      email,
      password,
      contactNumber,
      dob = "",
      gender = "",
      nicNo = "",
      address = "",
      bloodType = "",
      allergy = "",
      medications = "",
      emergencyContact = [],
    } = data;

    // if (!name || !dob || !gender || !contactNumber) {
    //   return NextResponse.json({ message: "Invalid input." }, { status: 422 });
    // }

    const patientRef = collection(db, "patients");
    const q = query(patientRef, where("email", "==", email));

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return NextResponse.json(
        { message: "User exists already!" },
        { status: 422 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);

    const createdDate = istDate.toISOString().split("T")[0];

    const createdTime = istDate.toISOString().split("T")[1].split(".")[0];

    const patientData = {
      name,
      email,
      password: hashedPassword,
      contactNumber,
      dob,
      gender,
      nicNo,
      address,
      bloodType,
      allergy,
      medications,
      emergencyContact,
      createdDate,
      createdTime,
    };

    const docRef = await addDoc(collection(db, "patients"), patientData);

    return NextResponse.json(
      {
        message: "Patient created!",
        patientId: docRef.id,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong Backend.", error: error.message },
      { status: 500 }
    );
  }
}
