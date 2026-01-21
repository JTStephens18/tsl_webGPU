import { Sphere } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { type FC, useMemo, useState } from "react";
import { MathUtils } from "three";
import { color, mix, positionWorld, positionLocal, uniform, uv, vec3, sin, greaterThan, select, equal } from "three/tsl"

const InteractiveSphere: FC = () => {
    const [isPointerOver, setIsPointerOver] = useState(false);

    const { key, colorNode, positionNode, uHovered, uTime } = useMemo(() => {
        const uHovered = uniform(0.0);

        const uTime = uniform(0.0);

        // New: range is [0 to 1]
        // We multiply by 0.5 (to get -0.5 to 0.5) and add 0.5 (to get 0.0 to 1.0)
        // const gradientFactor = sin(positionLocal.length().mul(20.0).add(uTime)).mul(0.5).add(0.5);
        const gradientFactor = sin(positionLocal.length().mul(20.0).add(uTime.mul(4.0))).mul(0.5).add(0.5).round();

        // const gradientFactor = uv().y.add(uTime).mul(0.5).add(0.5);

        const defaultColor = mix(color("rgba(56, 179, 56, 1)"), color("rgba(4, 18, 211, 1)"), gradientFactor);
        // const defaultColor = color("rgba(56, 179, 56, 1)");
        const hoverColor = mix(color("rgba(255, 100, 0, 1)"), color("rgba(75, 0, 130, 1)"), gradientFactor);
        // const hoverColor = color("rgba(255, 0, 0, 1)");

        // const colorNode = defaultColor;
        // const colorNode = mix(defaultColor, hoverColor, uHovered);
        const colorNode = mix(hoverColor, defaultColor, uHovered);

        const positionNode = positionWorld.sub(vec3(0, 0, 0.7));

        const scaleNode = vec3(1.0, 1.0, 1.0).add(vec3(0.0, 0.0, uHovered));

        const key = colorNode.uuid;
        return { key, colorNode, positionNode, scaleNode, uHovered, uTime };
    }, []);

    useFrame((_, delta) => {
        uHovered.value = MathUtils.damp(
            uHovered.value,
            isPointerOver ? 1.0 : 0.0,
            5,
            delta
        );
        uTime.value += delta;
    });

    return (
        <Sphere
            position={[0, 0, 0]}
            args={[1.5, 40, 40]}
            onPointerEnter={() => {
                document.body.style.cursor = "pointer";
                setIsPointerOver(true);
            }}
            onPointerLeave={() => {
                document.body.style.cursor = "auto";
                setIsPointerOver(false);
            }}
        >
            <meshPhongNodeMaterial
                key={key}
                colorNode={colorNode}
                positionNode={positionNode}
                shininess={100}
            />

        </Sphere>
    )

}

export default InteractiveSphere;
