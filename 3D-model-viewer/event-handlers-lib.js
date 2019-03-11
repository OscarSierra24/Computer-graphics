function buttonToggleDrawingMode(event){
	if(renderMode === "LINES"){
		renderMode = "TRIANGLES"
		document.getElementById("btn-toggle-drawing-mode").innerText = "TO WIREFRAME"
	}else{
		renderMode = "LINES"
		document.getElementById("btn-toggle-drawing-mode").innerText = "TO SOLID"
	}
}
function adjustCamera(data)
{
	let xmin = 0
	let xmax = 0
	let ymin = 1
	let ymax = 1
	let zmin = 2
	let zmax = 2 

	for(let i = 0; i < data.vertices.length; i+=3){
		// console.log("x: " + data.vertices[i] + " y: " + data.vertices[i+1] + "z: " + data.vertices[i+2]);
		if(data.vertices[i] < data.vertices[xmin]){
			xmin = i
		} else if(data.vertices[i] === data.vertices[xmin]){
			if(data.vertices[i+2] > data.vertices[xmin+2]){
				xmin = i
			}
		} else if(data.vertices[i] > data.vertices[xmax]){
			xmax = i
		} else if(data.vertices[i] == data.vertices[xmax]){
			if(data.vertices[i+2] > data.vertices[xmax+2]){
				xmax = i
			}
		}

		if(data.vertices[i+1] < data.vertices[ymin]){
			ymin = i+1
		} else if(data.vertices[i+1] === data.vertices[ymin]){
			if(data.vertices[i+2] > data.vertices[ymin+2]){
				ymin = i+1
			}
		}
		else if(data.vertices[i+1] > data.vertices[ymax]){
			ymax = i+1
		} else if(data.vertices[i+1] === data.vertices[ymax]){
			if(data.vertices[i+2] > data.vertices[ymax+2]){
				ymax = i+1
			}
		}
		
		if(data.vertices[i+2] < data.vertices[zmin]){
			zmin = i+2
		}else if(data.vertices[i+2] > data.vertices[zmax]){
			zmax = i+2
		}
	}

	console.log("xmin: " + xmin);
	console.log("xmax: " + xmax);
	console.log("ymin: " + ymin);
	console.log("ymax: " + ymax);
	console.log("zmin: " + zmin);
	console.log("zmax: " + zmax);

	xcenter = (data.vertices[xmin] + data.vertices[xmax]) / 2
	ycenter = (data.vertices[ymin] + data.vertices[ymax]) / 2
	zcenter = (data.vertices[zmin] + data.vertices[zmax]) / 2

	let xRequiredDistance = ((Math.abs(data.vertices[xmin]) + Math.abs(data.vertices[xmax])) * 28.3 / 32.1406 + (Math.abs(data.vertices[xmin]) + Math.abs(data.vertices[xmax])) * 2 / 32.1406); 
	let yRequiredDistance = ((Math.abs(data.vertices[ymin]) + Math.abs(data.vertices[ymax])) * 28.3 / 32.1406 + (Math.abs(data.vertices[ymin]) + Math.abs(data.vertices[ymax])) * 2 / 32.1406);
	let zRequiredDistance = ((Math.abs(data.vertices[zmin]) + Math.abs(data.vertices[zmax])) * 28.3 / 32.1406 + (Math.abs(data.vertices[zmin]) + Math.abs(data.vertices[zmax])) * 2 / 32.1406);
	
	//XY COMPARISON
	if (xRequiredDistance >= yRequiredDistance){
		eyeAtZ = xRequiredDistance;
		zStartingPoint = data.vertices[xmin+2] > data.vertices[xmax+2] ? data.vertices[xmin+2] : data.vertices[xmax+2];
	} else{
		eyeAtZ = yRequiredDistance;
		zStartingPoint = data.vertices[ymin+2] > data.vertices[ymax+2] ? data.vertices[ymin+2] : data.vertices[ymax+2];
	}  

	//XZ COMPARISON
	if (xRequiredDistance >= zRequiredDistance){
		eyeAtY = xRequiredDistance;
		yStartingPoint = data.vertices[xmin+1] > data.vertices[xmax+1] ? data.vertices[xmin+1] : data.vertices[xmax+1];
	} else{
		eyeAtY = yRequiredDistance;
		yStartingPoint = data.vertices[zmin+1] > data.vertices[zmax+1] ? data.vertices[zmin+1] : data.vertices[zmax+1];
	}

	//YZ COMPARISON
	if (yRequiredDistance >= zRequiredDistance){
		eyeAtX = yRequiredDistance;
		xStartingPoint = data.vertices[xmin] > data.vertices[xmax] ? data.vertices[xmin] : data.vertices[xmax];
	} else{
		eyeAtX = zRequiredDistance;
		xStartingPoint = data.vertices[zmin] > data.vertices[zmax] ? data.vertices[zmin] : data.vertices[zmax];
	}

	eye = [xcenter, ycenter, zStartingPoint + eyeAtZ]	
	target = [xcenter, ycenter, zcenter]
	up = [0., 1., 0.];
	updateScene();
}

function cameraHome()
{
	rotX = 0.;
	rotY = 0.;
	xLast = 0.;
	yLast = 0.;
	viewMatrix = mat4.create();		// Mview = I
	eye = [xcenter, ycenter, zStartingPoint + eyeAtZ]	
	target = [xcenter, ycenter, zcenter]
	up = [0., 1., 0.];
	updateScene();
}

function updateScene(){
	// View Transformation
	viewMatrix = mat4.create();		// Mview = I
	
	mat4.lookAt(viewMatrix, eye, target, up);
	mat4.rotate(viewMatrix, viewMatrix, rotX, [1., 0., 0.]);
	mat4.rotate(viewMatrix, viewMatrix, rotY, [0., 1., 0.]);
}

function updateScene2(viewmtrx){
	mat4.lookAt(viewmtrx, eye, target, up);
	mat4.rotate(viewmtrx, viewmtrx, rotX, [1., 0., 0.]);
	mat4.rotate(viewmtrx, viewmtrx, rotY, [0., 1., 0.]);
}

function mouseDownEventListener(event)
{
	isOrbit = false;
	dragging = true;
	var x = event.clientX;
	var y = event.clientY;
	var rect = event.target.getBoundingClientRect();
	x = x - rect.left;
	y = y - rect.top;
	xLast = x;
	yLast = y;
}

function mouseUpEventListener(event)
{
	isOrbit = false;
	dragging = false;	// mouse is released
}

function mouseMoveEventListener(event)
{
	isOrbit = false;
	if(dragging)
	{
		var x = event.clientX;
		var y = event.clientY;
		var rect = event.target.getBoundingClientRect();
		x = x - rect.left;
		y = y - rect.top;
		dragMode = document.querySelector("input[name='camera']:checked").value;
		if(dragMode == "ROTATE")
		{
			var factor = 10. / canvas.height; // The rotation ratio
			var dx = factor * (x - xLast);
			var dy = factor * (y - yLast);
			// Limit x-axis rotation angle to [-90, 90] degrees
			rotX = Math.max(Math.min(rotX + dy, 90.), -90.);
			rotY = rotY + dx;
		} else if(dragMode == "PAN")
		{ 				
			eye[0] = eye[0] + ((x - xLast) / 63.0);
			eye[1] = eye[1] + ((y - yLast) / (-63.0));
			target[0] = eye[0];
			target[1] = eye[1];
		} else if(dragMode == "ZOOM")
		{
			var difX = x - xLast;
			var difY = y - yLast;
			if (Math.abs(difX) > Math.abs(difY))
			{
				eye[2] = eye[2] + difX / 10.0;
			}
			else
			{
				eye[2] = eye[2] + difY / 10.0;
			}
		}
		xLast = x;
		yLast = y;
		updateScene();
	}
}

function buttonHomeClickEventListener(event)
{
	isOrbit = false;
	cameraHome();
	updateScene();
}

function buttonAboveClickEventListener(event)
{
	isOrbit = false;
	rotX = 0.;
	rotY = 0.;
	xLast = 0;
	yLast = 0;
	dragMode = "ROTATE";
	viewMatrix = mat4.create();		// Mview = I
	
	eye = [xcenter, yStartingPoint + eyeAtY, zcenter]	
	target = [xcenter, ycenter, zcenter]
	up = [0., 0., -1.];
	
	updateScene();	
}

function buttonFrontClickEventListener(event)
{
	isOrbit = false;
	rotX = 0.;
	rotY = 0.;
	xLast = 0;
	yLast = 0;
	dragMode = "ROTATE";
	viewMatrix = mat4.create();		// Mview = I
	eye = [xStartingPoint + eyeAtX, ycenter, zcenter]	
	target = [xcenter, ycenter, zcenter]
	up = [0., 1., 0.];

	updateScene();
}

function buttonBackClickEventListener(event)
{
	isOrbit = false;
	rotX = 0.;
	rotY = 0.;
	xLast = 0;
	yLast = 0;
	dragMode = "ROTATE";
	viewMatrix = mat4.create();		// Mview = I
	eye = [-1 * (xStartingPoint + eyeAtX), ycenter, zcenter]	
	target = [xcenter, ycenter, zcenter]
	up = [0., 1., 0.];

	updateScene();
}

function buttonLeftClickEventListener(event)
{
	isOrbit = false;
	buttonHomeClickEventListener(event)	
}

function buttonRightClickEventListener(event)
{	
	isOrbit = false;
	rotX = 0.;
	rotY = 0.;
	xLast = 0;
	yLast = 0;
	dragMode = "ROTATE";
	viewMatrix = mat4.create();		// Mview = I
	eye = [xcenter, ycenter, -(zStartingPoint + eyeAtZ)]	
	target = [xcenter, ycenter, zcenter]
	up = [0., 1., 0.];
	updateScene();
}

function buttonOrbitClickEventListener(event){
	buttonHomeClickEventListener(event);
	isOrbit = true;					
}

function initEventHandlers()
{
	canvas.addEventListener("mousedown", mouseDownEventListener, false);
	canvas.addEventListener("mouseup", mouseUpEventListener, false);
	canvas.addEventListener("mousemove", mouseMoveEventListener, false);
	document.getElementById("btn-home").addEventListener("click", buttonHomeClickEventListener, false);
	document.getElementById("btn-toggle-drawing-mode").addEventListener("click", buttonToggleDrawingMode, false);
	document.getElementById("btn-above").addEventListener("click", buttonAboveClickEventListener, false);
	document.getElementById("btn-front").addEventListener("click", buttonFrontClickEventListener, false);
	document.getElementById("btn-back").addEventListener("click", buttonBackClickEventListener, false);
	document.getElementById("btn-left").addEventListener("click", buttonLeftClickEventListener, false);
	document.getElementById("btn-right").addEventListener("click", buttonRightClickEventListener, false);
	document.getElementById("btn-orbit").addEventListener("click", buttonOrbitClickEventListener, false);
	window.addEventListener("keydown", checkKeyPressed, false);
}

function toggleViewport(){
	isViewportDividedRequested = !isViewportDividedRequested;
	
	if(!isViewportDividedRequested){
		cameraHome();
	}
}

function checkKeyPressed(e){
	if(e.keyCode == "32"){ //spacebar click
		toggleViewport();
		
	}
}

function readJSON(input){
	var fr = new FileReader();
	fr.readAsText(input.files[0]);
	fr.onload = function(e){
		if(renderId == null){
			cancelAnimationFrame(renderId);
		}
		init(fr.result)
	}
  }
