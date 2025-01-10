import mongoose, {Document, Schema} from "mongoose";

interface ITopic extends Document {
    title: string
    content: string
    username: string
    createdAt: Date
}

const TopicSchema: Schema = new Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    username: {type: String, required: true},
    createdAt: {type: Date, default: Date.now}
})

const Topic: mongoose.Model<ITopic> = mongoose.model<ITopic>("Topic", TopicSchema)

export {Topic, ITopic}