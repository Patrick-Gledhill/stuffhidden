class Ray {
    constructor(origin = new vec3(0, 0, 0), direction = new vec3(0, 0, 1), time = 0) {
        this.orig = origin;
        this.dir = direction;
        this.tm = time;
    }

    origin() {
        return this.orig;
    }

    direction() {
        return this.dir;
    }

    time() {
        return this.tm;
    }

    at(t) {
        return this.orig.add(this.dir.multiply(t));
    }
}