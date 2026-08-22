import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import pool from '../../../../lib/db'; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. Check if data exists
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    // 2. Fetch the user from the database
    const result = await pool.query(
      `SELECT id, name, email, password_hash FROM users WHERE email = $1`,
      [email]
    );

    // 3. If no user is found with that email
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = result.rows[0];

    // 4. Compare the typed password with the hashed password in the database
    const passwordsMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordsMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 5. Remove the password hash before sending the user data back to the UI
    const { password_hash, ...safeUser } = user;

    return NextResponse.json({ 
        user: safeUser,
        message: "Login successful"
    }, { status: 200 });

  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}