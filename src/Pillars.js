import { Stuff } from "./Stuff"
import { cm1, geo, mat } from "./common";
import { Mesh } from "three";

export class Pillars extends Stuff {
    constructor(info) {
        super(info);

        this.geometry = geo.pillar;
        this.material = mat.pillar;

        this.width = this.geometry.parameters.width;
        this.height = this.geometry.parameters.height;
        this.depth = this.geometry.parameters.depth;

        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.position.set(this.x, this.y, this.z);
        this.mesh.name = this.name;
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        cm1.scene.add(this.mesh);

        this.setCannonBody();

        this.cannonBody.mesh = this.mesh;
        this.cannonBody.mesh.isEnd = false;

        this.cannonBody.addEventListener('collide', endPortal);

        function endPortal(e) {
            if (e.target.mesh.name === 'pillar1') {
                e.target.mesh.isEnd = true;
            }
        }
    }
}