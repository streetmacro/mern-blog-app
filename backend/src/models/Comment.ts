import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment extends Document {
  text: string;
  article: Schema.Types.ObjectId;
  author: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema<IComment> = new Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    article: {
      type: Schema.Types.ObjectId,
      ref: 'Article',
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Comment: Model<IComment> = mongoose.model<IComment>('Comment', CommentSchema);

export default Comment;