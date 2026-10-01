import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInvite extends Document {
  token: string;
  targetUser: string;
  isUsed: boolean;
  createdAt: Date;
}

const InviteSchema: Schema<IInvite> = new Schema(
  {
    token: { type: String, required: true, unique: true },
    targetUser: { type: String, required: true, default: 'Muhiddinxon' },
    isUsed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Invite: Model<IInvite> = mongoose.models.Invite || mongoose.model<IInvite>('Invite', InviteSchema);

export default Invite;
