import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';

const ProductModel = () => {
  // Update the path below to the location of your GLTF model in the public folder
  const { scene } = useGLTF('/models/product.gltf');
  return <primitive object={scene} dispose={null} />;
};

const Product3D = () => {
  return (
    <Canvas style={{ height: '400px', width: '100%' }}>
      {/* Stage provides basic lighting and environment */}
      <Stage environment="city" intensity={0.6}>
        <ProductModel />
      </Stage>
      {/* OrbitControls allows users to rotate the scene */}
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
};

export default Product3D;
