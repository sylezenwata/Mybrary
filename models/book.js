const { DataTypes } = require('sequelize');

const DB = require('../config/database');
const AuthorModel = require('./author');

const BookModel = DB.define(
  'book', 
  {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    publishDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    pageCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    coverImage: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // coverImagePath: {
    //   type: DataTypes.STRING,
    //   get() {
    //     return `data:${this.getDataValue('coverImageType')};base64,${this.getDataValue('coverImage').toString('base64')}`;
    //   },
    //   set(value) {
    //     throw new Error('Do not try to set the `coverImagePath` value!');
    //   }
    // },
  },
  {
    // underscored: true,
    timestamps: true,
  }
);

BookModel.belongsTo(AuthorModel);

BookModel.sync({ force: false })
  .then(() => {})
  .catch((error) => console.error(`Book model error: ${error}`));

module.exports = BookModel;