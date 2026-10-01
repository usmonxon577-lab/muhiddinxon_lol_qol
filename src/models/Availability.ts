import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAvailability extends Document {
  date: string;
  user: string;
  availableTimes: string[];
  mood?: string;
  vote?: string; // e.g. 'gaming' or 'coffee'
}

const AvailabilitySchema: Schema<IAvailability> = new Schema(
  {
    date: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: String,
      required: true,
      enum: ['Usmonxon', 'Muhiddinxon'],
    },
    availableTimes: {
      type: [String],
      default: [],
    },
    mood: {
      type: String,
      required: false,
    },
    vote: {
      type: String,
      required: false,
    }
  },
  {
    timestamps: true,
  }
);

AvailabilitySchema.index({ date: 1, user: 1 }, { unique: true });

const Availability: Model<IAvailability> = mongoose.models.Availability || mongoose.model<IAvailability>('Availability', AvailabilitySchema);

export default Availability;
