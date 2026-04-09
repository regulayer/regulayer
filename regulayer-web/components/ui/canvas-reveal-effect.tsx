"use client";
import { cn } from "@/lib/utils";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import React, { useMemo, useRef } from "react";
import * as THREE from "three";

export const CanvasRevealEffect = ({
    animationSpeed = 0.4,
    opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1],
    colors = [[0, 255, 255]],
    containerClassName,
    dotSize,
    showGradient = true,
}: {
    animationSpeed?: number;
    opacities?: number[];
    colors?: number[][];
    containerClassName?: string;
    dotSize?: number;
    showGradient?: boolean;
}) => {
    return (
        <div className={cn("h-full relative bg-white w-full", containerClassName)}>
            <div className="h-full w-full">
                <DotMatrix
                    colors={colors ?? [[0, 255, 255]]}
                    dotSize={dotSize ?? 3}
                    opacities={
                        opacities ?? [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1]
                    }
                    shader={`
              float animation_speed_factor = ${animationSpeed.toFixed(1)};
              float intro_offset = distance(u_resolution / 2.0 / u_total_size, st2);
              mix_value = distance(st2, vec2(0.0, 1.0));
              float run_s = u_time * animation_speed_factor;
              float cut_off_weight = 4.0 * run_s + 100.0;
              cut_off = cut_off_weight * cut_off;
              inserted_value = cut_off;
              spread = 10.0;
              fixed_value = 1.0;
              color_value = 1.75;
            `}
                    center={["x", "y"]}
                />
            </div>
            {showGradient && (
                <div className="absolute inset-0 bg-gradient-to-t from-white to-white/0 dark:from-black dark:to-black/0" />
            )}
        </div>
    );
};

interface DotMatrixProps {
    colors?: number[][];
    opacities?: number[];
    totalSize?: number;
    dotSize?: number;
    shader?: string;
    center?: ("x" | "y")[];
}

const DotMatrix: React.FC<DotMatrixProps> = ({
    colors = [[0, 0, 0]],
    opacities = [0.04, 0.04, 0.04, 0.04, 0.04, 0.08, 0.08, 0.08, 0.08, 0.14],
    totalSize = 4,
    dotSize = 2,
    shader = "",
    center = ["x", "y"],
}) => {
    const uniforms = React.useMemo(() => {
        let colorsArray = [
            colors[0],
            colors[0],
            colors[0],
            colors[0],
            colors[0],
            colors[0],
        ];
        if (colors.length === 2) {
            colorsArray = [
                colors[0],
                colors[0],
                colors[0],
                colors[1],
                colors[1],
                colors[1],
            ];
        } else if (colors.length === 3) {
            colorsArray = [
                colors[0],
                colors[0],
                colors[1],
                colors[1],
                colors[2],
                colors[2],
            ];
        }

        return {
            u_colors: {
                value: colorsArray.map((color) => [
                    color[0] / 255,
                    color[1] / 255,
                    color[2] / 255,
                ]),
                type: "uniform3fv",
            },
            u_opacities: {
                value: opacities,
                type: "uniform1fv",
            },
            u_total_size: {
                value: totalSize,
                type: "uniform1f",
            },
            u_dot_size: {
                value: dotSize,
                type: "uniform1f",
            },
        };
    }, [colors, opacities, totalSize, dotSize]);

    return (
        <Shader
            source={`
        precision mediump float;
        in vec2 fragCoord;

        uniform float u_time;
        uniform float u_opacities[10];
        uniform vec3 u_colors[6];
        uniform float u_total_size;
        uniform float u_dot_size;
        uniform vec2 u_resolution;

        out vec4 fragColor;

        float PHI = 1.61803398874989484820459;

        float random(vec2 xy) {
            return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
        }

        float map(float value, float min1, float max1, float min2, float max2) {
            return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
        }

        void main() {
            vec2 st = fragCoord.xy;
            float ${center.includes("x") ? "center_x" : "idk_x"} = st.x / u_total_size;
            float ${center.includes("y") ? "center_y" : "idk_y"} = st.y / u_total_size;
            float center_x = st.x / u_total_size;
            float center_y = st.y / u_total_size;

            bool is_even_x = int(center_x) % 2 == 0;
            bool is_even_y = int(center_y) % 2 == 0;

            float x_pixel = u_dot_size * (u_resolution.x / 1000.0);
            float y_pixel = u_dot_size * (u_resolution.y / 1000.0);

            float x_offset = (center_x - float(int(center_x))) * u_total_size;
            float y_offset = (center_y - float(int(center_y))) * u_total_size;

            if (x_offset > x_pixel && x_offset < u_total_size - x_pixel && 
                y_offset > y_pixel && y_offset < u_total_size - y_pixel) {
               discard;
            }

            vec2 st2 = vec2(
                int(center_x) * u_total_size,
                int(center_y) * u_total_size
            );

            float opacity = map(random(st2), 0.0, 1.0, 0.0, 1.0);
            float opacity_sum = 0.0;
            int opacity_index = int(map(opacity, 0.0, 1.0, 0.0, 10.0));
            opacity_sum = u_opacities[opacity_index];

            float mix_value = 0.0;
            float cut_off = 0.0;
            float inserted_value = 0.0;
            float spread = 0.0;
            float fixed_value = 0.0;
            float color_value = 0.0;

            ${shader}

            vec3 color = u_colors[int(map(color_value, 0.0, 6.0, 0.0, 6.0))];

            if (inserted_value > cut_off) {
              opacity_sum = 0.0;
            }

            fragColor = vec4(color, opacity_sum);
        }
      `}
            uniforms={uniforms}
            maxFps={60}
        />
    );
};

type Uniforms = {
    [key: string]: {
        value: number[] | number[][] | number;
        type: string;
    };
};

const ShaderMaterial = ({
    source,
    uniforms,
    maxFps = 60,
}: {
    source: string;
    uniforms: Uniforms;
    maxFps?: number;
}) => {
    const { size } = useThree();
    const ref = useRef<THREE.ShaderMaterial>(null);
    let lastFrameTime = 0;

    useFrame(({ clock }) => {
        if (!ref.current) return;
        const timestamp = clock.getElapsedTime();
        if (timestamp - lastFrameTime < 1 / maxFps) {
            return;
        }
        lastFrameTime = timestamp;

        const material = ref.current;
        if (material.uniforms.u_time) {
            material.uniforms.u_time.value = timestamp;
        }
    });

    const getUniforms = () => {
        const preparedUniforms: any = {};

        for (const uniformName in uniforms) {
            const uniform: any = uniforms[uniformName];

            switch (uniform.type) {
                case "uniform1f":
                    preparedUniforms[uniformName] = { value: uniform.value, type: "1f" };
                    break;
                case "uniform3fv":
                    preparedUniforms[uniformName] = {
                        value: new THREE.Vector3().fromArray(
                            (uniform.value as number[]).reduce(
                                (acc, val) => acc.concat(val),
                                [] as number[]
                            )
                        ),
                        type: "3fv",
                    };
                    break;
                case "uniform1fv":
                    preparedUniforms[uniformName] = { value: uniform.value, type: "1fv" };
                    break;
            }
        }

        preparedUniforms["u_time"] = { value: 0, type: "1f" };
        preparedUniforms["u_resolution"] = {
            value: new THREE.Vector2(size.width * 2, size.height * 2),
        }; // Initialize u_resolution
        return preparedUniforms;
    };

    const material = useMemo(() => {
        return new THREE.ShaderMaterial({
            vertexShader: `
      precision mediump float;
      in vec2 position;
  
      out vec2 fragCoord;
  
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
        fragCoord = position;
      }
      `,
            fragmentShader: source,
            uniforms: getUniforms(),
            glslVersion: THREE.GLSL3,
            blending: THREE.CustomBlending,
            blendSrc: THREE.SrcAlphaFactor,
            blendDst: THREE.OneFactor,
        });
    }, [size.width, size.height, source]);

    return <mesh material={material} />;
};

const Shader = ({
    source,
    uniforms,
    maxFps = 60,
}: {
    source: string;
    uniforms: Uniforms;
    maxFps?: number;
}) => {
    return (
        <Canvas className="absolute inset-0  h-full w-full">
            <ShaderMaterial source={source} uniforms={uniforms} maxFps={maxFps} />
        </Canvas>
    );
};
