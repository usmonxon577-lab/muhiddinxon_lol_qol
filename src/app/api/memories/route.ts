import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import connectToDatabase from '@/lib/mongodb';
import Memory from '@/models/Memory';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const bookingId = formData.get('bookingId') as string;
    const location = formData.get('location') as string;
    const activity = formData.get('activity') as string;
    const notes = formData.get('notes') as string;
    const date = formData.get('date') as string;

    const files = formData.getAll('photos') as File[];
    const photoUrls: string[] = [];

    // Save files locally
    for (const file of files) {
      if (file && file.name) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const path = join(process.cwd(), 'public/uploads', filename);
        
        await writeFile(path, buffer);
        photoUrls.push(`/uploads/${filename}`);
      }
    }

    await connectToDatabase();
    
    const memory = new Memory({
      bookingId,
      date: new Date(date),
      location,
      activity,
      notes,
      photos: photoUrls,
    });

    await memory.save();

    return NextResponse.json({ success: true, memory }, { status: 201 });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    // sort newest first
    const memories = await Memory.find({}).sort({ date: -1 }).populate('bookingId');
    return NextResponse.json({ memories }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch memories' }, { status: 500 });
  }
}
