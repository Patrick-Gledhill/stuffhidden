window.onerror = function (ev, src, lineno, colno, err) {
	alert(`${ev}\n${src}\n${lineno}:${colno}\n${err}`);
}

/**
 * @type { HTMLCanvasElement }
 */
var scene = document.getElementById("scene");
var ctx = scene.getContext("2d");

var keysDown = [];
var tFps = 1000;
var updateLoop;

async function passiveSetInterval(func, ms) {
	await wait(ms);
	await func();
	passiveSetInterval(func, ms);
}

function resizeCanvas() {
	vWidth = window.innerWidth;
	vHeight = window.innerHeight;
	scene.width = 1280;
	scene.height = 720;
}

resizeCanvas();

function hitSphere(center, radius, ray) {
	var oc = ray.origin().subtract(center);
	var a = ray.direction().dot(ray.direction());
	var halfB = oc.dot(ray.direction());
	var c = oc.dot(oc) - radius * radius;
	var discriminant = halfB * halfB - a * c;

	if (discriminant < 0) {
		return -1;
	} else {
		return (-halfB - Math.sqrt(discriminant)) / a;
	}
}

var curScene = 6;

var world = new HittableList();

// world.add(new Sphere(new vec3(0, 0.6, -1.5), new vec3(0, 0.6, -1.5), 0.25, new ParameterMaterial(new vec3(0, 0, 0), 0, 0, new vec3(1, 1, 1), 10, new vec3(1, 1, 1)), false));

if (curScene === 0) {
	world.add(new Sphere(new vec3(0, -3000, -2), new vec3(0, -3000, -2), 3000, new ParameterMaterial(new vec3(0.9, 0.9, 0.9), 0, 0, new vec3(0, 0, 0), 0, new vec3(0.9, 0.9, 0.9)), false));

	world.add(new Sphere(new vec3(0, 0.3, -2.4), new vec3(0, 0.3, -2.4), 0.3, new ParameterMaterial(new vec3(0.9, 0.45, 0), 0, 0, new vec3(0, 0, 0), 0, new vec3(0.95, 0.95, 0.95)), false));
} else if (curScene === 1) {
	world.add(new Sphere(new vec3(0, -3000, -2), new vec3(0, -3000, -2), 3000, new ParameterMaterial(new vec3(0.9, 0.9, 0.9), 0, 0, new vec3(0, 0, 0), 0, new vec3(0.9, 0.9, 0.9)), false));

	//world.add(new Sphere(new vec3(0, 0.3, -2), new vec3(0, 0.4, -2), 0.3, new ParameterMaterial(new vec3(0.9, 0.45, 0), 0, 1, new vec3(0, 0, 0), 0, new vec3(0.9, 0.45, 0)), false));

	world.add(new Sphere(new vec3(0, 1.3, -1.75), new vec3(0, 1.3, -1.75), 0.3, new ParameterMaterial(new vec3(0, 0, 0), 0, 0, new vec3(1, 1, 1), 10), false));
	world.add(new Sphere(new vec3(-2, 1.2, -2), new vec3(-2, 1.2, -2), 0.2, new ParameterMaterial(new vec3(0, 0, 0), 0, 0, new vec3(1, 0.5, 0), 10), false));
	world.add(new Sphere(new vec3(2, 1.2, -2), new vec3(2, 1.2, -2), 0.2, new ParameterMaterial(new vec3(0, 0, 0), 0, 0, new vec3(0, 0.5, 1), 10), false));

	world.add(new Sphere(new vec3(-0.6, 0.075, -1.4), new vec3(-0.6, 0.075, -1.4), 0.075, new ParameterMaterial(new vec3(0, 0, 0), 0, 0, new vec3(1, 0.8, 0.6), 2), false));

	world.add(new Sphere(new vec3(0.6, 0.075, -1.4), new vec3(0.6, 0.075, -1.4), 0.075, new ParameterMaterial(new vec3(0, 0, 0), 0, 0, new vec3(0.6, 0.8, 1), 2), false));

	world.add(new Sphere(new vec3(0, 0.3, -2.4), new vec3(0, 0.3, -2.4), 0.3, new ParameterMaterial(new vec3(0.8, 0, 0.8), 0, 0.25, new vec3(0, 0, 0), 0, new vec3(0.8, 0.8, 0.8)), false));

	world.add(new Sphere(new vec3(0.9, 0.3, -2.25), new vec3(0.9, 0.3, -2.25), 0.3, new ParameterMaterial(new vec3(0, 0.8, 0.8), 0, 1, new vec3(0, 0, 0), 0, new vec3(0, 0.8, 0.8)), false));

	world.add(new Sphere(new vec3(-0.9, 0.3, -2.25), new vec3(-0.9, 0.3, -2.25), 0.3, new ParameterMaterial(new vec3(0.8, 0.5, 0), 0, 0, new vec3(0, 0, 0), 0, new vec3(0.8, 0.8, 0.8)), false));

	world.add(new Sphere(new vec3(-0.55, 0.2, -2.9), new vec3(-0.55, 0.2, -2.9), 0.2, new ParameterMaterial(new vec3(0.8, 0, 0), 0, 0.25, new vec3(0, 0, 0), 0, new vec3(0.8, 0.8, 0.8)), false));

	world.add(new Sphere(new vec3(0.55, 0.2, -2.9), new vec3(0.55, 0.2, -2.9), 0.2, new ParameterMaterial(new vec3(0, 0.8, 0), 0, 0.1, new vec3(0, 0, 0), 0, new vec3(0.8, 0.8, 0.8)), false));

	world.add(new Sphere(new vec3(-0.9, 1.2, -4), new vec3(-0.9, 1.2, -4), 0.8, new ParameterMaterial(new vec3(0.8, 0.8, 0.8), 0, 1, new vec3(0, 0, 0), 0, new vec3(0.8, 0.8, 0.8)), false));

	world.add(new Sphere(new vec3(0.9, 1.2, -4), new vec3(0.9, 1.2, -4), 0.8, new ParameterMaterial(new vec3(0.8, 0.8, 0.8), 0, 1, new vec3(0, 0, 0), 0, new vec3(0.8, 0.8, 0.8)), false));

	for (var i = 0; i < 5; i++) {
		world.add(new Sphere(new vec3(((i / 4) - 0.5) * 0.6, 0.05, -1.65), new vec3(((i / 4) - 0.5) * 0.6, 0.05, -1.65), 0.05, new ParameterMaterial(new vec3(0.4, 0.8, 0.2), i / 4, 1, new vec3(0, 0, 0), 0, new vec3(0.4, 0.8, 0.2)), false));
	}

	for (var i = 0; i < 5; i++) {
		world.add(new Sphere(new vec3(((i / 4) - 0.5) * 0.6, 0.05, -1.25), new vec3(((i / 4) - 0.5) * 0.6, 0.05, -1.25), 0.05, new ParameterMaterial(new vec3(0.4, 0.8, 0.2), 0, 1 - (i / 4), new vec3(0, 0, 0), 0, new vec3(0.8, 0.8, 0.8)), false));
	}

	for (var i = 0; i < 20; i++) {
		var col = vec3.random(0, 1);
		var rand = Math.random();
		var randAngle = random(0, 2 * Math.PI);
		// var rand2 = (Math.cos(randAngle) * random(1.4, 6));
		// var rand3 = ((Math.sin(randAngle) * random(1.4, 6)) - 2);
		var rand2 = (Math.cos(randAngle) * random(2, 6));
		var rand3 = ((Math.sin(randAngle) * random(2, 6)) - 2);

		if (rand < 0.8) {
			world.add(new Sphere(new vec3(rand2, 0.1, rand3), new vec3(rand2, 0.1, rand3), 0.1, new ParameterMaterial(col, random(0, 0.25), Math.random(), vec3.zero(), 0, col)));
		} else {
			world.add(new Sphere(new vec3(rand2, 0.1, rand3), new vec3(rand2, 0.1, rand3), 0.1, new ParameterMaterial(vec3.zero(), 0, 0, col, random(1, 5), vec3.zero())));
		}
	}
} else if (curScene === 2) {
	world.add(new Sphere(new vec3(0, -3000, -2), new vec3(0, -3000, -2), 3000, new ParameterMaterial(new vec3(0.9, 0.9, 0.9), 0, 0, new vec3(0, 0, 0), 0, new vec3(0.9, 0.9, 0.9)), false));

	world.add(new Sphere(new vec3(0, 0.3, -2.4), new vec3(0, 0.3, -2.4), 0.3, new ParameterMaterial(new vec3(0.8, 0, 0.8), 0, 0.25, new vec3(0, 0, 0), 0, new vec3(0.8, 0.8, 0.8)), false));

	world.add(new Sphere(new vec3(-2, 1.3, -1.75), new vec3(-2, 1.3, -1.75), 0.3, new ParameterMaterial(new vec3(0, 0, 0), 0, 0, new vec3(1, 1, 1), 10), false));
} else if (curScene === 3) {
	world.add(new Sphere(new vec3(0, -3000, -2), new vec3(0, -3000, -2), 3000, new ParameterMaterial(new vec3(0.9, 0.9, 0.9), 0, 0, new vec3(0, 0, 0), 0, new vec3(0.9, 0.9, 0.9)), false));

	world.add(new Sphere(new vec3(0, 0.3, -2.4), new vec3(0, 0.3, -2.4), 0.3, new ParameterMaterial(new vec3(0.9, 0.45, 0), 0, 0, new vec3(0, 0, 0), 0, new vec3(0.8, 0.8, 0.8)), false));

	world.add(new Sphere(new vec3(-0.8, 1.3, -2.4), new vec3(-0.8, 1.3, -2.4), 0.3, new ParameterMaterial(new vec3(0, 0, 0), 0, 0, new vec3(1, 1, 1), 10), false));
} else if (curScene === 4) {
	world.add(new Sphere(new vec3(0, -3000, -2), new vec3(0, -3000, -2), 3000, new ParameterMaterial(new vec3(0.9, 0.9, 0.9), 0, 0, new vec3(0, 0, 0), 0, new vec3(0.9, 0.9, 0.9)), false));

	world.add(new Sphere(new vec3(0, 0.3, -2.4), new vec3(0, 0.3, -2.4), 0.3, new ParameterMaterial(new vec3(0, 0, 0), 0, 1, new vec3(0, 0, 0), 0, new vec3(0.95, 0.475, 0)), false));

	world.add(new Sphere(new vec3(-1, 1.3, -1.75), new vec3(-1, 1.3, -1.75), 0.3, new ParameterMaterial(new vec3(0, 0, 0), 0, 0, new vec3(1, 1, 1), 10), false));
} else if (curScene === 5) {
	world.add(new Sphere(new vec3(0, -3000, -2), new vec3(0, -3000, -2), 3000, new ParameterMaterial(new vec3(0.9, 0.9, 0.9), 0, 0, new vec3(0, 0, 0), 0, new vec3(0.9, 0.9, 0.9)), false));

	world.add(new Sphere(new vec3(0, 0.3, -2.4), new vec3(0, 0.3, -2.4), 0.3, new ParameterMaterial(new vec3(0, 0, 0), 0, 0.2, new vec3(0, 0, 0), 0, new vec3(0.95, 0.95, 0.95)), false));

	world.add(new Sphere(new vec3(-1, 1.3, -1.75), new vec3(-1, 1.3, -1.75), 0.3, new ParameterMaterial(new vec3(0, 0, 0), 0, 0, new vec3(1, 1, 1), 10), false));
} else if (curScene === 6) {
	// Floor
	world.add(new Sphere(new vec3(0, -3000, 0), new vec3(0, -3000, 0), 3000, new ParameterMaterial(new vec3(0.9, 0.9, 0.9), 0, 0, new vec3(0, 0, 0), 0, new vec3(0.9, 0.9, 0.9)), false));
	// Ceiling
	// world.add(new Sphere(new vec3(0, 3002, 0), new vec3(0, 3002, 0), 3000, new ParameterMaterial(new vec3(0.9, 0.9, 0.9), 0, 0, new vec3(0, 0, 0), 0, new vec3(0.9, 0.9, 0.9)), false));
	// Left Wall
	world.add(new Sphere(new vec3(-3002, 1, 0), new vec3(-3002, 1, 0), 3000, new ParameterMaterial(new vec3(0.9, 0.45, 0), 0, 0, new vec3(0, 0, 0), 0, new vec3(0.9, 0.9, 0.9)), false));
	// Right Wall
	world.add(new Sphere(new vec3(3002, 1, 0), new vec3(3002, 1, 0), 3000, new ParameterMaterial(new vec3(0, 0.45, 0.9), 0, 0, new vec3(0, 0, 0), 0, new vec3(0.9, 0.9, 0.9)), false));
	// Back Wall
	// world.add(new Sphere(new vec3(0, 1, -3003), new vec3(0, 1, -3003), 3000, new ParameterMaterial(new vec3(0.7, 0.7, 0.7), 0, 0, new vec3(0, 0, 0), 0, new vec3(0.9, 0.9, 0.9)), false));
	// Front Wall
	world.add(new Sphere(new vec3(0, 1, 3002), new vec3(0, 1, 3002), 3000, new ParameterMaterial(new vec3(0.7, 0.7, 0.7), 0, 0, new vec3(0, 0, 0), 0, new vec3(0.9, 0.9, 0.9)), false));
	// Light
	world.add(new Sphere(new vec3(0, 2, 0), new vec3(0, 2, 0), 0.3, new ParameterMaterial(new vec3(0, 0, 0), 0, 0, new vec3(1, 1, 1), 10), false));


	world.add(new Sphere(new vec3(-0.7, 0.4, -1.5), new vec3(-0.7, 0.4, -1.5), 0.4, new ParameterMaterial(new vec3(0, 0, 0), 0.05, 1, new vec3(0, 0, 0), 0, new vec3(0, 0.95, 0.95)), false));
	world.add(new Sphere(new vec3(0.7, 0.4, -1.5), new vec3(0.7, 0.4, -1.5), 0.4, new ParameterMaterial(new vec3(0.95, 0.95, 0.95), 0, 0, new vec3(0, 0, 0), 0, new vec3(0.95, 0.95, 0.95)), false));
} else if (curScene === 7) {
	world.add(new Sphere(new vec3(0, -3000, -2), new vec3(0, -3000, -2), 3000, new ParameterMaterial(new vec3(0.9, 0.9, 0.9), 0, 0, new vec3(0, 0, 0), 0, new vec3(0.9, 0.9, 0.9)), false));

	world.add(new Sphere(new vec3(0, 0.3, -2.4), new vec3(0, 0.3, -2.4), 0.3, new ParameterMaterial(new vec3(0.9, 0.45, 0), 0, 0, new vec3(0, 0, 0), 0, new vec3(0.95, 0.95, 0.95)), false));

	world.add(new Sphere(new vec3(-1, 2, -2.4), new vec3(-1, 1, -2.4), 0.3, new ParameterMaterial(new vec3(0, 0, 0), 0, 0, new vec3(1, 1, 1), 10, new vec3(0.95, 0.95, 0.95)), false));
}

// world.add(new Sphere(new vec3(0, 0.5, -2), new vec3(0, 0.5, -2), 0.5, new Dielectric(new vec3(1, 1, 1), 1.2), false));

// world.add(new Sphere(new vec3(0, 0, -2), new vec3(0, 0, -2), 1.25, new Lambertian(new vec3(1, 1, 1))))

var camX = 0; // 13
var camY = 1; // 2 0.4
var camZ = 2; // 3

var cam = new Camera();

cam.vFov = 36;
cam.defocusAngle = 0; // 0.4
cam.focusDist = 10;
cam.lookFrom = new vec3(camX, camY, camZ);
cam.vUp = new vec3(0, 1, 0);

cam.setVFovWithHFov(60);

cam.useFilter = false;
cam.colorFilter = sepiaFilter;

var downloadRenderBtn = document.getElementById("downloadRender");

downloadRenderBtn.onclick = function () {
	if (prevFrameData != null) {
		var rendCnvs = document.createElement("canvas");
		rendCnvs.width = rendImgWidth;
		rendCnvs.height = rendImgHeight;
		var rendCtx = rendCnvs.getContext("2d");

		var renderImg = rendCtx.createImageData(rendImgWidth, rendImgHeight);
		for (var i = 0; i < prevFrameData.length; i += 4) {
			renderImg.data[i] = prevFrameData[i];
			renderImg.data[i + 1] = prevFrameData[i + 1];
			renderImg.data[i + 2] = prevFrameData[i + 2];
			renderImg.data[i + 3] = prevFrameData[i + 3];
		}

		rendCtx.putImageData(renderImg, 0, 0);

		var dataUrl = rendCnvs.toDataURL("image/png");
		var linkD = document.createElement("a");
		linkD.download = "render_" + rendImgWidth + "x" + rendImgHeight + ".png";
		linkD.href = dataUrl;
		linkD.click();
	}
}

async function main() {
	if (keysDown["w"]) {
		cam.lookFrom.z -= 0.1;
		prevFrameData = null;
		numRenderedFrames = 0;
	}

	if (keysDown["a"]) {
		cam.lookFrom.x -= 0.1;
		prevFrameData = null;
		numRenderedFrames = 0;
	}

	if (keysDown["s"]) {
		cam.lookFrom.z += 0.1;
		prevFrameData = null;
		numRenderedFrames = 0;
	}

	if (keysDown["d"]) {
		cam.lookFrom.x += 0.1;
		prevFrameData = null;
		numRenderedFrames = 0;
	}

	if (keysDown[" "]) {
		cam.lookFrom.y += 0.1;
		prevFrameData = null;
		numRenderedFrames = 0;
	}

	ctx.save();
	ctx.clearRect(0, 0, vWidth, vHeight);

	cam.lookAt = new vec3(cam.lookFrom.x, cam.lookFrom.y, cam.lookFrom.z - 1);
	// cam.lookAt = new vec3(0, 2, 0);

	await cam.render(ctx, world);

	// ctx.strokeStyle = "#000000";
	// ctx.strokeRect(0, 100, 64, 64);

	// ctx.fillStyle = "#000000";
	// ctx.fillRect(30 + (camX * 3), 131 + (camZ * 3), 4, 4);

	ctx.restore();

	numRenderedFrames += 1;
}

window.onload = function () {
	// updateLoop = setInterval(main, 1000 / tFps);
	// main();
	passiveSetInterval(main, 1000 / tFps);
}

window.addEventListener("keydown", (e) => {
	keysDown[e.key] = true;

	if (e.key === "w" || e.key === "a" || e.key === "s" || e.key === "d" || e.key === " ") {
		exitRender = true;
	}
});

window.addEventListener("keyup", (e) => {
	keysDown[e.key] = false;
});

window.addEventListener("resize", resizeCanvas);