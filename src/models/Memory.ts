import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMemory extends Document {
  bookingId: mongoose.Types.ObjectId;
  date: Date;
  location: string;
  activity: string;
  notes: string;
  photos: string[]; // array of URLs/paths
  createdAt: Date;
}

const MemorySchema: Schema<IMemory> = new Schema(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    activity: { type: String, required: true },
    notes: { type: String, required: false, default: '' },
    photos: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

const Memory: Model<IMemory> = mongoose.models.Memory || mongoose.model<IMemory>('Memory', MemorySchema);

export default Memory;
