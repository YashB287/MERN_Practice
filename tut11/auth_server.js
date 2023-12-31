const path = require('path');
const { logger }  = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const express = require('express');
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');
const credentials = require('./middleware/credentials');



const app = express()
const PORT = process.env.PORT || 3500;

app.use(logger);

/*
    Handle options credentials check - before CORS!
    and fetch cookies credentials requirement
*/
app.use(credentials);

app.use(cors(corsOptions));
app.use(express.urlencoded({extended : false}));
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

app.use('/', express.static(path.join(__dirname, '/public')));

app.use('/', require('./routes/root'));
app.use('/register', require('./routes/register'));
app.use('/auth', require('./routes/auth'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));

// all things below this will only use verifyJWT
app.use(verifyJWT);
app.use('/employees', require('./routes/api/employees'));

app.all('*', (req, res) => {
    res.status(404);
    if(req.accepts('html')){
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    }else if(req.accepts('json')){
        res.json({error : "404 Not Found"});
    }else{
        res.type('txt').send("404 Not Found");
    }
});

app.use(errorHandler); 

app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 
