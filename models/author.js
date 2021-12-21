const { DataTypes } = require('sequelize');

const DB = require('../config/database');
const BookModel = require('./book');

const AuthorModel = DB.define(
  'author', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

AuthorModel.sync({ force: false })
  .then(() => {})
  .catch((error) => console.error(`Author model error: ${error}`));

module.exports = AuthorModel;