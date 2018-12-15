THREE.GrainPass = function ( width = 1024, height = 1024 ) {

	THREE.Pass.call( this );

	this.material = this.getGrainMaterial();

	this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

	this.time = Number( 1.0 );
	this.width = width;
	this.height = height;
	this.isAnimated = false;
	this.factor = 0.55;

	this.genNoise();

};

THREE.GrainPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.GrainPass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {
		if(this.isAnimated) {
			this.time += 0.0001;
			this.material.uniforms[ "uSeed" ].value = this.time;
		}
		this.material.uniforms[ "tDiffuse" ].value = readBuffer.texture;
		this.material.uniforms[ "tNoise" ].value = this.noiseTexture;
		this.material.uniforms[ "uFact" ].value = this.factor;

		this.quad.material = this.material;

		if ( this.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, this.clear );
		}

	},

	getGrainMaterial: function () {
		return new THREE.ShaderMaterial( {

			defines: {
			},

			uniforms: {
				"tDiffuse": { value: null },
				"tNoise": { value: null },
				"uSeed": { value: 1.0 },
				"uFact": { value: 1.0 },
			},

			vertexShader:
				`
				varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}
				`,

			fragmentShader:
				`
				varying vec2 vUv;
				uniform float uSeed;
				uniform sampler2D tDiffuse;
				uniform sampler2D tNoise;
				uniform float uFact;
				void main() {
					vec4 grain = texture2D(tNoise, vUv);
					float rand = grain.x / 0.6 + fract(uSeed/ 10.0);
					vec2 seed = vec2(rand/ 0.5 + 0.2);
					grain = texture2D(tNoise, seed);
					vec4 color = texture2D(tDiffuse, vUv);
					gl_FragColor = color + grain * uFact;
					// gl_FragColor = vec4(grain / 0.6);
				}
				`
		} );

	},

	genNoise() {
		let sampler = [];
		for(let i = 0; i < this.width * this.height; i++) {
			let rand = 60*Math.random();
			sampler.push(rand, rand, rand);
		}
		this.noiseTexture = new THREE.DataTexture(new Uint8Array(sampler), this.width, this.height, THREE.RGBFormat);
		this.noiseTexture.needsUpdate = true;
	}


} );
