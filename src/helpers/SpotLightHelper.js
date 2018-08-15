/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 * @author WestLangley / http://github.com/WestLangley
 */

import { Vector3 } from '../math/Vector3.js';
import { Object3D } from '../core/Object3D.js';
import { LineSegments } from '../objects/LineSegments.js';
import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { PointsMaterial } from '../materials/PointsMaterial.js';

function SpotLightHelper( light, color, camera, domElement = document ) {

	Object3D.call( this );

	this.domElement = domElement;
	this.camera = camera;
	var changeEvent = { type: "change" };

	this.light = light;
	this.light.updateMatrixWorld();

	this.matrix = light.matrixWorld;
	this.matrixAutoUpdate = false;

	this.color = color;

	var geometry = new BufferGeometry();

	var ray = new THREE.Raycaster();
	ray.params.Points.threshold = 0.1;

	var positions = [
		0, 0, 0, 	0, 0, 1,
		0, 0, 0, 	1, 0, 1,
		0, 0, 0,	- 1, 0, 1,
		0, 0, 0, 	0, 1, 1,
		0, 0, 0, 	0, - 1, 1
	];

	for ( var i = 0, j = 1, l = 32; i < l; i ++, j ++ ) {

		var p1 = ( i / l ) * Math.PI * 2;
		var p2 = ( j / l ) * Math.PI * 2;

		positions.push(
			Math.cos( p1 ), Math.sin( p1 ), 1,
			Math.cos( p2 ), Math.sin( p2 ), 1
		);

	}

	geometry.addAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );

	var material = new LineBasicMaterial( { fog: false } );

	this.cone = new LineSegments( geometry, material );
	this.add( this.cone );







	// Add handlers

	var angleHandlePositions = [
		// 0, 0, 1,
		1, 0, 1,
		- 1, 0, 1,
		0, 1, 1,
		0, - 1, 1
	];

	var angleHandleGeometry = new BufferGeometry();
	angleHandleGeometry.addAttribute( 'position', new Float32BufferAttribute( angleHandlePositions, 3 ));

	var angleHandleMaterial = new PointsMaterial( { color: 0xFFFF00, size: 6.0, sizeAttenuation: false } );
	this.angleHandle = new THREE.Points( angleHandleGeometry, angleHandleMaterial );
	this.angleHandle.name = 'angleHandler';

	this.cone.add( this.angleHandle )



	// Add plane
	let planeBuffer = new THREE.PlaneBufferGeometry( 100000, 100000, 2, 2 );
	let planeShader = new THREE.MeshBasicMaterial( { visible: true, wireframe: true, side: THREE.DoubleSide, transparent: true, opacity: 0.1 } )
	let plane = new THREE.Mesh(planeBuffer, planeShader);
	plane.position.set(0, 0, 1);
	this.cone.add(plane);


	this.update();


	// normalize mouse / touch pointer and remap {x,y} to view space.

	let getPointer = ( event ) => {

		var pointer = event.changedTouches ? event.changedTouches[ 0 ] : event;

		var rect = domElement.getBoundingClientRect();

		return {
			x: ( pointer.clientX - rect.left ) / rect.width * 2 - 1,
			y: - ( pointer.clientY - rect.top ) / rect.height * 2 + 1,
			button: event.button
		}

	}


	// mouse / touch event handlers
	this.curHandle = null;
	this.isDragging = false;

	let onContext = ( event ) => {

		event.preventDefault();

	}

	let onPointerHover = ( event ) => {

		event.preventDefault();

		let pointer = getPointer( event );

		if ( this.dragging === true || ( pointer.button !== undefined && pointer.button !== 0 )) return;

		ray.setFromCamera( pointer, this.camera );

		var intersect = ray.intersectObjects( [this.angleHandle], true )[ 0 ] || false;

		if ( intersect ) {

			this.curHandle = intersect.object.name;


			// this.handler.material.color.lerp( new THREE.Color( 1, 1, 1 ), 0.5 );
		} else {

			this.curHandle = null;

		}


		// console.log(pointer);

	}

	this.lastRange = null;
	let onPointerDown = ( event ) => {

		if(this.curHandle === null) return;

		event.preventDefault();
		event.stopPropagation();

		this.isDragging = true;

		let pointer = getPointer( event );

		ray.setFromCamera( pointer, this.camera );

		var intersect = ray.intersectObjects( [plane], true )[ 0 ] || false;

		this.lastRange = intersect.point.distanceTo(this.light.target.position);

	}

	let onPointerMove = ( event ) => {

		if( !this.isDragging ) return;

		event.preventDefault();

		event.stopPropagation();

		if ( !this.isDragging ) return;

		let pointer = getPointer( event );

		ray.setFromCamera( pointer, this.camera );

		var intersect = ray.intersectObjects( [plane], true )[ 0 ] || false;
		if( intersect ) {

			let dis = intersect.point.distanceTo(this.light.target.position);
			let delta = dis - this.lastRange;

			this.light.angle += delta * 0.001;

			this.lastRange = dis;

			this.dispatchEvent(changeEvent);

		}



	}

	let onPointerUp = ( event ) => {

		event.preventDefault(); // Prevent MouseEvent on mobile
		this.isDragging = false;

		// scope.pointerUp( getPointer( event ) );

	}

	{

		domElement.addEventListener( "mousedown", onPointerDown, false );
		domElement.addEventListener( "touchstart", onPointerDown, false );
		domElement.addEventListener( "mousemove", onPointerHover, false );
		domElement.addEventListener( "touchmove", onPointerHover, false );
		domElement.addEventListener( "mousemove", onPointerMove, false );
		domElement.addEventListener( "touchmove", onPointerMove, false );
		domElement.addEventListener( "mouseup", onPointerUp, false );
		domElement.addEventListener( "mouseleave", onPointerUp, false );
		domElement.addEventListener( "mouseout", onPointerUp, false );
		domElement.addEventListener( "touchend", onPointerUp, false );
		domElement.addEventListener( "touchcancel", onPointerUp, false );
		domElement.addEventListener( "touchleave", onPointerUp, false );
		domElement.addEventListener( "contextmenu", onContext, false );

	}

}

SpotLightHelper.prototype = Object.create( Object3D.prototype );
SpotLightHelper.prototype.constructor = SpotLightHelper;

SpotLightHelper.prototype.dispose = function () {

	this.cone.geometry.dispose();
	this.cone.material.dispose();

	domElement.removeEventListener( "mousedown", onPointerDown );
	domElement.removeEventListener( "touchstart", onPointerDown );
	domElement.removeEventListener( "mousemove", onPointerHover );
	domElement.removeEventListener( "touchmove", onPointerHover );
	domElement.removeEventListener( "mousemove", onPointerMove );
	domElement.removeEventListener( "touchmove", onPointerMove );
	domElement.removeEventListener( "mouseup", onPointerUp );
	domElement.removeEventListener( "mouseleave", onPointerUp );
	domElement.removeEventListener( "mouseout", onPointerUp );
	domElement.removeEventListener( "touchend", onPointerUp );
	domElement.removeEventListener( "touchcancel", onPointerUp );
	domElement.removeEventListener( "touchleave", onPointerUp );
	domElement.removeEventListener( "contextmenu", onContext );

};

SpotLightHelper.prototype.update = function () {

	var vector = new Vector3();
	var vector2 = new Vector3();

	return function update() {

		this.light.updateMatrixWorld();

		var coneLength = this.light.distance ? this.light.distance : 1000;
		var coneWidth = coneLength * Math.tan( this.light.angle );

		this.cone.scale.set( coneWidth, coneWidth, coneLength );

		vector.setFromMatrixPosition( this.light.matrixWorld );
		vector2.setFromMatrixPosition( this.light.target.matrixWorld );

		this.cone.lookAt( vector2.sub( vector ) );

		if ( this.color !== undefined ) {

			this.cone.material.color.set( this.color );

		} else {

			this.cone.material.color.copy( this.light.color );

		}

	};

}();


export { SpotLightHelper };
