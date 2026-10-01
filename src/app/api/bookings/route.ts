import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Booking from '@/models/Booking';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const { date, time, location, customLocation, activity, message } = body;

    if (!date || !time || !location || !activity) {
      return NextResponse.json(
        { error: 'Date, time, location and activity are required' },
        { status: 400 }
      );
    }

    const booking = new Booking({
      date: new Date(date),
      time,
      location,
      customLocation,
      activity,
      message,
    });

    await booking.save();

    return NextResponse.json(
      { success: true, booking },
      { status: 201 }
    );
  } catch (error) {
    console.error('Booking Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const bookings = await Booking.find({}).sort({ date: 1 });
    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error) {
    console.error('Fetch Bookings Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
