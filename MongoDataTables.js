const queryValidationSchema = require("./queryValidation.model");
/**
 *  check if str is convertable to number
 * @param  {String} str
 *
 */
const isNumeric = (str) => str !== "" && !isNaN(str);

module.exports = class {
  constructor(dbModel) {
    this.dbModel = dbModel;
    this.ErrorHandler = Error;
  }
  /** get mongo records with this query
   * @param  {Object} query
   */
  async get(query) {
    query = this.validate(query);
    this._init(query);
    this.analyzeQuery(query);

    await this.run(query);

    return {
      draw: this.draw,
      recordsTotal: this.recordsTotal,
      recordsFiltered: this.recordsFiltered,
      data: this.data,
    };
  }
  /** initialize class feilds
   * @param  {Object} query
   */
  _init(query) {
    this.draw = query.draw;
    this.start = query.start;
    this.length = query.length;

    this.order = query.order;
    this.search = query.search;
    this.columns = query.columns;

    this.recordsTotal = 0;
    this.recordsFiltered = [];
    this.data = [];
    this.error = null;

    this.selectParams = "";
    this.searchableFeilds = [];
    this.orderableFeilds = [];
    this.$orArrayOfNumberFields = [];
    this.$orArrayOfNonNumberFields = [];
  }
  /**
   * validate query to dataTabls query
   * @param  {Object} query
   */
  validate(query) {
    const result = queryValidationSchema.validate(query);
    if (result.error)
      throw new this.ErrorHandler(result.error.details[0].message);
    return result.value;
  }
  /**analyze query to get filter data from it
   * @param  {Object} query
   */
  analyzeQuery(query) {
    query.columns.forEach((column) => {
      this.selectParams += column.data + " ";
      if (column.searchable) this.searchableFeilds.push(column.data);
      if (column.orderable) this.orderableFeilds.push(column.data);
    });
    this.calculateSortKey();
    this.calcOrArrayFields();
  }

  async run(query) {
    const searchElement = query.search.value;
    let searchQuery = {};
    if (isNumeric(searchElement)) {
      searchQuery = {
        $or: this.$orArrayOfNumberFields,
      };
    } else if (searchElement !== "") {
      searchQuery = {
        $or: this.$orArrayOfNonNumberFields,
      };
    }

    this.recordsTotal = await this.dbModel.count();
    const filterQueries = this.getFilterQueries(searchQuery);

    const [filteredRecords, limitedRecords] = await Promise.all(filterQueries);

    this.recordsFiltered = filteredRecords;
    this.data = limitedRecords;
  }

  getFilterQueries(searchQuery) {
    return [
      this.dbModel
        .find(searchQuery)
        .select(this.selectParams)
        .sort(this.sortParam)
        .count(),
      this.dbModel
        .find(searchQuery)
        .select(this.selectParams)
        .sort(this.sortParam)
        .skip(this.start)
        .limit(this.length),
    ];
  }

  calculateSortKey() {
    const sortObj = this.order[0];
    const sortColumn = this.columns[sortObj.column];
    if (!sortColumn.orderable) return null;
    this.sortParam = (sortObj.dir === "desc" ? "-" : "") + sortColumn.data;
  }

  /**
   * calculate numberedArray and non numbered array fields
   */
  calcOrArrayFields() {
    const tree = this.dbModel?.schema?.tree;
    if (!tree) throw new this.ErrorHandler("bad dbModle schema");
    this.resolveTree(tree);
  }

  /** resolve tree to get data type
   * @param  {Object} tree
   * @param  {String} parentKey=null
   */
  resolveTree(tree, parentKey = null) {
    Object.keys(tree).forEach((key) => {
      const type = tree[key].type?.name?.toLowerCase() || typeof tree;

      const searchObj = {};

      if (type === "number") {
        searchObj[parentKey ? `${parentKey}.${key}` : key] = this.search.value;
        this.$orArrayOfNumberFields.push(searchObj);
        return;
      }

      if (type === "string") {
        searchObj[parentKey ? `${parentKey}.${key}` : key] = new RegExp(
          this.search.value,
          "i"
        );
        this.$orArrayOfNonNumberFields.push(searchObj);
        return;
      }

      if (!tree[key].type && typeof tree === "object") {
        const subTree = tree[key];
        if (Array.isArray(tree)) return this.resolveTree(subTree, parentKey);
        this.resolveTree(subTree, key);
      }
    });
  }
};
