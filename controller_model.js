module.exports = {
	// simpan pesan masuk
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
			'SELECT id, chat_id, message, create_time, is_delete FROM whatsapp_inbox WHERE is_delete <> $1 ORDER BY create_time DESC LIMIT $2 OFFSET $3',
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
	auth_login: function(req, res, load_module){
		var username = req.body.username
		var password = req.body.password
		var remember = req.body.remember
		var status = 1 // is active
		load_module.db.query(
			'SELECT id, username, email, first_name, last_name, counter, status FROM app_user WHERE username=$1 AND password=$2 AND status = $3',
			[username, password, status ],
			(error, results) => {
			    if (error) {
					res.json({"status":"failed", "data":"", "description": "Query error, please contact developer to email fajarrdp@gmail.com"})
			    } else {
			    	if (results.rows.length > 0){
			    		var user = results.rows[0]
			    		var token = load_module.jwt.encode(user, load_module.config.app.secret_jwt)
			    		res.json({"status":"sucess", "data": load_module.base64encode(token)})
			    	} else {
						res.json({"status":"failed", "data":"", "description": "Login failed, please try again."})
					}
				}
			}
		)
	},
	get_info: function(req, res, load_module){
		try {
			var id = req.body.id
			var token_jwt = load_module.base64decode(id)
			var result_jwt = load_module.jwt.decode(token_jwt, load_module.config.app.secret_jwt)
			res.json({"status":"ok", "data":result_jwt})
		} catch(err){
			res.json({"status":"failed", "data":err.message})
		}
	}
};