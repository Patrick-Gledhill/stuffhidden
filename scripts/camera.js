function setPixel(imgDataObj, x, y, width, r, g, b, numSamples) {
    var index = (y * width + x) * 4;

    var scale = 1 / numSamples;
    r *= scale;
    g *= scale;
    b *= scale;

    r = Math.sqrt(r);
    g = Math.sqrt(g);
    b = Math.sqrt(b);

    if (prevFrameData != null) {
        var weight = 1 / (numRenderedFrames + 1);
        var pixColorN = new vec3(r, g, b);
        var prevPixCol = new vec3(prevFrameData[index] / 256, prevFrameData[index + 1] / 256, prevFrameData[index + 2] / 256);
        var accumulatedAvg = prevPixCol.multiply(1 - weight).add(pixColorN.multiply(weight));
        pixColorN = accumulatedAvg;

        r = pixColorN.r;
        g = pixColorN.g;
        b = pixColorN.b;
    }

    var intensity = new Interval(0, 0.999);

    imgDataObj[index] = intensity.clamp(r) * 256;
    imgDataObj[index + 1] = intensity.clamp(g) * 256;
    imgDataObj[index + 2] = intensity.clamp(b) * 256;
    imgDataObj[index + 3] = 255;
}

function grayscaleFilter(pixColor) {
    var avg = (pixColor.x + pixColor.y + pixColor.z) / 3;
    return new vec3(avg, avg, avg);
}

function sepiaFilter(pixColor) {
    var avg = (pixColor.x + pixColor.y + pixColor.z) / 3;
    return new vec3(avg * 0.9, avg * 0.6, avg * 0.3);
}

function testFilter(pixColor) {
    return new vec3(pixColor.x, pixColor.y, pixColor.z);
}

function invertColorFilter(pixColor) {
    return new vec3(1, 1, 1).subtract(pixColor);
}

function darkenColorFilter(pixColor) {
    return pixColor.multiply(0.5);
}

class Camera {
    constructor() {
        this.aspectRatio = 16 / 9;
        // this.sWidth = 384;
        this.sWidth = 512;
        this.sHeight = this.sWidth;
        this.center = new vec3(0, 0, 0);
        this.pixel00Loc;
        this.pixelDeltaU;
        this.pixelDeltaV;
        this.samplesPerPixel = 16;
        this.maxRayBounces = 8;
        this.colorFilter;
        this.useFilter = false;

        this.vFov = 20;
        this.lookFrom = new vec3(-2, 2, 1);
        this.lookAt = new vec3(0, 0, -1);
        this.vUp = new vec3(0, 1, 0);

        this.u;
        this.v;
        this.w;

        this.defocusAngle = 0;
        this.focusDist = 10;
        this.defocusDiskU;
        this.defocusDiskV;
    }

    setVFovWithHFov(hFov) {
        this.vFov = calculateVerticalFOVFromHorizontalFOV(hFov, this.aspectRatio);
    }

    initialize() {
        this.sHeight = Math.floor(this.sWidth / this.aspectRatio);
        this.sHeight = this.sHeight < 1 ? 1 : this.sHeight;

        this.center = this.lookFrom;

        // var focalLength = (this.lookFrom.subtract(this.lookAt)).length();
        var theta = degreesToRadians(this.vFov);
        var h = Math.tan(theta / 2);
        var viewportHeight = 2 * h * this.focusDist;
        var viewportWidth = viewportHeight * (this.sWidth / this.sHeight);

        this.w = this.lookFrom.subtract(this.lookAt).normalized();
        this.u = this.vUp.cross(this.w).normalized();
        this.v = this.w.cross(this.u);

        var viewportU = this.u.multiply(viewportWidth);
        var viewportV = this.v.multiply(-1).multiply(viewportHeight);

        this.pixelDeltaU = viewportU.divide(this.sWidth);
        this.pixelDeltaV = viewportV.divide(this.sHeight);

        var halfVU = viewportU.divide(2);
        var halfVV = viewportV.divide(2);

        var viewportUpperLeft = this.center.subtract(this.w.multiply(this.focusDist)).subtract(halfVU).subtract(halfVV);
        var pixDeltaHUV = this.pixelDeltaU.add(this.pixelDeltaV).multiply(0.5);
        this.pixel00Loc = viewportUpperLeft.add(pixDeltaHUV);

        var defocusRadius = this.focusDist * Math.tan(degreesToRadians(this.defocusAngle / 2));
        this.defocusDiskU = this.u.multiply(defocusRadius);
        this.defocusDiskV = this.v.multiply(defocusRadius);
    }

    getEnvLight(r) {
        // return new vec3(0, 0, 0);
        // // var skyColorHorizon = new vec3(0, 0, 0);
        // // var skyColorZenith = new vec3(0, 0, 0);
        // // var groundColor = new vec3(0, 0, 0);

        // // var skyColorHorizon = new vec3(0.4, 0.5, 0.6);
        // // var skyColorZenith = new vec3(0.2, 0.25, 0.3);
        // // var groundColor = new vec3(0.4, 0.5, 0.6);

        // // var skyColorHorizon = new vec3(0.9, 0.9, 1).multiply(0.3);
        // // var skyColorZenith = new vec3(0.5, 0.7, 1).multiply(0.3);
        // // var groundColor = new vec3(0.25, 0.25, 0.25).multiply(0.3);

        // var skyColorHorizon = new vec3(0.9, 0.9, 1);
        // var skyColorZenith = new vec3(0.5, 0.7, 1);
        // var groundColor = new vec3(0.25, 0.25, 0.25);
        // var unitDir = r.direction().normalized();
        // // var sunDir = new vec3(-1, -0.4, 0.92).normalized();
        // var sunDir = new vec3(-0.8, -0.35, 1).normalized();
        // var sunFocus = 256;
        // var sunIntensity = 0; // 50
        // var sunCol = new vec3(1, 0.9, 0.7);

        // var skyGradT = Math.pow(smoothstep(0, 0.4, unitDir.y), 0.6);
        // var skyGrad = lerpVec3(skyColorHorizon, skyColorZenith, skyGradT);
        // var sun = Math.pow(Math.max(0, unitDir.dot(sunDir.multiply(-1))), sunFocus) * sunIntensity;

        // var groundToSkyT = smoothstep(-0.01, 0, unitDir.y);
        // var sunMask = (groundToSkyT >= 1);
        // return lerpVec3(groundColor, skyGrad, groundToSkyT).add(sunCol.multiply(sun * sunMask));

        var unitDir = r.direction().normalized();
        var tm = (unitDir.y + 1) / 2;
        // if (unitDir.y > -0.01) {
            return new vec3(lerp(1, 0.5, tm), lerp(1, 0.7, tm), 1);
            // return new vec3(lerp(0.75, 0.375, tm), lerp(0.75, 0.525, tm), 1);
        // } else {
        //     return new vec3(0.5, 0.5, 0.5);
        // }
    }

    rayColor(r = new Ray(), depth, world = new HittableList(), colorFilter = function (pixColor) { return pixColor; }) {
        var col = this.rayColorMain(r, depth, world);

        if (this.useFilter) {
            return colorFilter(col);
        } else {
            return col;
        }
    }

    rayColorMain(r = new Ray(), depth, world = new HittableList()) {
        // EXPERIMENTAL CODE

        var incomingLight = new vec3(0, 0, 0);
        var rayColor = new vec3(1, 1, 1);

        for (var i = 0; i <= depth; i++) {
            var rec = new HitInfo();
            var col = world.hit(r, new Interval(0.001, Infinity), rec);
            if (col.hit) {
                rec = col.hInfo;
                var scatterRes = rec.material.scatter(r, rec);
                if (scatterRes.hit) {
                    r = scatterRes.ray;

                    var material = scatterRes;
                    var emittedLight = material.emissionColor.multiply(material.emissionStrength);
                    incomingLight = incomingLight.add(emittedLight.multiply(rayColor));
                    rayColor = rayColor.multiply(material.attenuation);
                }
            } else {
                incomingLight = incomingLight.add(this.getEnvLight(r).multiply(rayColor));
                break;
            }
        }

        return incomingLight;

        // if (depth <= 0) {
        //     return new vec3(0, 0, 0);
        // }

        // var rec = new HitInfo();

        // var col = world.hit(r, new Interval(0.001, Infinity), rec);
        // rec = col.hInfo;

        // if (col.hit) {
        //     var scatteredRay;
        //     var attenuation;

        //     var scatterResult = rec.material.scatter(r, rec);

        //     if (scatterResult.hit) {
        //         return this.rayColor(scatterResult.ray, depth - 1, world).multiply(scatterResult.attenuation);
        //     }

        //     return new vec3(0, 0, 0);

        //     // alert(rec.normal.x);
        //     // return new vec3(1, 0, 0);
        //     // var direction = vec3.randomOnHemisphere(rec.normal);
        //     // return this.rayColor(new Ray(rec.p, direction), depth - 1, world).multiply(0.5);
        //     // return (rec.normal.add(new vec3(1, 1, 1))).multiply(0.5);
        // }

        // var unitDir = r.direction().normalized();
        // var tm = (unitDir.y + 1) / 2;
        // return this.getEnvLight(r);
        // // return new vec3(lerp(1, 0.5, tm), lerp(1, 0.7, tm), 1);
        // // return new vec3(lerp(1, 1, tm), lerp(1, 1, tm), 1);
    }

    pixelSampleSquare() {
        if (this.samplesPerPixel >= 2) {
            var px = -0.5 + Math.random();
            var py = -0.5 + Math.random();
            return (this.pixelDeltaU.multiply(px)).add(this.pixelDeltaV.multiply(py));
        }

        return vec3.zero();
    }

    defocusDiskSample() {
        var p = vec3.randomPointInDisk();
        return this.center.add(this.defocusDiskU.multiply(p.x)).add(this.defocusDiskV.multiply(p.y));
    }

    getRay(x, y) {
        var cPixDeltU = this.pixelDeltaU.multiply(x);
        var cPixDeltV = this.pixelDeltaV.multiply(y);
        var pixelCenter = this.pixel00Loc.add(cPixDeltU).add(cPixDeltV);

        var pixelSample = pixelCenter.add(this.pixelSampleSquare());

        var rayOrigin = (this.defocusAngle <= 0) ? this.center : this.defocusDiskSample();
        var rayDir = pixelSample.subtract(rayOrigin);
        var rayTime = Math.random();

        return new Ray(rayOrigin, rayDir.normalized(), rayTime);
    }

    async render(context = ctx, world, denoise = true) {
        this.initialize();

        rendImgWidth = this.sWidth;
        rendImgHeight = this.sHeight;

        var outputImg = context.createImageData(this.sWidth, this.sHeight);
        var imgData = outputImg.data;

        if (prevFrameData != null) {
            for (var i = 0; i < imgData.length; i += 4) {
                imgData[i] = prevFrameData[i];
                imgData[i + 1] = prevFrameData[i + 1];
                imgData[i + 2] = prevFrameData[i + 2];
                imgData[i + 3] = prevFrameData[i + 3];
            }
        }

        console.time("Render Time");
        for (var y = 0; y < this.sHeight; y++) {
            if (exitRender == true) {
                exitRender = false;
                return;
            }
            console.log("Scanlines Remaining: " + (this.sHeight - y));
            for (var x = 0; x < this.sWidth; x++) {
                // setPixel(imgData, x, y, this.sWidth, x / this.sWidth, 0, 0, 1);
                var pixColor = new vec3(0, 0, 0);

                for (var i = 0; i < this.samplesPerPixel; i++) {
                    var ray = this.getRay(x, y);
                    pixColor = pixColor.add(this.rayColor(ray, this.maxRayBounces, world, this.colorFilter));
                }

                setPixel(imgData, x, y, this.sWidth, pixColor.r, pixColor.g, pixColor.b, this.samplesPerPixel);
            }

            // if (y % 4 === 0) {
            await wait(0);
            context.putImageData(outputImg, 0, 0);
            // }
        }

        console.timeEnd("Render Time");

        // if (prevFrameData != null) {
        //     for (var i = 0; i < imgData.length; i += 4) {
        //         imgData[i] = (prevFrameData[i] + imgData[i]) / 2;
        //         imgData[i + 1] = (prevFrameData[i + 1] + imgData[i + 1]) / 2;
        //         imgData[i + 2] = (prevFrameData[i + 2] + imgData[i + 2]) / 2;
        //     }
        // }

        prevFrameData = imgData;
        context.putImageData(outputImg, 0, 0);
    }
}