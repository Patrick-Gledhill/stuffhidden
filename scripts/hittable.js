class Material {
    constructor() {

    }

    scatter(rIn, hInfo) {
        return {
            hit: true,
            attenuation: new vec3(0.9, 0.9, 0.9),
            emissionColor: new vec3(0, 0, 0),
            emissionStrength: 0,
            ray: new Ray(hInfo.p, rIn.direction(), rIn.time())
        }
    }
}

class ParameterMaterial extends Material {
    constructor(color = new vec3(0.5, 0.5, 0.5), roughness = 0, metalness = 0, emissionColor = new vec3(0, 0, 0), emissionStrength = 0, specularColor = color) {
        super();
        this.albedo = color;
        this.roughness = clamp(0, 1, roughness);
        this.metalness = clamp(0, 1, metalness);
        this.emissionColor = emissionColor;
        this.emissionStrength = emissionStrength;
        this.specularColor = specularColor;
    }

    scatter(rIn, hInfo) {
        var isSpecularBounce = Math.random() < this.metalness ? 1 : 0;
    
        var scatterDirection = hInfo.normal.add(vec3.randomUnitVector());
        if (scatterDirection.nearZero()) {
            scatterDirection = hInfo.normal;
        }

        var specularDirection = vec3.reflect(rIn.direction(), hInfo.normal);
        specularDirection = lerpVec3(specularDirection, scatterDirection, this.roughness).normalized();

        var rayDirection = lerpVec3(scatterDirection, specularDirection, isSpecularBounce);


        var scatteredRay = new Ray(hInfo.p, rayDirection, rIn.time());

        return {
            hit: true,
            attenuation: lerpVec3(this.albedo, this.specularColor, isSpecularBounce),
            emissionColor: this.emissionColor,
            emissionStrength: this.emissionStrength,
            ray: scatteredRay
        }
    }
}

class Lambertian extends Material {
    constructor(color) {
        super();
        this.albedo = color;
    }

    scatter(rIn, hInfo) {
        var scatterDirection = hInfo.normal.add(vec3.randomUnitVector());

        if (scatterDirection.nearZero()) {
            scatterDirection = hInfo.normal;
        }

        var scatteredRay = new Ray(hInfo.p, scatterDirection, rIn.time());

        return {
            hit: true,
            attenuation: this.albedo,
            emissionColor: new vec3(0, 0, 0),
            emissionStrength: new vec3(0, 0, 0),
            ray: scatteredRay
        }
    }
}

class Metal extends Material {
    constructor(color, fuzz = 0) {
        super();
        this.albedo = color;
        this.fuzz = clamp(0, 1, fuzz);
    }

    scatter(rIn, hInfo) {
        var reflectedDirection = vec3.reflect(rIn.direction(), hInfo.normal);

        var scatteredRay = new Ray(hInfo.p, reflectedDirection.add(vec3.randomUnitVector().multiply(this.fuzz)), rIn.time());

        return {
            hit: (scatteredRay.direction().dot(hInfo.normal) > 0),
            attenuation: this.albedo,
            emissionColor: new vec3(0, 0, 0),
            emissionStrength: new vec3(0, 0, 0),
            ray: scatteredRay
        }
    }
}

class Dielectric extends Material {
    constructor(color, indexOfRefraction = 1.5) {
        super();
        this.albedo = color;
        this.ir = indexOfRefraction;
    }

    scatter(rIn, hInfo) {
        var refractionRatio = hInfo.frontFace ? (1 / this.ir) : this.ir;

        var unitDir = rIn.direction().normalized();//.multiply(-1);

        var refracted = vec3.refract(unitDir, hInfo.normal, refractionRatio);

        var scatteredRay = new Ray(hInfo.p, refracted, rIn.time());

        return {
            hit: true,
            attenuation: this.albedo,
            emissionColor: new vec3(0, 0, 0),
            emissionStrength: new vec3(0, 0, 0),
            ray: scatteredRay
        }
    }
}

class HitInfo {
    constructor(p, normal, t, material = new ParameterMaterial()) {
        this.p = p;
        this.normal = normal;
        this.material = material;
        this.t = t;
        this.frontFace;
    }

    setFaceNormal(r, outwardNormal) {
        this.frontFace = r.direction().dot(outwardNormal) < 0;
        this.normal = outwardNormal;
        // this.normal = this.frontFace == true ? outwardNormal : outwardNormal.multiply(-1);
    }
}

class HittableObj {
    constructor() {

    }

    hit(r, rayT, hInfo) {

    }

    boundingBox() {

    }
}

class Sphere extends HittableObj {
    constructor(center, center2 = center, radius, material, moving = false) {
        super();
        this.center = center;
        this.center2 = center2;
        this.radius = radius;
        this.material = material;
        this.isMoving = moving;
        var rvec = new vec3(radius, radius, radius);
        var box1 = new AABB(center.subtract(rvec), center.add(rvec));
        var box2 = new AABB(center2.subtract(rvec), center2.add(rvec));
        this.bbox = AABB.createFrom2AABB(box1, box2);
        this.centerVector = this.center2.subtract(this.center);
    }

    boundingBox() {
        return this.bbox;
    }

    centerAt(time) {
        return lerpVec3(this.center, this.center.add(this.centerVector), time);
    }

    hit(r, rayT, hInfo) {
        var curCenter = this.isMoving ? this.centerAt(r.time()) : this.center;
        var oc = r.origin().subtract(curCenter);
        var a = r.direction().dot(r.direction());
        var halfB = oc.dot(r.direction());
        var c = oc.dot(oc) - this.radius * this.radius;

        var discriminant = halfB * halfB - a * c;
        if (discriminant < 0) {
            return false;
        }
        var sqrtd = Math.sqrt(discriminant);

        var root = (-halfB - sqrtd) / a;
        if (!rayT.surrounds(root)) {
            root = (-halfB + sqrtd) / a;
            if (!rayT.surrounds(root)) {
                return false;
            }
        }

        hInfo.t = root;
        hInfo.p = r.at(hInfo.t);
        var outwardNormal = (hInfo.p.subtract(curCenter)).divide(this.radius);
        hInfo.setFaceNormal(r, outwardNormal);
        hInfo.material = this.material;
        return true;
    }
}

// class Triangle extends HittableObj {
//     constructor(vertA, vertB, vertC) {
//         this.vertA = vertA;
//         this.vertB = vertB;
//         this.vertC = vertC;
//     }

//     hit(r, tri) {
//         var edgeAB = tri.pos
//     }
// }

class HittableList extends HittableObj {
    constructor() {
        super();
        this.objects = [];
        this.bbox = new AABB();
    }

    clear() {
        this.objects = [];
    }

    add(object) {
        this.objects.push(object);
        this.bbox = AABB.createFrom2AABB(this.bbox, object.boundingBox());
    }

    boundingBox() {
        return this.bbox;
    }

    hit(r, rayT, hInfo) {
        var tempInfo = new HitInfo();
        var hitAnything = false;
        var closestSoFar = rayT.max;

        for (var object of this.objects) {
            if (object.hit(r, new Interval(rayT.min, closestSoFar), tempInfo)) {
                hitAnything = true;
                closestSoFar = tempInfo.t;
                hInfo = tempInfo;
            }
        }

        return {
            hit: hitAnything,
            hInfo: hInfo
        };
    }
}

