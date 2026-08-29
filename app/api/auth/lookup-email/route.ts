import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawStudentId =
      body.studentId ||
      body.student_id ||
      body.registrationNumber ||
      body.regNo ||
      body.reg_no;

    if (!rawStudentId || typeof rawStudentId !== 'string' || !rawStudentId.trim()) {
      return NextResponse.json(
        { error: 'Registration number is required' },
        { status: 400 }
      );
    }

    const studentId = rawStudentId.trim();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('profiles')
      .select('email, recovery_email')
      .ilike('student_id', studentId)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: 'Database lookup failed' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Registration number not found' },
        { status: 404 }
      );
    }

    const email = data.recovery_email || data.email;
    if (!email) {
      return NextResponse.json(
        { error: 'No email associated with this registration number' },
        { status: 404 }
      );
    }

    // Return ONLY the email — strictly no other profile row fields
    return NextResponse.json({ email });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
