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
};