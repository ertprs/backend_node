function get_info(){
	var id = getCookie('id');
    $.ajax({
        url: '/api/info',
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ 
            id : id
        }),
        success: function(data) {
        	console.log(data);
        	$('.label-user').text(data.data.first_name+' '+data.data.last_name);
        }
    });
}

$(document).ready(function() {
	get_info();
});