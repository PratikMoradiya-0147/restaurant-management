import { comparePassword, generateToken } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function POST(req: NextRequest){
    const {username, password} = await req.json();
    try{
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];
        
        // compare passwords
        const isMatch = await comparePassword(password, user.password);
        console.log('isMatch :>> ', isMatch);
        console.log('password :>> ', password);
        console.log('user.password :>> ', user.password);
        if(!isMatch){
            return NextResponse.json({error: 'Invalid email or password'}, {status: 400});
        };

        const token = generateToken(user);
        return NextResponse.json({message: 'Login Successful', data: {token, user}}, {status: 200})

    }catch(error){
        console.error('Error logging in user:', error);
        return NextResponse.json({error: 'Server error'}, {status:500});
    }
}