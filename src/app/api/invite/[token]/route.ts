import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Invite from '@/models/Invite';

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    await connectToDatabase();
    
    const invite = await Invite.findOne({ token, isUsed: false });
    
    if (!invite) {
      return NextResponse.json({ valid: false, error: 'Invalid or expired invite' }, { status: 404 });
    }
    
    return NextResponse.json({ valid: true, targetUser: invite.targetUser }, { status: 200 });
  } catch (error) {
    console.error('Invite Fetch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    await connectToDatabase();
    
    const invite = await Invite.findOneAndUpdate({ token }, { isUsed: true }, { new: true });
    
    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Invite Update Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
