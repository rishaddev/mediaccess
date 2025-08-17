import { addDoc, collection } from "firebase/firestore";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

export async function POST(req) {
  try {
    const data = await req.json();
    const { name = "", email = "", speciality = "", imageURL = "" } = data;

    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);

    const createdDate = istDate.toISOString().split("T")[0];
    const createdTime = istDate.toISOString().split("T")[1].split(".")[0];

    const inquiryData = {
      name,
      email,
      speciality,
      imageURL,
      createdDate,
      createdTime,
    };

    const docRef = await addDoc(collection(db, "doctors"), inquiryData);

    return NextResponse.json(
      {
        message: "New Doctor Created!",
        doctorId: docRef.id,
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
