import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: 'Server authentication configuration is missing' },
        { status: 500 }
      );
    }

    // Call Supabase Admin auth endpoint to create user with pre-confirmed email (bypasses SMTP rate limits)
    const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName?.trim() || undefined,
        },
      }),
    });

    const data = await createRes.json();

    if (!createRes.ok) {
      if (
        data?.error_code === 'email_exists' ||
        data?.msg?.includes('already been registered')
      ) {
        return NextResponse.json(
          {
            error:
              'An account with this email is already registered. Please sign in with your password.',
            code: 'user_already_exists',
          },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: data?.msg || data?.error_description || 'Signup failed' },
        { status: createRes.status }
      );
    }

    return NextResponse.json({ success: true, user: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Unexpected signup error' },
      { status: 500 }
    );
  }
}
