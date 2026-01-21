import { Sphere } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { type FC, useMemo, useState } from "react";
import { MathUtils } from "three";
import { color, mix, positionWorld, uniform, uv, vec3 } from "three/tsl"

const InteractiveSphere: FC = () => {
    const [isPointerOver, setIsPointerOver] = useState(false);

    const { key, colorNode, positionNode, scaleNode, uHovered } = useMemo(() => {
        const uHovered = uniform(0.0);

        const defaultColor = mix(color("#3F4A4B"), color("#7A8BBC"), uv().y);
        const hoverColor = mix(color("#14DCE9"), color("#B462D1"), uv().y);

        const colorNode = mix(defaultColor, hoverColor, uHovered);

        const positionNode = positionWorld.sub(vec3(0, 0, uHovered.oneMinus()));

        const scaleNode = vec3(1.0, 1.0, 1.0).add(vec3(0.0, 0.0, uHovered));

        const key = colorNode.uuid;
        return { key, colorNode, positionNode, scaleNode, uHovered };
    }, []);

    useFrame((_, delta) => {
        uHovered.value = MathUtils.damp(
            uHovered.value,
            isPointerOver ? 1.0 : 0.0,
            5,
            delta
        );
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
            // scaleNode={scaleNode}
            />

        </Sphere>
    )

}

export default InteractiveSphere;
