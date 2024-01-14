function get3DAxis(vector, axisIndex) {
    if (axisIndex === 0) {
        return vector.x;
    }

    if (axisIndex === 1) {
        return vector.y;
    }

    if (axisIndex === 2) {
        return vector.z;
    }
}

var numRenderedFrames = 0;
var prevFrameData = null;
var rendImgWidth = 0;
var rendImgHeight = 0;

var exitRender = false;

var vWidth = window.innerWidth;
var vHeight = window.innerHeight;

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function clamp(min, max, value) {
    if (value < min) {
        return min;
    }

    if (value > max) {
        return max;
    }

    return value;

    // return Math.min(Math.max(min, value), max);
}

function lerp(a, b, t) {
    return a + ((b - a) * t);
}

function smoothstep(min, max, value) {
    var x = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return x * x * (3 - 2 * x);
}

function lerpVec3(a, b, t) {
    return new vec3(lerp(a.x, b.x, t), lerp(a.y, b.y, t), lerp(a.z, b.z, t));
}

function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function calculateVerticalFOVFromHorizontalFOV(horizontalFOV, aspectRatio) {
    // var tanHalfHorizontalFOV = Math.tan(horizontalFOV / 2);
    // var tanHalfVerticalFOV = tanHalfHorizontalFOV / aspectRatio;
    // var verticalFOV = 2 * Math.atan(tanHalfVerticalFOV);
    // return Math.ceil(radiansToDegrees(verticalFOV));
    var vertFOV = Math.round(radiansToDegrees(2 * Math.atan(Math.tan(degreesToRadians(horizontalFOV) / 2) / aspectRatio)));
    return vertFOV;
}

class Interval {
    constructor(min = Infinity, max = -Infinity) {
        this.min = min;
        this.max = max;
    }

    static createFrom2Intervals(a, b) {
        return new Interval(Math.min(a.min, b.min), Math.max(a.max, b.max));
    }

    contains(x) {
        return this.min <= x && x <= this.max;
    }

    surrounds(x) {
        return this.min < x && x < this.max;
    }

    clamp(x) {
        if (x < this.min) {
            return this.min;
        }

        if (x > this.max) {
            return this.max;
        }

        return x;

        // return Math.min(Math.max(min, value), max);
    }

    static empty() {
        return new Interval(Infinity, -Infinity);
    }

    static universe() {
        return new Interval(-Infinity, Infinity);
    }
}

class AABB {
    constructor(a, b) {
        if (a instanceof vec3 && b instanceof vec3) {
            this.x = new Interval(Math.min(a.x, b.x), Math.max(a.x, b.x));
            this.y = new Interval(Math.min(a.y, b.y), Math.max(a.y, b.y));
            this.z = new Interval(Math.min(a.z, b.z), Math.max(a.z, b.z));
        } else {
            this.x = new Interval();
            this.y = new Interval();
            this.z = new Interval();
        }
    }

    static createFrom2AABB(aabb1, aabb2) {
        var newAABB = new AABB();
        newAABB.x = Interval.createFrom2Intervals(aabb1.x, aabb2.x);
        newAABB.y = Interval.createFrom2Intervals(aabb1.y, aabb2.y);
        newAABB.z = Interval.createFrom2Intervals(aabb1.z, aabb2.z);
        return newAABB;
    }

    axis(n) {
        if (n == 1) {
            return this.y;
        }

        if (n == 2) {
            return this.z;
        }

        return this.x;
    }

    hit(r, rayT) {
        for (var a = 0; a < 3; a++) {
            var invD = 1 / get3DAxis(r.direction(), a);
            var orig = get3DAxis(r.origin(), a);

            var t0 = (this.axis(a).min - orig) * invD;
            var t1 = (this.axis(a).max - orig) * invD;

            if (invD < 0) {
                var temp = t0;
                t0 = t1;
                t1 = temp;
            }

            if (t0 > rayT.min) {
                rayT.min = t0;
            }

            if (t1 < rayT.max) {
                rayT.max = t1;
            }

            if (rayT.max <= rayT.min) {
                return false;
            }
        }

        return true;
    }
}