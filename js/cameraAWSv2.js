var techGym = window.TechGym || {};


let authToken;

$(document).ready(function() {
  run()
});

async function run() {
	// code from ride.js
    techGym.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        } else {
            window.location.href = '/signin.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = '/signin.html';
    });

    // load the models
    const MODEL_URL = 'weights';

    // SSD mobile net
    //await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
    // tiny face detector
    await faceapi.loadTinyFaceDetectorModel(MODEL_URL);
    startVideo();
}

async function startVideo() {
  // try to access users webcam and stream the images
  // to the video element
  const stream = await navigator.mediaDevices.getUserMedia({ video: {}, audio:{} });
  window.stream = stream;
  const videoEl = $('#video').get(0);
  //console.log('hello')
  videoEl.srcObject = stream;
};

async function onPlay() {
  // run face detection & recognition
  if(video.paused || video.ended){
    return setTimeout(() => onPlay());
  }

  updateResults();

};

async function updateResults() {
	//const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.8 });
	// configure tiny face detectir
	const options1 = new faceapi.TinyFaceDetectorOptions({ inputSize: 128});
	const options2 = new faceapi.TinyFaceDetectorOptions({ inputSize: 320});

	const videoEl = $('#video').get(0);

	// all faces detection
	const results = await faceapi.detectAllFaces(videoEl, options2);

	console.log(results);
	if(results.length != 0) {
		//console.log('result');
		const imgData = drawImage();

		$.ajax({
			method:'POST',
	        url: _config.api.invokeUrl + '/multiface',
	        headers: {
                Authorization: authToken
            },
	        data: JSON.stringify({
						Time: Date.now(),
						Image: imgData
					}),
	        contentType: 'image/jpeg',
	        isBase64Encoded: false,
	        success: function(result){
	          console.log(result);
	          const $checkInMessage = $("<div id='message'></div>")
	          $('#camerali').append($checkInMessage);
	          
	          const number = result['detect_face_num']
	          const recNumber = result['recognized_face_num']
	          $('#message').html(`<h2>Total number of faces detected is ${number}. Recognized face number is ${recNumber}!</h2>`);
	          const listFace = result['recognized_faces']
	          //console.log(listFace.length);
	          if (listFace.length != 0) {
	          	const listFaceItem = $('#message h2').append('<ul></ul>').find('ul');
	          	//console.log('face item: ', listFaceItem);
	          	for(var i = 0; i < listFace.length; i++)
	          		listFaceItem.append(`<li>${listFace[i]}</li>`)
	          }
	          setTimeout(() => {
	          	$('#message').remove()
	          	updateResults();
	          }, 3000);

	        },
	        error: function(XMLHttpRequest, textStatus, errorThrown) {
	        	console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
	        }
		});
	} else {
		setTimeout(() => updateResults());
	}
};


function drawImage() {
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
	return imgData;		
};

