import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  content: string;
  author: Schema.Types.ObjectId;
  comments: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema: Schema<IArticle> = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
  },
  { timestamps: true }
);

const Article: Model<IArticle> = mongoose.model<IArticle>('Article', ArticleSchema);

export default Article;