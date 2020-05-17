class PaginationClass {
	
	constructor(path_url='/get_process', path_url_total='/get_total_process', per_page=10, tbody_id='#tbody_inbox', element_pagination='#demo' ){
		this.path_url = path_url;
		this.path_url_total = path_url_total;
		this.tbody_id = tbody_id;
		this.element_pagination = element_pagination;
		this.per_page = per_page;
		this.column_row = [];
		this.column_id = '';
		this.func_edit = function(id){alert('This is default function. ID is : '+id)};
		this.func_delete = function(id){alert('This is default function. ID is : '+id)};
		this.func_print = function(id){alert('This is default function. ID is : '+id)};

	}

	build() {
		if (typeof jQuery == 'undefined') {
			alert('JQuery not loaded, please add JQuery library');
		} else {
			const classObj = this;
			$(document).ready(function() {
				classObj.buildPagination();
			});
		}
	}

	setEvent(func_edit, func_delete, func_print){
		this.func_edit = func_edit;
		this.func_delete = func_delete;
		this.func_print = func_print;
	}

	setCols(column_row, column_id){
		this.column_row = column_row;
		this.column_id = column_id;
	}

	createRow(limit, offset) {
		const classObj = this;
		$.get(classObj.path_url+'?limit='+limit+'&offset='+offset, function(data) {
			$(classObj.tbody_id).html("");
			for (const row of data.data){
				var str_col = "";
				for (const col of classObj.column_row){
					str_col += '<td><small>'+row[col]+'</small></td>'
				}

				var style_success = "";
				if(row['is_delivery'] == 1){
					style_success = 'background-color:#43d39e69;';
				}
				// change only row.[column] and function
				$(classObj.tbody_id).append('<tr style="'+style_success+'">\
					'+str_col+'\
					<td style="min-width:150px;">\
						<a action="print" data="'+row[classObj.column_id]+'" class="row-data btn-warning btn-sm" href="javascript:void(0)"><i class="fa fa-print"></i></a>\
						<a action="edit" data="'+row[classObj.column_id]+'" class="row-data btn-success btn-sm" href="javascript:void(0)"><i class="fa fa-paper-plane"></i></a>\
						<a action="remove" data="'+row[classObj.column_id]+'" class="row-data btn-danger btn-sm" href="javascript:void(0)"><i class="fa fa-trash"></i></a>\
					</td>\
				</tr>');
			}

			$(".row-data").click(function(event){
			        var data = $(event.currentTarget).attr('data');
			        var action = $(event.currentTarget).attr('action');
			        if(action == "edit"){
			        	classObj.func_edit(data);
			        }
			        if(action == "remove"){
			        	classObj.func_delete(data);
			        }
			        if(action == "print"){
			        	classObj.func_print(data);
			        }
			    }
			);
		});
	}

	buildPagination() {
		const classObj = this;
	    $.ajax({
	        type: "GET",
	        url: classObj.path_url_total,
	        async: true,
	        contentType: 'application/json',
	        dataType:'json',
	        success : function(data) {
	            const total = data.data;
	            classObj.createRow(classObj.per_page, 0);
			    $(classObj.element_pagination).pagination({
			        items: total,
			        itemsOnPage: classObj.per_page,
			        cssStyle: 'light-theme',
			        onPageClick:function(pageNumber, event){
			        	classObj.createRow(classObj.per_page, (classObj.per_page*pageNumber)-1)
			        }
			    });
	        }
	    });
	}
}

function paginator(){
	var paginate = new PaginationClass(
		'/get_process',       // response json [{data:[row]}], ex. http://127.0.0.1/controller/get_process?limit=[number]&offset=[number]
		'/get_total_process', // response json {data:number}, ex. http://127.0.0.1/controller/get_total_process
		10,                 // per pages view
		'#tbody_inbox',     // element tbody ID or table tbody
		'#div_pagination'   // element destination pagination button
	);
	paginate.setCols(
		['chat_id', 'order_message', 'quantity', 'recipient_name', 'courier', 'phone', 'address'], // column item row from table database
		'id'                                   // column id from table database
	);
	paginate.setEvent(
		// edit
		function(id){
			swal({
			  title: "Are you sure?",
			  text: "You have sent an order",
			  icon: "warning",
			  buttons: true,
			  dangerMode: true,
			})
			.then((willDelete) => {
			  if (willDelete) {
			  	$.get('/process_delivery?id='+id, function(response){
			  		if(response.status == 'success'){
					    swal("Data has been saved!", {
					      icon: "success",
					    });
					    paginator();
			  		} else {
					    swal("Failed to update data!", {
					      icon: "error",
					    });
			  		}
			  	});
			  }
			});
		},
		// delete
		function(id){
			swal({
			  title: "Are you sure?",
			  text: "You don't want to display this data?",
			  icon: "warning",
			  buttons: true,
			  dangerMode: true,
			})
			.then((willDelete) => {
			  if (willDelete) {
			  	$.get('/delete_process?id='+id, function(response){
			  		if(response.status == 'success'){
					    swal("Data has been deleted!", {
					      icon: "success",
					    });
					    paginator();
			  		} else {
					    swal("Failed to delete data!", {
					      icon: "error",
					    });
			  		}
			  	});
			  }
			});
		},
		// print
		function(id){
			$('#data-id').val(id);
			$('#modal-print').modal('show');
		}
	);

	paginate.build();
}

$(document).ready(function() {
	paginator();
	// $("#form-print").on("submit", function(){
	// 	var data_id = $('#data-id').val();
	// 	var store = $('#input-store').val();
	// 	var name = $('#input-name').val();
	// 	var phone = $('#input-phone').val();
	// 	var address = $('#input-address').val();
	// 	var data_json = {
	// 		id : data_id,
	// 		store : store,
	// 		order_time : order_time,
	// 		name : name,
	// 		phone : phone,
	// 		address : address,
	// 	};
 // 		$.ajax({
	//         url: "/print_order/?id="+data_id,
	//         type: "POST",
	//         contentType: 'application/json',
	//         dataType:'json',
	//         data: JSON.stringify(data_json),
	//         success: function (response) {
 //                swal({
 //                    title: "Success",
 //                    text: "Save data successfully",
 //                    icon: "success",
 //                    timer: 1000,
 //                    showCancelButton: false,
 //                    showConfirmButton: false,
 //                    buttons: false
 //                }).then(function()  {
 //                	$('#modal-process').modal('hide');
 //                	paginator();
 //                })
	//         },
	//         error: function(jqXHR, textStatus, errorThrown) {
	//            console.log(textStatus, errorThrown);
	//         }
 //    	});
	// 	return false;
	// })
});