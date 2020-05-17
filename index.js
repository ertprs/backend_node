const express = require('express')
const app = express()
const port = 3001
var bodyParser = require('body-parser')
var tools = require('./tools');
var messages = require('./message');
var proc = require('./controller_model');
const { Pool, Client } = require('pg')
var fs = require('fs'), ini = require('ini')
var path = require('path');
var jwt = require('jwt-simple');
const { base64encode, base64decode } = require('nodejs-base64');
var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'))
const Cookies = require('js-cookie');
const Footer_text = '@2020 | Whatsapp for sales.'
const pgp = require('pg-promise')()

// connection using Pool
const db = new Pool({
  user: config.database.user,
  host: config.database.host,
  database: config.database.database,
  password: config.database.password,
  port: config.database.port,
})

// connection using PG-Promise
const cn = {
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password,
    max: 30 // use up to 30 connections
};

const db2 = pgp(cn);

// add library to autoload and distributed to all controllers & models
var autoload = {
	jwt : jwt,
	base64decode : base64decode,
	base64encode : base64encode,
	config : config,
	db : db,
	db2 : db2,
}
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', [
    express.static(__dirname + '/node_modules/jquery/dist/'),
    express.static(__dirname + '/node_modules/cookieconsent/build/'),
    express.static(__dirname + '/node_modules/sweetalert/dist/'),
]);

db.query('SELECT version()', (err, res) => {
  console.log(`Database version : ${res.rows[0].version}`)
})

console.log(`

██████╗  █████╗  ██████╗██╗  ██╗███████╗███╗   ██╗██████╗ 
██╔══██╗██╔══██╗██╔════╝██║ ██╔╝██╔════╝████╗  ██║██╔══██╗
██████╔╝███████║██║     █████╔╝ █████╗  ██╔██╗ ██║██║  ██║
██╔══██╗██╔══██║██║     ██╔═██╗ ██╔══╝  ██║╚██╗██║██║  ██║
██████╔╝██║  ██║╚██████╗██║  ██╗███████╗██║ ╚████║██████╔╝
╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═════╝ 
Webhook for whatsapp bot.
`)

//allowing requests from outside of the domain 
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type,Accept");
  next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// web view
app.get('/', (req, res) => {
	res.render('login', { 
		title: 'Login | Whatsapp for sales', 
		js_include: [
			'/assets/cookieconsent.min.js',
			'/assets/sweetalert.min.js',
			'/assets/js/custom.js',
			'/assets/js/login.js',
		]
	})
})

app.get('/dashboard', (req, res) => {
	res.render('dashboard', { 
		title: 'Dashboard | Whatsapp for sales', 
		footer_text : Footer_text,
		js_include: [
			'/assets/cookieconsent.min.js',
			'/assets/sweetalert.min.js',
			'/assets/js/custom.js',
			'/assets/js/dashboard.js',
		]
	})
})

app.get('/inbox', (req, res) => {
	res.render('inbox', { 
		title: 'Inbox  | Whatsapp for sales', 
		footer_text : Footer_text,
		js_include: [
			'/assets/cookieconsent.min.js',
			'/assets/sweetalert.min.js',
			'/assets/js/custom.js',
			'/assets/js/inbox.js',
			'/assets/js/simplePagination.js',
		]
	})
})


app.get('/process', (req, res) => {
	res.render('process', { 
		title: 'Process  | Whatsapp for sales', 
		footer_text : Footer_text,
		js_include: [
			'/assets/cookieconsent.min.js',
			'/assets/sweetalert.min.js',
			'/assets/js/custom.js',
			'/assets/js/process.js',
			'/assets/js/simplePagination.js',
		]
	})
})

app.post('/print_order', (req, res) => {
	res.render('print_order', { 
		title: 'Print Order  | Whatsapp for sales', 
		footer_text : Footer_text,
		css_include : [
			'/assets/css/bootstrap.min.css',
		],
		js_include: [
			'/assets/jquery.min.js',
			'/assets/js/bootstrap.min.js',
			'/assets/js/print_order.js',
		]
	})
})

app.get('/logout', (req, res) => {
	res.render('logout', {})
})

// proses dari pesan yang telah masuk
app.post('/api/incoming-webhook', (req, res) => {	
	var save_inbox = messages.save_inbox(req.body.user, req.body.text, db)
	if(save_inbox.total_inbox == 7){
		res.send(save_inbox.data)
	}
	if(req.body.text == '#info'){
		res.send(messages.info(req.body.user, req.body.text))
	}
	if(req.body.text == '#help'){
		res.send(messages.request_format(req.body.user, req.body.text))
	}
	if(req.body.text == '#status'){
		res.send(messages.status(req.body.user, req.body.text))
	}
	if(req.body.text == '#catalog'){
		res.send(messages.catalog(req.body.user, req.body.text))
	}
	if(req.body.text == '#branch'){
		res.send(messages.branch(req.body.user, req.body.text))
	}
	res.send({status:"failed", description:"request not found"})
})

// api v1 restFul
app.post('/api/auth', function(req, res) {
    proc.auth_login(req, res, autoload)
});
app.post('/api/info', function(req, res) {
    proc.get_info(req, res, autoload)
});

/* bagian INBOX APIs interface */
// parameter body {}
app.get('/get_inbox', (req, res) => {
	proc.get_inbox(db, req, res)
})

// get total all message
app.get('/get_total_inbox', (req, res) => {
	proc.get_total_inbox(db, req, res)
});

// get detail message & parsing
app.get('/get_detail_inbox', (req, res) => {
	proc.get_detail_inbox(db, req, res, tools)
});

// save message
app.post('/update_inbox', (req, res) => {
	proc.update_inbox(db, req, res, db2)
});

// delete message
app.get('/delete_inbox', (req, res) => {
	proc.delete_inbox(req, res, autoload)
});


/* bagian PROCESS ORDER APIs interface */
// parameter body {}
app.get('/get_process', (req, res) => {
	proc.get_process(req, res, autoload)
})

// get total all process
app.get('/get_total_process', (req, res) => {
	proc.get_total_process(req, res, autoload)
});

// delete process
app.get('/delete_process', (req, res) => {
	proc.delete_process(req, res, autoload)
});

// flag delivery process
app.get('/process_delivery', (req, res) => {
	proc.process_delivery(req, res, autoload)
});

// get detail process
app.get('/get_detail_process', (req, res) => {
	proc.get_detail_process(req, res, autoload)
});

app.listen(config.app.port, () => console.log(`Service webhook running in port : ${port}`))