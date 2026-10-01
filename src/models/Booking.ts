import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBooking extends Document {
  date: Date;
  time: string;
  location: string;
  customLocation?: string;
  activity: string;
  message?: string;
  usmonxonArrived?: boolean;
  muhiddinxonArrived?: boolean;
  createdAt: Date;
}

const BookingSchema: Schema<IBooking> = new Schema(
  {
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    customLocation: { type: String, required: false },
    activity: { type: String, required: true },
    message: { type: String, required: false },
    usmonxonArrived: { type: Boolean, default: false },
    muhiddinxonArrived: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
