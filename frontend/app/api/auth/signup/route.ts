import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import pool from '@/lib/db'; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // 1. Hash the password securely
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 2. Insert the new user into the database
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id, name, email`,
      [name, email, passwordHash]
    );

    const newUser = result.rows[0];

    // 3. Return the exact JSON structure the frontend expects
    return NextResponse.json({ 
        user: newUser,
        message: "User created successfully"
    }, { status: 201 });

  } catch (error: any) {
    // 4. Handle duplicate email error (code 23505 in Postgres)
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}