import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: NextRequest) {
  const client = await pool.connect();

  const { name, contact_no, address } = await req.json();

  try {
    const name_contactExist = await pool.query(
        "SELECT * FROM customer_queue WHERE name=$1 OR contact_no=$2",
        [name, contact_no]
    );
    client.release();


    if(name_contactExist.rows.length !== 0){
        return NextResponse.json(
            {message: 'Name or Contact no already exist'},
            {status: 400}
        );
    }

    const result = await pool.query(
      "INSERT INTO customer_queue (name, contact_no, address) VALUES ($1, $2, $3) RETURNING *",
      [name, contact_no, address]
    );

    client.release();

    return NextResponse.json(
      { message: "Customer added in queue successfully", data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("error:", error);
    NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const client = pool.connect();

  try {
    const result = await pool.query("SELECT * FROM customer_queue");
    (await client).release();
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Customers not exists" },
        { status: 200 }
      );
    }
    return NextResponse.json(
      { message: "Customers fetched successfully", data: result.rows },
      { status: 200 }
    );
  } catch (error) {
    console.error("error :", error);
    return NextResponse.json(
      { message: "Error in retrieving customers", error },
      { status: 500 }
    );
  }
}
