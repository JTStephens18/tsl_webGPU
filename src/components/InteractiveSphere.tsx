import { Sphere } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React, { type FC, useMemo, useState } from "react";
import { MathUtils } from "three";
import { pass, texture, color, mix, positionWorld, positionLocal, normalLocal, uniform, uv, vec3, mod, floor, fract, sin, array, greaterThan, select, equal, screenSize, cameraProjectionMatrix, cameraViewMatrix, varying, vec2, vec4, float, attribute, Fn, viewportResolution } from "three/tsl"

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
        const hoverColor = mix(color("rgba(255, 100, 0, 1)"), color("rgba(209, 10, 183, 1)"), gradientFactor);
        // const hoverColor = color("rgba(255, 0, 0, 1)");

        // const colorNode = defaultColor;
        const colorNode = mix(defaultColor, hoverColor, uHovered);
        // const colorNode = mix(hoverColor, defaultColor, uHovered);
        // const colorNode = color("rgba(56, 179, 56, 1)");

        // const positionNode = positionWorld.sub(vec3(0, 0, 0.7));
        const pos = positionLocal;
        const norm = normalLocal;

        const displacement = sin(uTime.mul(3.0).add(pos.y.mul(5.0))).mul(0.1);

        const positionNode = pos.add(norm.mul(displacement));

        // ---- Vertex Snapping

        // const affineUv = varying(vec2());
        // const w = varying(float());


        // // 2. Wrap imperative logic (assignments) inside Fn()
        // const vertexLogic = Fn(() => {
        //     const defaultPos = cameraProjectionMatrix.mul(cameraViewMatrix).mul(positionWorld);

        //     const roundedPos = defaultPos.xy
        //         .div(defaultPos.ww.mul(2))
        //         .mul(screenSize.xy)
        //         .round()
        //         .div(screenSize.xy)
        //         .mul(defaultPos.ww.mul(2));

        //     // .assign() is now valid because we are inside Fn()
        //     affineUv.assign(attribute('uv').mul(defaultPos.w));
        //     w.assign(defaultPos.w);

        //     return vec4(roundedPos.xy, defaultPos.zw);
        // });

        // 3. Execute the function to get the actual Node output
        // const positionNode = vertexLogic();

        // ---- 

        const scaleNode = vec3(1.0, 1.0, 1.0).add(vec3(0.0, 0.0, uHovered));

        const key = colorNode.uuid;
        return { key, colorNode, positionNode, scaleNode, uHovered, uTime };
    }, []);

    const { ditheredColor } = useMemo(() => {

        const { scene, camera } = useThree();

        const scenePass = pass(scene, camera);

        const inputBuffer = scenePass.getTextureNode();

        const uPixelSize = uniform(4.0);
        const uMaskBorder = uniform(0.9);

        // const ditherEffect = Fn((rgbCellUv: any, colorRGB: any) => {
        //     const bayerData = [
        //         0.0/64.0, 48.0/64.0, 12.0/64.0, 60.0/64.0,  3.0/64.0, 51.0/64.0, 15.0/64.0, 63.0/64.0,
        //         32.0/64.0, 16.0/64.0, 44.0/64.0, 28.0/64.0, 35.0/64.0, 19.0/64.0, 47.0/64.0, 31.0/64.0,
        //         8.0/64.0, 56.0/64.0,  4.0/64.0, 52.0/64.0, 11.0/64.0, 59.0/64.0,  7.0/64.0, 55.0/64.0,
        //         40.0/64.0, 24.0/64.0, 36.0/64.0, 20.0/64.0, 43.0/64.0, 27.0/64.0, 39.0/64.0, 23.0/64.0,
        //         2.0/64.0, 50.0/64.0, 14.0/64.0, 62.0/64.0,  1.0/64.0, 49.0/64.0, 13.0/64.0, 61.0/64.0,
        //         34.0/64.0, 18.0/64.0, 46.0/64.0, 30.0/64.0, 33.0/64.0, 17.0/64.0, 45.0/64.0, 29.0/64.0,
        //         10.0/64.0, 58.0/64.0,  6.0/64.0, 54.0/64.0,  9.0/64.0, 57.0/64.0,  5.0/64.0, 53.0/64.0,
        //         42. ];

        //     const bayerMatrix = array(bayerData, 'float');
        // })

        let pixel = vec2(uv(), viewportResolution);
        let coord = vec2(pixel).div(uPixelSize);
        let subCoord = coord.mul(vec2(3, 1));
        let cellOffset = vec2(0, mod(floor(coord.x), 3.0).mul(0.5));

        const ind = mod(floor(subCoord.x), 3.0);
        const maskColor = vec3(ind.equal(0.0), ind.equal(1.0), ind.equal(2.0)).mul(2.0);

        const cellUv = vec2(fract(subCoord.add(cellOffset).mul(2.0).sub(1.0)));
        const border = vec2(float(1.0).sub(cellUv).mul(cellUv).mul(uMaskBorder));

        maskColor.rgb = maskColor.rgb.mul(border);

        const rgbCellUv = vec2(floor(coord.add(cellOffset)).mul(uPixelSize).div(viewportResolution));

        const color1 = vec4(texture(inputBuffer, rgbCellUv));
        color1.rgb = color1.rgb.mul(maskColor);

        const ditheredColor = colorNode;
        return { ditheredColor };
    }, [colorNode]);

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
