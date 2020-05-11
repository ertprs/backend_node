module.exports = {
	// simpan pesan masuk
	get_inbox: function (db, req, res) {
		db.query(
			'SELECT id, chat_id, message, create_order, is_process, is_delivery, is_done FROM wa_order WHERE is_process = $1 AND is_delete <> $2 ORDER BY create_order DESC',
			[0,1],
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
};