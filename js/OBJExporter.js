// js/OBJExporter.js - Versão Compatível com Three.js r128+
( function () {

	class OBJExporter {

		parse( object ) {

			let output = '';
			let indexVertex = 0;
			let indexVertexUvs = 0;
			let indexNormals = 0;
			const vertex = new THREE.Vector3();
			const color = new THREE.Color();
			const normal = new THREE.Vector3();
			const uv = new THREE.Vector2();
			const face = [];

			function parseMesh( mesh ) {

				let nbVertex = 0;
				let nbNormals = 0;
				let nbVertexUvs = 0;
				const geometry = mesh.geometry;
				const material = mesh.material;

				// REMOVIDO: Verificação de THREE.Geometry (não existe mais no r128)
				
				if ( geometry instanceof THREE.BufferGeometry ) {

					// shortcuts
					const vertices = geometry.getAttribute( 'position' );
					const normals = geometry.getAttribute( 'normal' );
					const uvs = geometry.getAttribute( 'uv' );
					const indices = geometry.getIndex();

					output += 'o ' + mesh.name + '\n';

					if ( material && material.name ) {
						output += 'usemtl ' + material.name + '\n';
					}

					// vertices
					if ( vertices !== undefined ) {
						for ( let i = 0, l = vertices.count; i < l; i ++ ) {
							vertex.x = vertices.getX( i );
							vertex.y = vertices.getY( i );
							vertex.z = vertices.getZ( i );
							vertex.applyMatrix4( mesh.matrixWorld );
							output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';
							nbVertex ++;
						}
					}

					// uvs
					if ( uvs !== undefined ) {
						for ( let i = 0, l = uvs.count; i < l; i ++ ) {
							uv.x = uvs.getX( i );
							uv.y = uvs.getY( i );
							output += 'vt ' + uv.x + ' ' + uv.y + '\n';
							nbVertexUvs ++;
						}
					}

					// normals
					if ( normals !== undefined ) {
						normalMatrixWorld.getNormalMatrix( mesh.matrixWorld );
						for ( let i = 0, l = normals.count; i < l; i ++ ) {
							normal.x = normals.getX( i );
							normal.y = normals.getY( i );
							normal.z = normals.getZ( i );
							normal.applyMatrix3( normalMatrixWorld ).normalize();
							output += 'vn ' + normal.x + ' ' + normal.y + ' ' + normal.z + '\n';
							nbNormals ++;
						}
					}

					// faces
					if ( indices !== null ) {
						for ( let i = 0, l = indices.count; i < l; i += 3 ) {
							for ( let m = 0; m < 3; m ++ ) {
								const j = indices.getX( i + m ) + 1;
								face[ m ] = ( indexVertex + j ) + 
                                            ( normals || uvs ? '/' + ( uvs ? ( indexVertexUvs + j ) : '' ) + ( normals ? '/' + ( indexNormals + j ) : '' ) : '' );
							}
							output += 'f ' + face.join( ' ' ) + '\n';
						}
					} else {
						for ( let i = 0, l = vertices.count; i < l; i += 3 ) {
							for ( let m = 0; m < 3; m ++ ) {
								const j = i + m + 1;
								face[ m ] = ( indexVertex + j ) + 
                                            ( normals || uvs ? '/' + ( uvs ? ( indexVertexUvs + j ) : '' ) + ( normals ? '/' + ( indexNormals + j ) : '' ) : '' );
							}
							output += 'f ' + face.join( ' ' ) + '\n';
						}
					}

					indexVertex += nbVertex;
					indexVertexUvs += nbVertexUvs;
					indexNormals += nbNormals;
				}
			}

			function parseLine( line ) {
				let nbVertex = 0;
				const geometry = line.geometry;
				const type = line.type;

				if ( geometry instanceof THREE.BufferGeometry ) {
					const vertices = geometry.getAttribute( 'position' );
					output += 'o ' + line.name + '\n';

					if ( vertices !== undefined ) {
						for ( let i = 0, l = vertices.count; i < l; i ++ ) {
							vertex.x = vertices.getX( i );
							vertex.y = vertices.getY( i );
							vertex.z = vertices.getZ( i );
							vertex.applyMatrix4( line.matrixWorld );
							output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';
							nbVertex ++;
						}
					}

					if ( type === 'Line' ) {
						output += 'l ';
						for ( let j = 1, l = vertices.count; j <= l; j ++ ) {
							output += ( indexVertex + j ) + ' ';
						}
						output += '\n';
					}

					if ( type === 'LineSegments' ) {
						for ( let j = 1, k = j + 1, l = vertices.count; j < l; j += 2, k = j + 1 ) {
							output += 'l ' + ( indexVertex + j ) + ' ' + ( indexVertex + k ) + '\n';
						}
					}
					indexVertex += nbVertex;
				}
			}

			function parsePoints( points ) {
				let nbVertex = 0;
				const geometry = points.geometry;

				if ( geometry instanceof THREE.BufferGeometry ) {
					const vertices = geometry.getAttribute( 'position' );
					output += 'o ' + points.name + '\n';

					if ( vertices !== undefined ) {
						for ( let i = 0, l = vertices.count; i < l; i ++ ) {
							vertex.x = vertices.getX( i );
							vertex.y = vertices.getY( i );
							vertex.z = vertices.getZ( i );
							vertex.applyMatrix4( points.matrixWorld );
							output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';
							nbVertex ++;
						}
					}

					output += 'p ';
					for ( let j = 1, l = vertices.count; j <= l; j ++ ) {
						output += ( indexVertex + j ) + ' ';
					}
					output += '\n';
					indexVertex += nbVertex;
				}
			}

			object.traverse( function ( child ) {
				if ( child.isMesh ) parseMesh( child );
				if ( child.isLine ) parseLine( child );
				if ( child.isPoints ) parsePoints( child );
			} );

			return output;
		}
	}
    
    const normalMatrixWorld = new THREE.Matrix3();
	THREE.OBJExporter = OBJExporter;

} )();