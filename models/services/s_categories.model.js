const mongoose = require('mongoose');
const uniqueValidator = require("mongoose-unique-validator");

const s_categoriesSchema = mongoose.Schema(
  {
    id: { type: String, required: true, unique: true},
    category: { type: String, required: true },
    icon: { type: String, required: true},
    tasks:{ type: [{
      id: String,
      task: String,
    }], required: true}
  },
  { collection: 'ServiceCategories' }
);

s_categoriesSchema.plugin(uniqueValidator);

module.exports = mongoose.model('ServiceCategories', s_categoriesSchema);
