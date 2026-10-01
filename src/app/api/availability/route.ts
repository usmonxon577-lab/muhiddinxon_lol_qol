import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Availability from '@/models/Availability';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    await connectToDatabase();
    const records = await Availability.find({ date });

    const usmonxon = records.find(r => r.user === 'Usmonxon');
    const muhiddinxon = records.find(r => r.user === 'Muhiddinxon');

    const data = {
      Usmonxon: {
        times: usmonxon?.availableTimes || [],
        mood: usmonxon?.mood || null,
        vote: usmonxon?.vote || null
      },
      Muhiddinxon: {
        times: muhiddinxon?.availableTimes || [],
        mood: muhiddinxon?.mood || null,
        vote: muhiddinxon?.vote || null
      },
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('GET Availability Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const { date, user, times, mood, vote } = body;

    if (!date || !user || !Array.isArray(times)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    if (!['Usmonxon', 'Muhiddinxon'].includes(user)) {
      return NextResponse.json({ error: 'Invalid user profile' }, { status: 400 });
    }

    await Availability.findOneAndUpdate(
      { date, user },
      { date, user, availableTimes: times, mood, vote },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('POST Availability Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
