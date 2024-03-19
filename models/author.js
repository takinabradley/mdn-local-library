const { Schema, model } = require("mongoose")

const AuthorSchema = new Schema(
  {
    first_name: { type: String, required: true, maxLength: 100 },
    family_name: { type: String, required: true, maxLength: 100 },
    date_of_birth: { type: Date },
    date_of_death: { type: Date }
  },
  {
    virtuals: {
      name: {
        get() {
          if (this.first_name && this.family_name) {
            return `${this.family_name}, ${this.first_name}`
          } else {
            return ''
          }
        }
      },
      url: {
        get() {
          return `/catalog/author/${this._id}`
        }
      },
      date_of_birth_formatted: {
        get() {
          return this.date_of_birth ? this.date_of_birth.toLocaleDateString('en-US') : ''
        }
      },
      date_of_death_formatted: {
        get() {
          return this.date_of_death ? this.date_of_death.toLocaleDateString('en-US') : ''
        }
      }
    }
  }
)

AuthorSchema.virtual("date_of_birth_yyyy_mm_dd").get(function () {
  return this.date_of_birth ? this.date_of_birth.toISOString().split('T')[0] : ''
});

AuthorSchema.virtual("date_of_death_yyyy_mm_dd").get(function () {
  return this.date_of_death ? this.date_of_death.toISOString().split('T')[0] : ''
});

module.exports = model("Author", AuthorSchema)

