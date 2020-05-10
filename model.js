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
	get_process: function (db, req, res) {
		db.query(
			'SELECT id, chat_id, message, create_order, is_process, is_delivery, is_done FROM wa_order WHERE is_process = $1 AND is_delivery <> $2 AND is_delete <> $3 ORDER BY create_order DESC',
			[1,1,1],
			(error, results) => {
			    if (error) {
					res.json({"status":"failed"})
					
			    } else {
					res.json({"status":"ok", "data": results.rows})
				}
			}
		)
	},
	get_delivery: function (db, req, res) {
		db.query(
			'SELECT id, chat_id, message, create_order, is_process, is_delivery, is_done FROM wa_order WHERE is_process = $1 AND is_delivery = $2 AND is_delete <> $3 AND is_done <> $4 ORDER BY create_order DESC',
			[1,1,1,1],
			(error, results) => {
			    if (error) {
					res.json({"status":"failed"})
					
			    } else {
					res.json({"status":"ok", "data": results.rows})
				}
			}
		)
	},
	delete_order: function (db, req, res) {
		db.query(
			'UPDATE wa_order SET is_delete = $1 WHERE id = $2',
			[1, req.body.id],
			(error, results) => {
			    if (error) {
					res.json({"status":"failed"})
					
			    } else {
					res.json({"status":"ok"})
				}
			}
		)
	},
	process_order: function (db, req, res) {
		db.query(
			'UPDATE wa_order SET is_process = $1 WHERE id = $2',
			[1, req.body.id],
			(error, results) => {
			    if (error) {
					res.json({"status":"failed"})
					
			    } else {
					res.json({"status":"ok"})
				}
			}
		)
	},
	delivery_order: function (db, req, res) {
		db.query(
			'UPDATE wa_order SET is_delivery = $1 WHERE id = $2',
			[1, req.body.id],
			(error, results) => {
			    if (error) {
					res.json({"status":"failed"})
					
			    } else {
					res.json({"status":"ok"})
				}
			}
		)
	},
	done_order: function (db, req, res) {
		db.query(
			'UPDATE wa_order SET is_done = $1 WHERE id = $2',
			[1, req.body.id],
			(error, results) => {
			    if (error) {
					res.json({"status":"failed"})
					
			    } else {
					res.json({"status":"ok"})
				}
			}
		)
	}

};