const mongoDataTables = require("./MongoDataTables");
module.exports = (dbModel) => new mongoDataTables(dbModel);
