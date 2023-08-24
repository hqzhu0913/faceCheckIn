var techGym = window.TechGym || {};

let imgData;
let authToken;

$(document).ready(function($) {
	// code from ride.js
    techGym.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        } else {
            window.location.href = './signin.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = './signin.html';
    });

	$('#submit').click(function(event) {
		date = $('#date').val()
		date = date.replace(/-/g, '')
		$.ajax({
			method:'POST',
	        url: _config.api.invokeUrl + '/video-query',
	        headers: {
                Authorization: authToken
            },
	        data: JSON.stringify({
	        	date: date
	        }),
	        contentType: 'application/json',
	        isBase64Encoded: false,
	        success: function(data){
	          records = data['records'];
	          $('#database').html("<div class='divspaced'><table class='smalltable'><thead>\
	          	<th>Employee Name</th>\
	          	<th>Employee ID</th>\
	          	<th>Checkin Time</th>\
	          	<th>Video Link</th>\
	          	</thead></table></div>")
	          for(i = 0; i < records.length; i++){
	          	$('table').append('<tr>\
	          		<td>' + records[i]['employee_name'] +'</td>\
	          		<td>' + records[i]['techID'] +'</td>\
	          		<td>' + records[i]['recordinsertdts'] +'</td>\
	          		<td><p class="clickable">' +records[i]['s3_key'] +'</p></td>\
	          		</tr>');
	          }
	        },
	        error: function(XMLHttpRequest, textStatus, errorThrown) {
	        	console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
	        }
		});
		return false;
	});

	$("#database").on("click",'p.clickable', function(event) {
		
		link = 'https://s3.amazonaws.com/techgym-rekognition-checkin-rui/' + $(this).text();
		console.log($(this).text())
		console.log('asdf')
		$.ajax({
			method:'POST',
	        url: _config.api.invokeUrl + '/video-presignedurl',
	        headers: {
                Authorization: authToken
            },
	        data: JSON.stringify({
	        	s3key: $(this).text()
	        }),
	        contentType: 'application/json',
	        isBase64Encoded: false,
	        success: function(data){
	          
				console.log(data)
				link = data['presigned_url']
			  	$('#video').html('<video autoplay muted controls>\
			  	<source src=' + link + ' type="video/mp4">\
		    	Your browser not support.</video>');
	        },
	        error: function(XMLHttpRequest, textStatus, errorThrown) {
	        	console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
	        }
		});
		return false;
	});

		//$('#video').html('<video autoplay muted controls>\
		//	<source src=' + link + ' type="video/mp4">\
		//	Your browser not support.</video>');
		
	
});

