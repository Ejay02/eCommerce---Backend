const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true,
      unique: true
    },
    category: {
      type: String,
      required: true,
      unique: true
    },
    numViews: {
      type: Number,
      default: 0
    },
    liked: {
      type: Boolean,
      default: false
    },
    disliked: {
      type: Boolean,
      default: false
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    image: {
      type: String,
      default:
        'https://imgs.search.brave.com/_ojXyrebOSaqV-ypN5w2ueBtCWHWR1msHvHHn1MMiFk/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/cHJlbWl1bS1waG90/by93b3JkLWJsb2ct/d29vZGVuLWN1YmVz/LWJlYXV0aWZ1bC1v/cmFuZ2UtYmFja2dy/b3VuZC1idXNpbmVz/cy1jb25jZXB0LWNv/cHktc3BhY2VfMzg0/MDE3LTUzNTYuanBn/P3NpemU9NjI2JmV4/dD1qcGc'
    },
    author: {
      type: String,
      default: 'Admin'
    }
  },
  {
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    },
    timestamps: true
  }
);

//Export the model
module.exports = mongoose.model('Blog', blogSchema);
