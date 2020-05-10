const express = require('express')
const app = express()
const port = 3001
var bodyParser = require('body-parser')
var tools = require('./tools');
var messages = require('./message');
var proc = require('./controller_model');
const { Pool, Client } = require('pg')
var fs = require('fs'), ini = require('ini')

app.set('view engine', 'ejs')

var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'))

const db = new Pool({
  user: config.database.user,
  host: config.database.host,
  database: config.database.database,
  password: config.database.password,
  port: config.database.port,
})

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

// get health status
app.get('/', (req, res) => {
    res.json({"status":"ok", "description":"Webhook is active"})
})

// proses dari pesan yang telah masuk
app.post('/api/incoming-webhook', (req, res) => {	
	var check_order = messages.check_order(req.body.user, req.body.text, db)
	if(check_order.order_length == 7){
		res.send(check_order.data)
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

// parameter body {}
app.get('/get_inbox', (req, res) => {
	proc.get_inbox(db, req, res)
})

// parameter body {}
app.get('/get_process', (req, res) => {
	proc.get_process(db, req, res)
})

// parameter body {}
app.get('/get_delivery', (req, res) => {
	proc.get_delivery(db, req, res)
})

// parameter body { id : ? }
app.post('/delete_order', (req, res) => {
	proc.delete_order(db, req, res)
})

// parameter body { id : ? }
app.post('/process_order', (req, res) => {
	proc.process_order(db, req, res)
})

// parameter body { id : ? }
app.post('/delivery_order', (req, res) => {
	proc.delivery_order(db, req, res)
})

// parameter body { id : ? }
app.post('/done_order', (req, res) => {
	proc.done_order(db, req, res)
})

app.listen(config.app.port, () => console.log(`Service webhook running in port : ${port}`))