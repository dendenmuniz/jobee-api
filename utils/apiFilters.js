class APIFilters {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    const queryCopy = { ...this.queryStr };

    //Removing fields (for sorting, fields, byQuery, limit/page)
    const removeFields = ["sort", "fields", "q", "limit", "page"];
    removeFields.forEach((el) => delete queryCopy[el]);

    //Advanced filters using: lt, lte, gt, gte, in
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      //default sorting
      this.query = this.query.sort("-postingDate");
    }
    return this;
  }

  limitFields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      //default - all fields except for automatic '-__v'
      this.query = this.query.select("-__v");
    }
    return this;
  }

  searchByQuery() {
    if (this.queryStr.q) {
      const qu = this.queryStr.q.split("-").join(" ");
      this.query = this.query.find({ $text: { $search: '"' + qu + '"' } });
    }
    return this;
  }

  pagination() {
    const page = parseInt(this.queryStr.page, 10) || 1; //default pages = 1
    const limit = parseInt(this.queryStr.limit, 10) || 10; //default limit = 10 per page
    const skipResults = (page - 1) * limit;

    this.query = this.query.skip(skipResults).limit(limit);

    return this;
  }
}

module.exports = APIFilters;
