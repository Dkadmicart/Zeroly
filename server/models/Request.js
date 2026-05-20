// server/models/Request.js
import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Item",
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Accepted", "Declined", "Completed"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const Request = mongoose.model("Request", requestSchema);

export default Request;
