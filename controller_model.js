module.exports = {
	get_inbox: function (db, req, res) {
		var limit = 0
		var offset = 0
		
		if(!isNaN(Number(req.query.limit))) {
			limit = req.query.limit
		}
		if(!isNaN(Number(req.query.offset))) {
			offset = req.query.offset
		}

		db.query(
			'SELECT id, chat_id, message, create_time, is_delete, is_process FROM whatsapp_inbox WHERE is_delete <> $1 ORDER BY create_time DESC LIMIT $2 OFFSET $3',
			[1, limit, offset],
			(error, results) => {
			    if (error) {
					//console.log(error)
					res.json({"status":"failed", "desc": error})
			    } else {
					res.json({"status":"ok", "data": results.rows})
				}
			}
		)
	},
	get_total_inbox: function(db, req, res) {
		db.query(
			'SELECT count(*) as total FROM whatsapp_inbox WHERE is_delete <> $1',
			[1],
			(error, results) => {
			    if (error) {
					//console.log(error)
					res.json({"status":"failed", "desc": error})
			    } else {
			    	if(results.rows.length > 0){
			    		res.json({"status":"ok", "data": Number(results.rows[0].total)})
			    	} else {
			    		res.json({"status":"ok", "data": 0})
			    	}
					
				}
			}
		)
	},
	get_detail_inbox: function(db, req, res, tools) {
		var id = req.query.id
		db.query(
			'SELECT id, chat_id, message, create_time, is_delete FROM whatsapp_inbox WHERE id = $1',
			[id],
			(error, results) => {
			    if (error) {
					console.log(error.stack)
					res.json({"status":"failed", "desc": error})
			    } else {
			    	if(results.rows.length > 0){
			    		res.json({"status":"ok", "data": { rows : results.rows, parse : tools.parse_message(results.rows[0].message)}})
			    	} else {
			    		res.json({"status":"ok", "data": 0})
			    	}
					
				}
			}
		)
	},
	update_inbox: function(db, req, res, db2){
		var id = req.body.id
		var chat_id = req.body.chat_id
		var order_time = req.body.order_time
		var date_time = req.body.date_time
		var order_message = req.body.order_message
		var quantity = req.body.quantity
		var recipient_name = req.body.recipient_name
		var courier = req.body.courier
		var phone = req.body.phone
		var address = req.body.address

		db2.tx(async t => {
			await t.none("UPDATE whatsapp_inbox SET is_process = '1' WHERE id = $1", id);
			await t.none("INSERT INTO process_order (chat_id, order_message, quantity, recipient_name, courier, phone, address, inbox_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)", [chat_id, order_message, quantity, recipient_name,courier, phone, address, id]);
		}).then(() => {
			res.json({"status":"success","description": "Data has just been updated and saved."})
    	}).catch(error => {
        	res.json({"status":"failed","description": "Data failed to save"})
    	});
	},
	auth_login: function(req, res, autoload){
		var username = req.body.username
		var password = req.body.password
		var remember = req.body.remember
		var status = 1 // is active
		autoload.db.query(
			'SELECT id, username, email, first_name, last_name, counter, status FROM app_user WHERE username=$1 AND password=$2 AND status = $3',
			[username, password, status ],
			(error, results) => {
			    if (error) {
					res.json({"status":"failed", "data":"", "description": "Query error, please contact developer to email fajarrdp@gmail.com"})
			    } else {
			    	if (results.rows.length > 0){
			    		var user = results.rows[0]
			    		var token = autoload.jwt.encode(user, autoload.config.app.secret_jwt)
			    		res.json({"status":"sucess", "data": autoload.base64encode(token)})
			    	} else {
						res.json({"status":"failed", "data":"", "description": "Login failed, please try again."})
					}
				}
			}
		)
	},
	get_info: function(req, res, autoload){
		try {
			var id = req.body.id
			var token_jwt = autoload.base64decode(id)
			var result_jwt = autoload.jwt.decode(token_jwt, autoload.config.app.secret_jwt)
			res.json({"status":"ok", "data":result_jwt})
		} catch(err){
			res.json({"status":"failed", "data":err.message})
		}
	},
	delete_inbox : function(req, res, autoload){
		var id = req.query.id
		autoload.db.query(
			"UPDATE whatsapp_inbox SET is_delete = '1' WHERE id = $1",
			[id],
			(error, results) => {
			    if (error) {
					console.log(error.stack)
					res.json({"status":"failed", "description": "Delete data not successfully"})
			    } else {
			    	res.json({"status":"success", "description": "Delete data successfully"})
				}
			}
		)
	},
	get_process: function(req, res, autoload){
		var limit = 0
		var offset = 0
		
		if(!isNaN(Number(req.query.limit))) {
			limit = req.query.limit
		}
		if(!isNaN(Number(req.query.offset))) {
			offset = req.query.offset
		}

		autoload.db.query(
			'SELECT id, chat_id, order_message, quantity, recipient_name, courier, phone, address, is_delete, is_delivery, inbox_id FROM process_order WHERE is_delete <> $1 ORDER BY create_time DESC LIMIT $2 OFFSET $3',
			[1, limit, offset],
			(error, results) => {
			    if (error) {
					//console.log(error)
					res.json({"status":"failed", "desc": error})
			    } else {
					res.json({"status":"ok", "data": results.rows})
				}
			}
		)
	},
	get_total_process: function(req, res, autoload) {
		autoload.db.query(
			'SELECT count(*) as total FROM process_order WHERE is_delete <> $1',
			[1],
			(error, results) => {
			    if (error) {
					//console.log(error)
					res.json({"status":"failed", "desc": error})
			    } else {
			    	if(results.rows.length > 0){
			    		res.json({"status":"ok", "data": Number(results.rows[0].total)})
			    	} else {
			    		res.json({"status":"ok", "data": 0})
			    	}
					
				}
			}
		)
	},
	delete_process : function(req, res, autoload){
		var id = req.query.id
		autoload.db.query(
			"UPDATE process_order SET is_delete = '1' WHERE id = $1",
			[id],
			(error, results) => {
			    if (error) {
					console.log(error.stack)
					res.json({"status":"failed", "description": "Delete data not successfully"})
			    } else {
			    	res.json({"status":"success", "description": "Delete data successfully"})
				}
			}
		)
	},
	process_delivery : function(req, res, autoload){
		var id = req.query.id
		autoload.db.query(
			"UPDATE process_order SET is_delivery = '1' WHERE id = $1",
			[id],
			(error, results) => {
			    if (error) {
					console.log(error.stack)
					res.json({"status":"failed", "description": "Update data not successfully"})
			    } else {
			    	res.json({"status":"success", "description": "Update data successfully"})
				}
			}
		)
	},
	get_detail_process: function(req, res, autoload) {
		var id = req.query.id
		autoload.db.query(
			'SELECT id, chat_id, order_message, quantity, recipient_name, courier, phone, address, is_delete, is_delivery, inbox_id FROM process_order WHERE id = $1',
			[id],
			(error, results) => {
			    if (error) {
					console.log(error.stack)
					res.json({"status":"failed", "desc": error})
			    } else {
			    	if(results.rows.length > 0){
			    		res.json({"status":"ok", "data": results.rows[0] })
			    	} else {
			    		res.json({"status":"ok", "data": []})
			    	}
					
				}
			}
		)
	},
};