const { Schema, model } = require("mongoose")

const GenreSchema = new Schema(
  {
    name: {
      type: String,
      required: [true],
      minLength: 3,
      maxLength: 100,
    }
  },
  {
    virtuals: {
      url: {
        get() {
          return `/catalog/genre/${this._id}`
        }
      }
    }
  }
)

module.exports = model("Genre", GenreSchema)