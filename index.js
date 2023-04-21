const express = require("express");
var path = require('path');
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const {join} = require('path');
const morgan = require("morgan");
const cors = require("cors");
const swaggerUI = require("swagger-ui-express");
const docs = require('./src/docs');
const todoRouter = require('./src/routes/todos');
const indexRouter = require('./src/routes/index');


const adapter = new FileSync(join(__dirname,'..','db.json'));
const db = low(adapter);
db.defaults({ todos:[] }).write();    
const app = express();
const PORT = process.env.PORT || 4000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// app configs.
app.db = db;
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(morgan("dev"));
app.use(cors());
app.use('/',indexRouter);
app.use('/todos',todoRouter);
app.use('/api-docs',swaggerUI.serve,swaggerUI.setup(docs));

//initialize the app.
async function initialize(){    
    app.listen(PORT);
};

initialize()
    .finally(
        () => console.log(`app started on port:${PORT}`)
    );