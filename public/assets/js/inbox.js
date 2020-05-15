function get_row(limit, offset) {
	$.get('/get_inbox?limit='+limit+'&offset='+offset, function(data) {
		$('#tbody_inbox').html("");
		for (const row of data.data){
			$('#tbody_inbox').append('<tr>\
				<td><small>'+row.chat_id+'</small></td>\
				<td><small>'+row.message+'</small></td>\
				<td><small>'+row.create_time+'</small></td>\
				<td style="min-width:150px;">\
					<a class="btn-success btn-sm" href=""><i class="fa fa-edit"></i></a>\
					<a class="btn-danger btn-sm" href=""><i class="fa fa-trash"></i></a>\
				</td>\
			</tr>');
		}
	});
}

$(document).ready(function() {
	var total = 0;
	var per_page = 10;
	
	// synchronouse get total inbox
	$.ajaxSetup({async:false});
	$.getJSON( "/get_total_inbox", function( data ) {
		total = data.data;
	});

	get_row(per_page, 0); // start row

    var page = $('#demo').pagination({
        items: total,
        itemsOnPage: per_page,
        cssStyle: 'light-theme',
        onPageClick:function(pageNumber, event){
        	console.log(pageNumber);
        	get_row(per_page, (per_page*pageNumber)-1)
        }
    });
});