import { addDoc, collection } from "firebase/firestore";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

export async function POST(req) {
  try {
    const data = await req.json();
    const {
      patientId = "",
      patientName = "",
      contactNumber = "",
      services = [],
      visitDate = "",
      visitTime = "",
      address = "",
      city = "",
      postalCode = "",
      plusCode = "",
      cost = "",
      status = "Pending",
      instructions = "",
    } = data;

    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);

    const createdDate = istDate.toISOString().split("T")[0];
    const createdTime = istDate.toISOString().split("T")[1].split(".")[0];

    const homeVisitData = {
      patientId,
      patientName,
      contactNumber,
      services,
      visitDate,
      visitTime,
      address,
      city,
      postalCode,
      plusCode,
      cost,
      status,
      instructions,
      createdDate,
      createdTime,
    };

    const docRef = await addDoc(collection(db, "homevisits"), homeVisitData);

    return NextResponse.json(
      {
        message: "Home Visit Scheduled!",
        referenceId: docRef.id,
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
