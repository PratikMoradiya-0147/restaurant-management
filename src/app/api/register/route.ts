import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { hashPassword } from "@/utils/auth";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: NextRequest) {
  const client = await pool.connect();

  const { username, email, password, role } = await req.json();

  const hashedPassword = await hashPassword(password);

  try {
    const result = await pool.query(
      "INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
      [username, email, hashedPassword, role]
    );

    client.release();

    return NextResponse.json(
      { message: "User created suucessfully", data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.log("error: ", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const client = await pool.connect();
  try {
    const users = await pool.query("SELECT * FROM users");

    client.release();

    return NextResponse.json(
      { message: "Users fetched successfully", data: users.rows },
      { status: 200 }
    );
  } catch (error) {
    console.error("error:", error);
    return NextResponse.json(
      { message: "Error in retrieving user", error },
      { status: 500 }
    );
  }
}
