import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
// Using the relative path since it worked for your setup earlier
import pool from '../../../../lib/db'; 

export async function POST(request: Request) {
  try {
    // 1. Receive the data from the frontend UI
    const body = await request.json();
    const { name, email, password } = body;

    // 2. Basic validation to ensure no empty data reaches the database
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 3. Hash the password securely before saving it
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Insert the new user into the PostgreSQL database
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id, name, email`,
      [name, email, passwordHash]
    );

    const newUser = result.rows[0];

    // 5. Send a success response back to the frontend UI
    return NextResponse.json({ 
        user: newUser,
        message: "User created successfully"
    }, { status: 201 });

  } catch (error: any) {
    console.error("Database Error:", error);
    
    // 6. Catch PostgreSQL duplicate email error (Error Code 23505)
    if (error.code === '23505') {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}