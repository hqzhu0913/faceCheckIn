/*
User registration Form:
Employee Id 
autofill first Name and last name
Three images taken
*/


var techGym = window.TechGym || {};

let imgData1;
let imgData2;
let imgData3;
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

    /*
    employee ID btn clicked function:
    remove error message
    set ajax to backend to check id
    show rest of form if valid id
    else show error message
    */
    $('#employeeIDbtn').click(function(event) {
    	/* Act on the event */
    	// remove error message
    	$('.error_message').remove();
    	// send ajax request to validate employee id
    	$.ajax({
			method:'POST',
	        url: _config.api.invokeUrl + '/register',
	        headers: {
                Authorization: authToken
            },
	        data: JSON.stringify({
	        	Id: $('#employeeId').val()
	        }),
	        contentType: 'application/json',
	        success: function(data){
	          console.log(data);
	          /*
	          exist states:
			    "1": active user not registered.
			    "2": active user already registered
			    "3": non-active user
			  */
	          /*
	          if id is valid
	          autofill first name and last name
	          show rest of register form
	          show id reset button if wrong id input
	          */
	          if (data['result']==1) {
	          	const fn = data['first_name']
	          	const ln = data['last_name']
	          	$('#employeeFirstName').val(fn);
	          	$('#employeeLastName').val(ln);
	          	$('.not_show').toggle();
				$('#employeeIDbtndiv').toggle();
				$('#employeeIDbtn').toggle();
	          } else if (data['result']==2) {
	          	$('.smalltable tr td').append('<div class="error_message"><p>Sorry, you are already registered. Please go to <a href="/signin.html">sign in</a>.</p></div>');
	          	$('#employeeId').val("");
	          } else if (data['result']==3) {
	          	$('.smalltable tr td').append('<div class="error_message"><p>Sorry, you are not allowed to use TechGym.</p></div>');
	          	$('#employeeId').val("");
	          }
	        },
	        error: function(XMLHttpRequest, textStatus, errorThrown) {
	        	console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
	        }
		});
    });

    /*
    employee ID reset button clicked function:
    hide rest of the form
    reset employee id value
    show employee id btn div
    */
    $('#employeeIDrst').click(function(event) {
    	/* Act on the event */
    	$('.not_show').toggle();
    	$('#employeeId').val('');
		$('#employeeIDbtndiv').toggle();
		$('#employeeIDbtn').toggle();
    });

    $('#startCamera').click(function(){
		startVideo();
		$('#photo-wrapper').toggle();
    });

    /*
    start camera and video
    */
    async function startVideo() {
	  // try to access users webcam and stream the images
	  // to the video element
	  const stream = await navigator.mediaDevices.getUserMedia({ video: {}, audio:{} });
	  window.stream = stream;
	  const videoEl = $('#video').get(0);
	  //console.log('hello')
	  videoEl.srcObject = stream;
	};

	/*
	front photo btn click:
	take image and show in the canvas1
	*/
	$('#frontPhoto').click(function(event) {
		/* Act on the event */
		const video = $('#video').get(0);
		const canvas = $('#canvas1').get(0);
		const width = $('#video').width();
		const height = $('#video').height();
	
		const context = canvas.getContext('2d');

		// create image data from video
		if (width != undefined) {
			canvas.width = width;
		    canvas.height = height;
		    context.drawImage(video, 0, 0, width, height);
		    
		    imgData1 = canvas.toDataURL('image/jpeg');
		}
	});

	/*
	left photo btn click:
	take image and show in the canvas2
	*/
	$('#leftPhoto').click(function(event) {
		/* Act on the event */
		const video = $('#video').get(0);
		const canvas = $('#canvas2').get(0);
		const width = $('#video').width();
		const height = $('#video').height();
	
		const context = canvas.getContext('2d');

		// create image data from video
		if (width != undefined) {
			canvas.width = width;
		    canvas.height = height;
		    context.drawImage(video, 0, 0, width, height);
		    
		    imgData2 = canvas.toDataURL('image/jpeg');
		}
	});

	/*
	right photo btn click:
	take image and show in the canvas3
	*/
	$('#rightPhoto').click(function(event) {
		/* Act on the event */
		const video = $('#video').get(0);
		const canvas = $('#canvas3').get(0);
		const width = $('#video').width();
		const height = $('#video').height();
	
		const context = canvas.getContext('2d');

		// create image data from video
		if (width != undefined) {
			canvas.width = width;
		    canvas.height = height;
		    context.drawImage(video, 0, 0, width, height);
		    
		    imgData3 = canvas.toDataURL('image/jpeg');
		}

		$('#form-submit-row').toggle();
		
	});

	$('#submit').click(function(event) {
		/* Act on the event */
		//console.log($('#firstName').val());
		$.ajax({
			method:'POST',
	        url: _config.api.invokeUrl + '/upload3',
	        headers: {
                Authorization: authToken
            },
	        data: JSON.stringify({
	        	Name: $('#employeeFirstName').val() + ' ' + $('#employeeLastName').val(),
	        	Id: $('#employeeId').val(),
	        	image1: imgData1,
	        	image2: imgData2,
	        	image3: imgData3
	        }),
	        contentType: 'image/jpeg',
	        isBase64Encoded: false,
	        success: function(data){
	          console.log(data);
	          $('#registrationForm').html("<div id='message'></div>");
	          $('#message').html("<h2>Registration Form Submitted!</h2>").fadeIn(1500, function() {});
	          setTimeout(() => window.location.href = 'userregister2.html',2000);
	        },
	        error: function(XMLHttpRequest, textStatus, errorThrown) {
	        	console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
	        }
		});

	});
});

/*
onPlay function:
recheck if video is paused or ended
*/
async function onPlay() {
  // run face detection & recognition
  if(video.paused || video.ended){
    return setTimeout(() => onPlay());
  }
};
