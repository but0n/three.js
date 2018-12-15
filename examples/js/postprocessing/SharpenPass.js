/**
 * @author but0n / https://github.com/but0n
 */

THREE.SharpenPass = function () {

	THREE.Pass.call( this );

	this.material = this.getVignettingMaterial();

	this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

	this.sharpness = Number( 0 );

};

THREE.SharpenPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.SharpenPass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		this.material.uniforms[ "tDiffuse" ].value = readBuffer.texture;
		this.material.uniforms[ "uSharpness" ].value = this.sharpness;

		this.quad.material = this.material;

		if ( this.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		}

	},

	getVignettingMaterial: function () {

		return new THREE.ShaderMaterial( {

			defines: {
			},

			uniforms: {
				"tDiffuse": { value: null },
				"tSize": { value: new THREE.Vector2( 1024, 1024 ) },
				// "uVignetting": { value: null },
				"uSharpness": { value: 0.0 }
			},

			vertexShader:
				`
				varying vec2 vUV;
				void main() {
					vUV = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}
				`,

			fragmentShader:
				`
				varying vec2 vUV;
				uniform sampler2D tDiffuse;
				uniform vec2 tSize;	//TexelSize
				uniform float uSharpness;

				vec3 sharpen(vec2 uv) {
					vec2 TexelSize = 1.0 / tSize * uSharpness;
					vec4 sum = texture2D(tDiffuse, vec2(-1, -1) * TexelSize + uv) * -1.
							+ texture2D(tDiffuse, vec2(-1,  0) * TexelSize + uv) * -1.
							+ texture2D(tDiffuse, vec2(-1,  1) * TexelSize + uv) * -1.
							+ texture2D(tDiffuse, vec2( 0, -1) * TexelSize + uv) * -1.
							+ texture2D(tDiffuse, vec2( 0,  0) * TexelSize + uv) *  9.
							+ texture2D(tDiffuse, vec2( 0,  1) * TexelSize + uv) * -1.
							+ texture2D(tDiffuse, vec2( 1, -1) * TexelSize + uv) * -1.
							+ texture2D(tDiffuse, vec2( 1,  0) * TexelSize + uv) * -1.
							+ texture2D(tDiffuse, vec2( 1,  1) * TexelSize + uv) * -1.;

					return sum.rgb;
				}

				void main() {
					vec4 color = texture2D(tDiffuse, vUV);
					vec3 sharp = sharpen(vUV);
					gl_FragColor = vec4(sharp.rgb, 1);
				}
				`
		} );

	},


} );
