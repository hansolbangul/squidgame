import { Stuff } from "./Stuff"
import { cm1 } from "./common";
import { AnimationMixer, Mesh } from "three";

export class EndPortal extends Stuff {
    constructor(info) {
        super(info);

        this.width = 0.5;
        this.height = 0.5;
        this.depth - 0.5;


        cm1.gltfLoader.load(
            '/models/marshal.glb',
            glb => {
                // shadow
                glb.scene.traverse(child => {
                    if (child.isMesh) {
                        child.castShadow = true;
                    }
                })
                this.modelMesh = glb.scene.children[0];
                this.modelMesh.scale.set(0.3, 0.3, 0.3);
                this.modelMesh.position.set(this.x, this.y, this.z);
                this.modelMesh.rotation.set(this.rotationX, this.rotationY, this.rotationZ)
                this.modelMesh.castShadow = true;
                this.modelMesh.name = this.name;
                this.modelMesh.visible = false;

                cm1.scene.add(this.modelMesh);
            }
        );

        // this.mesh = new Mesh(this.geometry, this.material);
        // this.mesh.position.set(this.x, this.y, this.z);
        // this.mesh.castShadow = true;
        // this.mesh.receiveShadow = true;

        // cm1.scene.add(this.mesh);
    }
}