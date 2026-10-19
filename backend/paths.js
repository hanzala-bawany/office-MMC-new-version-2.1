const path = require("path");

// exe ke andar ho to exe wala folder, warna backend folder
const baseDir = process.pkg ? path.dirname(process.execPath) : __dirname;

module.exports = { baseDir };