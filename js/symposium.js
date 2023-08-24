/*
Full screen version of aws1:

*/

var techGym = window.TechGym || {};

let authToken;
let time;
let name;

// video variable
let mediaRecorder;
let recordedBlobs;

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
    // start video after application loads
	startVideo();

	/*
	Start Function:

	*/
	$('#start').click(function(event) {
		console.log('clicked');
		//console.log(authToken);
		const canvas = document.createElement("canvas");

		const video = $('#video').get(0);
		const width = $('#video').width();
		const height = $('#video').height();

		const context = canvas.getContext('2d');

		let imgData;
		// create image data from video
		if (width != undefined) {
			canvas.width = width;
		    canvas.height = height;
		    context.drawImage(video, 0, 0, width, height);
		    
		    imgData = canvas.toDataURL('image/jpeg');
		} 
		time = Date.now();
		// send image data to backend
		$.ajax({
			method:'POST',
	        url: _config.api.invokeUrl + '/symposium2019',
	        headers: {
                Authorization: authToken
            },
	        data: JSON.stringify({
                        command: 'recognizeProduct',
                        payload: {
                            Time: time,
                            Image: imgData
                        }	
					}),
	        contentType: 'image/jpeg',
	        isBase64Encoded: false,
	        success: function(result){
                // remove all play video
                $('.productVideo').remove();
                console.log(result);
                console.log(typeof(result));
                tag = result['message'];
                if (tag == 'apple') {
                    $('#videoCol').append("<video controls autoplay class='productVideo'><source src='apple.mp4' type='video/mp4'>Your Browser doesn't support video</video>");
                } else if (tag == 'banana') {
                    $('#videoCol').append("<video controls autoplay class='productVideo'><source src='banana.mp4' type='video/mp4'>Your Browser doesn't support video</video>")
                } 
	        },
	        error: function(XMLHttpRequest, textStatus, errorThrown) {
	        	console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
	        }
		});
		
    });
    
    $('#startEndpoint').click(function(event){
        $.ajax({
			method:'POST',
	        url: _config.api.invokeUrl + '/symposium2019',
	        headers: {
                Authorization: authToken
            },
	        data: JSON.stringify({
                        command: 'startEndpoint',
                        payload: ""	
					}),
            contentType: "application/json; charset=utf-8",
	        isBase64Encoded: false,
	        success: function(result){
                console.log('Start endpoint successfully');
	        },
	        error: function(XMLHttpRequest, textStatus, errorThrown) {
	        	console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
	        }
		});
    });

    $('#checkEndpoint').click(function(event){
        $.ajax({
			method:'POST',
	        url: _config.api.invokeUrl + '/symposium2019',
	        headers: {
                Authorization: authToken
            },
	        data: JSON.stringify({
                        command: 'checkEndpointStatus',
                        payload: ""	
					}),
            contentType: "application/json; charset=utf-8",
	        isBase64Encoded: false,
	        success: function(result){
                console.log(result);
	        },
	        error: function(XMLHttpRequest, textStatus, errorThrown) {
	        	console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
	        }
		});
    });

    $('#deleteEndpoint').click(function(event){
        $.ajax({
			method:'POST',
	        url: _config.api.invokeUrl + '/symposium2019',
	        headers: {
                Authorization: authToken
            },
	        data: JSON.stringify({
                        command: 'deleteEndpoint',
                        payload: ""	
					}),
            contentType: "application/json; charset=utf-8",
	        isBase64Encoded: false,
	        success: function(result){
                console.log('delete endpoint successfully');
	        },
	        error: function(XMLHttpRequest, textStatus, errorThrown) {
	        	console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
	        }
		});
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

