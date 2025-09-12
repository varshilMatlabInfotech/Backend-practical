import mongoose from "mongoose";
import { toJSON } from "./plugins";
import { required, string } from "joi";

const requestSchema = mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accepted: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
// add plugin that converts mongoose to json
// requestSchema.plugin(toJSON);
// /**
//  * @typedef Token
//  */
const Request = mongoose.model("Request", requestSchema);
module.exports = Request;
