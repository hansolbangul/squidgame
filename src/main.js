import { cm1, cm2 } from './common';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Pillars } from './Pillars';
import { Floors } from './Floors';
import { Bars } from './Bars';
import { SideLight } from './SideLights';
import { Glass } from './Glass';
import { Player } from './Player';
import { PreventDragClick } from './PreventDragClick';
import { EndPortal } from './EndPortal';

// ----- 주제: The Bridge 게임 만들기

const button = document.querySelectorAll('#reset');
const div = document.querySelector('#clear');

// Renderer
const canvas = document.querySelector('#three-canvas');
const renderer = new THREE.WebGLRenderer({
	canvas,
	antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// cm1.scene
cm1.scene.background = new THREE.Color(cm2.backgroundColor);

// Camera
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);

camera.position.y = 19;
camera.position.z = 14;

cm1.scene.add(camera);

// Light
const ambientLight = new THREE.AmbientLight(cm2.lightColor, 1);
cm1.scene.add(ambientLight);

const spotLightDistance = 50;

const spotLight1 = new THREE.SpotLight(cm2.lightColor, 1.4);
spotLight1.castShadow = true;
const spotLight2 = spotLight1.clone();
const spotLight3 = spotLight1.clone();
const spotLight4 = spotLight1.clone();

spotLight1.position.set(-spotLightDistance, spotLightDistance, spotLightDistance);
spotLight2.position.set(spotLightDistance, spotLightDistance, spotLightDistance);
spotLight3.position.set(-spotLightDistance, spotLightDistance, -spotLightDistance);
spotLight4.position.set(spotLightDistance, spotLightDistance, -spotLightDistance);

cm1.scene.add(spotLight1, spotLight2, spotLight3, spotLight4)

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 물리 엔진
cm1.world.gravity.set(0, -10, 0);

const defaultContactMaterial = new CANNON.ContactMaterial(
	cm1.defaultMaterial,
	cm1.defaultMaterial,
	{
		friction: 0.3,
		restitution: 0.2
	}
);

const glassDefaultContactMaterial = new CANNON.ContactMaterial(
	cm1.glassMaterial,
	cm1.defaultMaterial,
	{
		friction: 0.01,
		restitution: 0
	}
);

const playerGlassContactMaterial = new CANNON.ContactMaterial(
	cm1.glassMaterial,
	cm1.playerMaterial,
	{
		friction: 1,
		restitution: 0
	}
);

cm1.world.defaultContactMaterial = defaultContactMaterial;
cm1.world.addContactMaterial(glassDefaultContactMaterial);
cm1.world.addContactMaterial(playerGlassContactMaterial);

// 물체 만들기
const glassUnitSize = 1.2;
const numberOfGlass = 10;
const objects = [];

// 바닥
const floor = new Floors({
	name: 'floor',
})

// 기둥
const pillar1 = new Pillars({
	name: 'pillar1',
	x: 0,
	y: 5.5,
	z: -glassUnitSize * 12 - glassUnitSize / 2,
});
const pillar2 = new Pillars({
	name: 'pillar',
	x: 0,
	y: 5.5,
	z: glassUnitSize * 12 + glassUnitSize / 2,
});
objects.push(pillar1, pillar2);

// 바
const bar1 = new Bars({
	name: 'bar',
	x: -1.6,
	y: 10.3,
	z: 0
});
const bar2 = new Bars({
	name: 'bar',
	x: -0.4,
	y: 10.3,
	z: 0
});
const bar3 = new Bars({
	name: 'bar',
	x: 1.6,
	y: 10.3,
	z: 0
});
const bar4 = new Bars({
	name: 'bar',
	x: 0.4,
	y: 10.3,
	z: 0
});

const sideLights = [];
for (let i = 0; i < 49; i++) {
	sideLights.push(new SideLight({
		name: 'sideLight',
		container: bar1.mesh,
		z: i * 0.5 - glassUnitSize * 10,
	}))

}

for (let i = 0; i < 49; i++) {
	sideLights.push(new SideLight({
		name: 'sideLight',
		container: bar3.mesh,
		z: i * 0.5 - glassUnitSize * 10,
	}))

}

// 유리판
let glassTypeNumber = 0;
let glassTypes = [];
const glassZ = [];
for (let i = 0; i < numberOfGlass; i++) {
	glassZ.push(-(i * glassUnitSize * 2 - glassUnitSize * 9));
}
for (let i = 0; i < numberOfGlass; i++) {
	glassTypeNumber = Math.round(Math.random());
	switch (glassTypeNumber) {
		case 0:
			glassTypes = ['normal', 'strong'];
			break;
		case 1:
			glassTypes = ['strong', 'normal'];
			break;
	}
	const glass1 = new Glass({
		step: i + 1,
		name: `glass-${glassTypes[0]}`,
		x: -1,
		y: 10.5,
		z: glassZ[i],
		type: glassTypes[0],
		cannonMaterial: cm1.glassMaterial
	})

	const glass2 = new Glass({
		step: i + 1,
		name: `glass-${glassTypes[1]}`,
		x: 1,
		y: 10.5,
		z: glassZ[i],
		type: glassTypes[1],
		cannonMaterial: cm1.glassMaterial
	})

	objects.push(glass1, glass2);
}

// 플레이어
let play = { height: 10.9, speed: 0.03, turnSpeed: Math.PI * 0.02 };
const player = new Player({
	name: 'player',
	x: 0,
	y: play.height,
	z: 13,
	rotationY: Math.PI,
	cannonMaterial: cm1.playerMaterial,
	mass: 30
});
objects.push(player);

// 포탈
const portal = new EndPortal({
	name: 'portal',
	x: 0,
	y: play.height - 0.3,
	z: -16,
	rotationX: -(Math.PI / 2),
});
objects.push(portal);

// RayCaster
// const raycaster = new THREE.Raycaster();
// const mouse = new THREE.Vector2();
// function checkIntersects() {
// 	raycaster.setFromCamera(mouse, camera);
// 	const intersects = raycaster.intersectObjects(cm1.scene.children);

// 	const div = document.querySelectorAll('#clear');

// 	div[0].style.top = '0%';

// 	const timerId = setTimeout(() => {
// 		div[0].style.animation = 'rotate_image 6s linear infinite';

// 		clearTimeout(timerId);
// 	}, 1000);
// }

// 그리기
const clock = new THREE.Clock();
let jumpCan = 1;
let velocity_y = 0;

function draw() {
	const delta = clock.getDelta();

	if (cm1.mixer) cm1.mixer.update(delta);

	cm1.world.step(1 / 60, delta, 3);
	if (keyPress[87] || keyPress[38]) { // 키보드 w
		player.cannonBody.position.z -= play.speed;
	}
	if (keyPress[83] || keyPress[40]) { // 키보드 s
		player.cannonBody.position.z += play.speed;
	}
	if (keyPress[65] || keyPress[37]) { // 키보드 a
		player.cannonBody.position.x -= play.speed;
	}
	if (keyPress[68] || keyPress[39]) { // 키보드 d
		player.cannonBody.position.x += play.speed;
	}
	if (keyPress[32] && jumpCan === 1 && player.cannonBody.position.y > 10) {
		player.actions[2].stop();
		player.actions[2].play();
		jumpCan = 0;
		velocity_y = player.cannonBody.position.y + 3;
	}

	objects.forEach(item => {
		if (item.name === 'pillar1' && item.cannonBody?.mesh.isEnd) {

			div.style.top = '0%';

			const timerId = setTimeout(() => {
				div.style.animation = 'rotate_image 6s linear infinite';

				clearTimeout(timerId);
			}, 1000);
		}
		if (item.cannonBody) {
			if (item.name === 'player') {
				player.modelMesh.position.copy(player.cannonBody.position);
			} else {
				if (item.mesh) {
					item.mesh.position.copy(item.cannonBody.position);
					item.mesh.quaternion.copy(item.cannonBody.quaternion);
				} else if (item.modelMesh) {
					item.modelMesh.position.copy(item.cannonBody.position);
					item.modelMesh.quaternion.copy(item.cannonBody.quaternion);

				}

			}
		}

	})

	if (player.modelMesh) {
		// 점프
		player.cannonBody.position.y += velocity_y * delta;
		if (jumpCan === 0) {
			velocity_y -= 9.8 * 2 * delta;
			if (9.9 <= player.cannonBody.position.y && player.cannonBody.position.y <= play.height) {
				jumpCan = 1;
				velocity_y = 0;
				player.cannonBody.position.y = play.height;
			}
		} else if (player.cannonBody.position.y < 5.9) {
			setTimeout(() => {
				div.style.top = '0%';

				const timerId = setTimeout(() => {
					div.style.animation = 'rotate_image 6s linear infinite';

					clearTimeout(timerId);
				}, 1000);

			}, 4000)
		}

		camera.position.set(player.modelMesh.position.x, player.modelMesh.position.y + 7, player.modelMesh.position.z + 6);
		camera.lookAt(player.modelMesh.position);
	}

	// controls.update();

	renderer.render(cm1.scene, camera);
	renderer.setAnimationLoop(draw);
}

// 움직이기
let keyPress = {};
function keyDown(e) {
	keyPress[e.keyCode] = true;
};
function ketUp(e) {
	keyPress[e.keyCode] = false
};

function setSize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.render(cm1.scene, camera);
}

// 이벤트
window.addEventListener('resize', setSize);
window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', ketUp)
button[0].addEventListener('click', () => {
	window.location.reload();
})

// canvas.addEventListener('click', e => {
// 	if (PreventDragClick.mouseMoved) return;
// 	mouse.x = e.clientX / canvas.clientWidth * 2 - 1;
// 	mouse.y = -(e.clientY / canvas.clientHeight * 2 - 1);
// 	checkIntersects();
// });

draw();
