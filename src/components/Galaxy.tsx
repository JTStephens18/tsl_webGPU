import { Sphere } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React, { type FC, useMemo, useState } from "react";
import { MathUtils } from "three";
import * as THREE from 'three/webgpu'

import { Fn, float, vec2, vec3, sin, cos } from 'three/tsl'

export const hash = Fn(([seed]: any) => {
    const h = seed.fract().mul(0.1031);
    return h.mul(h.add(33.33)).mul(h.add(h)).fract();
});

export const rotateXZ = Fn(([p, angle]: any) => {
    const cosA = cos(angle);
    const sinA = sin(angle);
    return vec3(
        p.x.mul(cosA).sub(p.z.mul(sinA)),
        p.y,
        p.x.mul(sinA).add(p.z.mul(cosA))
    );
});

const Galaxy = () => {
    return (
        <mesh>
            <sphereGeometry args={[50, 16, 16]} />
            <meshBasicNodeMaterial
                // colorNode={nodes.sphereColorNode}
                side={THREE.BackSide}
            />
        </mesh>
    );
}

export default Galaxy;