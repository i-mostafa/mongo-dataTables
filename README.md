# mongo-datatables

A module to handle communication between mongodb and datatable Ajax

[datatables](https://www.datatables.net/) and a REST API, node.js, express, MongoDB and Mongoose backed Servers, easier.

The main purpose is dealing with server side processing available in datatables, making it easy to integrate client and
server.

## Getting Started

Install the module.

```
npm install mongo-datatables
```

In your front-end, configure your DataTable to use serverSide processing and Ajax.

```javascript
// jQuery way
$("#example").DataTable({
  serverSide: true,
  ajax: {
    url: "/path/to/api/endpoint",
    type: "GET",
  },
});
```

In the route handler, import the module and pass a reference to the mongoose model you wish to use as data source.

The DataTables params will get caught in the request body. It should be passed to the run method, which will return a
promise.

```javascript
const mongoDataTables = require("mongo-datatables");
const dbModel = require("./path/to/model");

// express app configuration
app.get("/path/to/api/endpoint", (req, res, next) => {
  const query = req.query;
  mongoDataTables(dbModel)
    .get(query)
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json(err);
    });
});
```

## changing Error handler

you can change default error handler by :

```javascript
const mongoDataTables = require("mongo-datatables");
const dbModel = require('./path/to/model');

// express app configuration
app.get("/path/to/api/endpoint", (req, res, next) => {
  const query = req.query;
  const modelDataTablesHandler = mongoDataTables(dbModel);
  // set error handler
  modelDataTablesHandler.errorHandler = <YorErrorHandler>;
  modelDataTablesHandler
  .get(query)
  .then((result) => {
    res.json(result);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).json(err);
  });
});
```

## Using Without Datatables

One could use this module without datatables in the front-end making requests. For this to work, the GET query must
be a configuration object equivalent to the one shown below:

```javascript
// req.query should be equivalent to:
{
  "draw": "2",
  "columns": [
    {
      "data": "_id",
      "name": "",
      "searchable": "false",
      "orderable": "true",
      "search": { "value": "1", "regex": "false" },
    },
    {
      "data": "name",
      "name": "",
      "searchable": "true",
      "orderable": "true",
      "search": { "value": "1", "regex": "false" },
    }],
  "order": [{ "column": "0", "dir": "asc" }],
  "start": "0",
  "length": "10",
  "search": { "value": "", "regex": "false" },
};
```

## Contributing

Feel free to fork and mess with this code. But, before opening PRs, be sure that you adhere to the Code Style and Conventions
(run `grunt lint`) and add/correct as many tests as needed to ensure your code is working as expected.

## License

The MIT License (MIT)
