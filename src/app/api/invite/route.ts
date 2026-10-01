import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectToDatabase from '@/lib/mongodb';
import Invite from '@/models/Invite';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await connectToDatabase();
    const token = crypto.randomBytes(16).toString('hex');
    const invite = new Invite({ token, targetUser: 'Muhiddinxon' });
    await invite.save();
    return NextResponse.json({ url: `/invite/${token}`, token }, { status: 201 });
  } catch (error) {
    console.error('Invite Creation Error:', error);
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 });
  }
}
