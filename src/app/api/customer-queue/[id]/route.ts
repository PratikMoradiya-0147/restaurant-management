import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await pool.connect();

  const customerId = params.id;
  const { name, contact_no, address } = await req.json();

  if (!name || !contact_no || !address || !customerId) {
    return NextResponse.json(
      { error: "customerId, name, contact_no and address are required" },
      { status: 400 }
    );
  }

  try {
    console.log("customerId :>> ", customerId);
    const updatedResult = await client.query(
      "UPDATE customer_queue SET name=$1, contact_no=$2, address=$3 WHERE id=$4 RETURNING *",
      [name, contact_no, address, customerId]
    );
    console.log("updatedResult :>> ", updatedResult);
    client.release();

    if (updatedResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Customer updated successfully", data: updatedResult.rows[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error("error :>> ", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const customerId = params.id;
  if (!customerId) {
    return NextResponse.json({ message: "Id is required" }, { status: 400 });
  }
  const client = await pool.connect();

  try {
    const deletedResult = await pool.query(
      "DELETE FROM customer_queue WHERE id=$1 RETURNING *",
      [customerId]
    );

    client.release();

    if (deletedResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Customer deleted successfully", data: deletedResult.rows[0] },
      { status: 200 }
    );
  } catch (error) {
    client.release();
    console.error("Error :", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
