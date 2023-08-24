/*
Full screen version of aws1:
Home btn
Check-in btn
Once check-in btn clicked:
1.send image data to backend to detect person
2.Pop up message based on result.
3.Record the checkin person video for 3s.
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
    
	startVideo();

	/*
	check in btn clicked function:
	make video opacity 0.5
	take the image from the video
	send ajax request to backend
	Based on result to pop up message and set opacity to ''.
	message remove in 3s
	*/
	$('#checkIn').click(function(event) {
		console.log('clicked')
		$('#video').css('filter', "opacity(.5)");
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
	        url: _config.api.invokeUrl + '/rekognition',
	        headers: {
                Authorization: authToken
            },
	        data: JSON.stringify({
						Time: time,
						Image: imgData
					}),
	        contentType: 'image/jpeg',
	        isBase64Encoded: false,
	        success: function(result){
	          console.log(result);
	          if (result['result'] != false) {
	          	name = result['name']
	          	$('#message').html(`Hi, ${name}. Successfully checked in!`).fadeIn(1500, function() {});
	          	$('#popup').toggle();
	          	setTimeout(() => {
	          		$('#message').html('');
	          		$('#popup').toggle();
	          	},3000);
	          } else{
	          	// no result append error message
	          	//$('#registrationForm').html("<div id='message'></div>");
	          	$('#message').html("Sorry! You are not authorized user of TechGym").fadeIn(1500, function() {});
	          	$('#popup').toggle();
	          	setTimeout(() => {
	          		$('#message').html('');
	          		$('#popup').toggle();
	          	},3000);
	          }
	          $('#video').css('filter', "");
	          // start record video
	          startRecording();

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

	async function startRecording() {
		recordedBlobs = [];
		// FIFO buffer with size 200
		//recordedBlobs = new CircularArray(100);
		let options = {mimeType: 'video/webm;codecs=vp9'};
		if (!MediaRecorder.isTypeSupported(options.mimeType)) {
		    console.error(`${options.mimeType} is not Supported`);
		    options = {mimeType: 'video/webm;codecs=vp8'};
		    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
			    console.error(`${options.mimeType} is not Supported`);
			    options = {mimeType: 'video/webm'};
			    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
			        console.error(`${options.mimeType} is not Supported`);
			        options = {mimeType: ''};
			    }
		    }
		}

		try {
		    mediaRecorder = new MediaRecorder(window.stream, options);
		} catch (e) {
		    console.error('Exception while creating MediaRecorder:', e);
		    return;
		}

		//console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
		mediaRecorder.onstop = (event) => {
			console.log('Recorder stopped: ', event);
		};
		mediaRecorder.ondataavailable = handleDataAvailable;
		mediaRecorder.start(100); // collect 10ms of data
		//console.log('MediaRecorder started', mediaRecorder);

		setTimeout(() => {
		    mediaRecorder.stop();
		    //console.log('check in: ', checkIn);
		    if (checkIn) {
		      downloadVideo(time, name);
		      //console.log('successfully download video.')
		    }
		}, 3000);
	}

	// download video locally
	async function downloadVideo(entryTime, name) {
	  //console.log('recordedBlobs: ', recordedBlobs);
	  //console.log('last 100 recordedBlobs: ', recordedBlobs.slice(Math.max(recordedBlobs.length-100, 1)));
	  const blob = new Blob(recordedBlobs, {type: 'video/mp4'});
	  // send blob to backend
	  var fd = new FormData();
	  fd.append('fname', `${entryTime}${name}.webm`);
	  fd.append('data', blob);
	  $.ajax({
	  	type: 'POST',
		url: _config.api.invokeUrl + '/video',
		headers: {
            Authorization: authToken
        },
		data: fd,
		processData: false,
		contentType: false,
        error: function(XMLHttpRequest, textStatus, errorThrown) {
        	console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
            console.error('Response: ', jqXHR.responseText);
        }
	  }).done(function(data) {
	
	  });
	  
	  
	  const url = window.URL.createObjectURL(blob);
	  const a = document.createElement('a');
	  a.style.display = 'none';
	  a.href = url;
	  a.download = `${entryTime}${name}.mp4`;
	  //console.log('entryTime: ', entryTime);
	  document.body.appendChild(a);
	  a.click();
	  setTimeout(() => {
	    document.body.removeChild(a);
	    window.URL.revokeObjectURL(url);
	  }, 100);
	  
	}

	function handleDataAvailable(event) {
	  if (event.data && event.data.size > 0) {
	    recordedBlobs.push(event.data);
	    /*
	    if(recordedBlobs.length > BUFFERSIZE) {
	      recordedBlobs.splice(1,1);
	    }
	    */
	  }
	}
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

