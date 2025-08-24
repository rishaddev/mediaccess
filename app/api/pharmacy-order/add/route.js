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
      address = "",
      notes = "",
      prescriptionImageData = "",
      orderDate = "",
      status = "",
      orderItems = [],
      price = "",
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
      address,
      notes,
      prescriptionImageData,
      orderDate,
      status,
      orderItems,
      price,
      createdDate,
      createdTime,
    };

    const docRef = await addDoc(collection(db, "pharmacyorders"), homeVisitData);

    return NextResponse.json(
      {
        message: "Order Placed Successfully!",
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
