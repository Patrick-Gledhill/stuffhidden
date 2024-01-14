class vec3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    get r() {
        return this.x;
    }

    get g() {
        return this.y;
    }

    get b() {
        return this.z;
    }

    add(vector) {
        if (vector instanceof vec3) {
            return new vec3(this.x + vector.x, this.y + vector.y, this.z + vector.z);
        }

        return new vec3(this.x + vector, this.y + vector, this.z + vector);
    }

    subtract(vector) {
        if (vector instanceof vec3) {
            return new vec3(this.x - vector.x, this.y - vector.y, this.z - vector.z);
        }

        return new vec3(this.x - vector, this.y - vector, this.z - vector);
    }

    multiply(vector) {
        if (vector instanceof vec3) {
            return new vec3(this.x * vector.x, this.y * vector.y, this.z * vector.z);
        }

        return new vec3(this.x * vector, this.y * vector, this.z * vector);
    }

    divide(vector) {
        if (vector instanceof vec3) {
            if (vector == new vec3(0, 0, 0)) {
                return new vec3(0, 0, 0);
            }

            return new vec3(this.x / vector.x, this.y / vector.y, this.z / vector.z);
        }

        if (vector === 0) {
            return new vec3(0, 0, 0);
        }

        return new vec3(this.x / vector, this.y / vector, this.z / vector);
    }

    dot(vector) {
        return (this.x * vector.x) + (this.y * vector.y) + (this.z * vector.z);
    }

    cross(vector) {
        return new vec3((this.y * vector.z) - (this.z * vector.y), (this.z * vector.x) - (this.x * vector.z), (this.x * vector.y) - (this.y * vector.x));
    }

    length() {
        return Math.sqrt(this.dot(this));
    }

    normalized() {
        return this.divide(this.length());
    }

    nearZero() {
        var s = 1e-8;
        return Math.abs(this.x) < s && Math.abs(this.y) < s && Math.abs(this.z) < s;
    }

    static reflect(vector, normal) {
        return vector.subtract(normal.multiply(2 * vector.dot(normal)));
    }

    // static refract(uv, n, etaiOverEtat) {
        // var cosTheta = Math.min((uv.multiply(-1)).dot(n), 1);
        // var rOutPerp = (uv.add(n.multiply(cosTheta))).multiply(etaiOverEtat);
        // var rOutParallel = n.multiply(-Math.sqrt(Math.abs(1 - rOutPerp.dot(rOutPerp))));
        // return rOutPerp.add(rOutParallel);
    // }

    static refract(uv, n, refractiveIndex) {
        // uv is the incident ray direction, n is the surface normal
        // refractiveIndex is the refractive index of the material

        var cosTheta = Math.min(uv.multiply(-1).dot(n), 1.0);
        var sinTheta = Math.sqrt(1.0 - cosTheta * cosTheta);

        // Check for total internal reflection
        if (refractiveIndex * sinTheta > 1.0) {
            return this.reflect(uv, n);
        }

        var rOutPerpendicular = uv.add(n.multiply(cosTheta)).multiply(refractiveIndex);
        var rOutParallel = n.multiply(-1 * Math.sqrt(Math.abs(1.0 - rOutPerpendicular.dot(rOutPerpendicular))));

        return rOutPerpendicular.add(rOutParallel);
    }

    static random(min = 0, max = 1) {
        return new vec3(random(min, max), random(min, max), random(min, max));
    }

    // Adapted from https://stackoverflow.com/questions/5531827/random-point-on-a-given-sphere
    static randomPointInSphere(x, y, z, radius) {
        var u = Math.random();
        var v = Math.random();
        var theta = 2 * Math.PI * u;
        var phi = Math.acos(2 * v - 1);
        var px = x + (radius * Math.sin(phi) * Math.cos(theta));
        var py = y + (radius * Math.sin(phi) * Math.sin(theta));
        var pz = z + (radius * Math.cos(phi));
        return new vec3(px, py, pz);
    }

    static randomPointInDisk(radius) {
        var u = (Math.random() - 0.5) * 2;
        var v = (Math.random() - 0.5) * 2;

        var randomDir = Math.random() * 2 * Math.PI;

        var x = Math.cos(randomDir) * u;
        var y = Math.sin(randomDir) * v;

        return new vec3(x, y, 0);
    }

    static randomUnitVector() {
        return this.randomPointInSphere(0, 0, 0, 1).normalized();
    }

    static randomOnHemisphere(normal) {
        var randUnitVec = this.randomUnitVector();

        if (randUnitVec.dot(normal) > 0) {
            return randUnitVec;
        } else {
            return randUnitVec.multiply(-1);
        }
    }

    static zero() {
        return new vec3(0, 0, 0);
    }
}