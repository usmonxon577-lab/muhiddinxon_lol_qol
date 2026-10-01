import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Booking from '@/models/Booking';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    
    const allBookings = await Booking.find({});
    
    const meetingsCount = allBookings.length;
    const coffeesCount = allBookings.filter(b => b.activity === 'coffee').length;
    const gamingCount = allBookings.filter(b => b.activity === 'gaming').length;
    
    // Let's assume memories are count of bookings that have a message
    const memoriesCount = allBookings.filter(b => b.message && b.message.trim().length > 0).length;

    return NextResponse.json({
      meetings: meetingsCount,
      coffees: coffeesCount,
      gaming: gamingCount,
      memories: memoriesCount
    }, { status: 200 });

  } catch (error) {
    console.error('Stats Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
