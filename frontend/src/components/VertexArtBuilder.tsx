import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, invalidate, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { useAuth, useUser } from '@clerk/clerk-react';
import { createVertexArt } from '../artService';

type Vertex = [number, number, number];
type Edge = [number, number];

type ArtState = "draft" | "loading" | "published"

const CustomGraph: React.FC = () => {
    const [numVertices, setNumVertices] = useState(4);
    const [lineColor, setLineColor] = useState<string>('#000000');
    const [nodeColor, setNodeColor] = useState<string>('#000000');
    const [artState, setArtState] = useState<ArtState>("draft")
    const { getToken } = useAuth();

    const handleVtxSave = async (numVertices: number, nodeColor: string, lineColor: string) => {
        const token = await getToken();
        if (!token) {
            console.error("No token found");
            return;
        }
        setArtState("loading");
        setArtState("published")

        try {
            const newArt = await createVertexArt(numVertices, nodeColor, lineColor, token);
            console.log("New Art saved as:", newArt);
        } catch (error) {
            console.error("Error saving new art:", error);
        }

    };
    if (artState === "loading") {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    Loading
                    <span className="ellipsis">
                        <span>.</span>
                        <span>.</span>
                        <span>.</span>
                    </span>
                </div>
                <style>
                    {`
                        @keyframes ellipsis {
                            0% {
                                opacity: 0;
                            }
                            33% {
                                opacity: 1;
                            }
                            66% {
                                opacity: 0;
                            }
                        }
                        .ellipsis span {
                            animation: ellipsis 1s infinite;
                        }
                        .ellipsis span:nth-child(1) {
                            animation-delay: 0s;
                        }
                        .ellipsis span:nth-child(2) {
                            animation-delay: 0.33s;
                        }
                        .ellipsis span:nth-child(3) {
                            animation-delay: 0.66s;
                        }
                    `}
                </style>
            </div>
        );
    }

    if (artState === "published") {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', flexDirection: 'column' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'green' }}>
                    Your art has been successfully published!
                </div>
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <button onClick={() => {
                        setArtState("draft")
                        setNumVertices(4)
                        setLineColor("#000000")
                        setNodeColor("#000000")
                    }} style={{ padding: '10px', border: '1px solid green', backgroundColor: 'white', color: 'green', cursor: 'pointer' }}>
                        Create Another Art
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}>
                <div>
                    <div style={{ marginBottom: '20px', fontSize: '1rem' }}>
                        <label>
                            <b>Vertices (must be even and ≥ 4):</b>
                            <input
                                type="number"
                                min={4}
                                max={112}
                                step={2}
                                value={numVertices}
                                onChange={(e) => {
                                    let value = parseInt(e.target.value);
                                    if (value % 2 !== 0) value += 1;
                                    setNumVertices(Math.min(112, Math.max(4, value)));
                                }}
                                style={{ fontSize: '1rem', padding: '0.5rem', marginLeft: '5px' }}
                            />
                        </label>
                    </div>
                    <div style={{ marginBottom: '20px', fontSize: '1rem' }}>
                        <label>
                            <b>Line Color:</b>
                            <input
                                type="color"
                                value={lineColor}
                                onChange={(e) => setLineColor(e.target.value)}
                                style={{ fontSize: '1rem', padding: '0.5rem', marginLeft: '5px' }}
                            />
                        </label>
                        <label style={{ marginLeft: '20px' }}>
                            <b>Node Color:</b>
                            <input
                                type="color"
                                value={nodeColor}
                                onChange={(e) => setNodeColor(e.target.value)}
                                style={{ width: '30px', height: '30px', marginLeft: '5px' }}
                            />
                        </label>
                    </div>
                    <VertexArtDrawer numVertices={numVertices} lineColor={lineColor} nodeColor={nodeColor} />
                    <button
                        onClick={() => handleVtxSave(numVertices, nodeColor, lineColor)}
                        style={{ marginTop: '20px' }}
                    >
                        Save Vertex Art
                    </button>
                </div>
            </div>
        </>
    );
};


const Graph = ({ numVertices, nodeColor, lineColor }: GraphProps) => {
    const graphRef = useRef<THREE.Group>(null);

    const vertices = useMemo(() => {
        const newVertices: Vertex[] = [];
        for (let i = 0; i < numVertices; i++) {
            const theta = (i / numVertices) * Math.PI * 2;
            const phi = Math.acos(-1 + (2 * i) / numVertices);
            const r = 5;
            newVertices.push([
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.sin(phi) * Math.sin(theta),
                r * Math.cos(phi)
            ]);
        }
        return newVertices
    }, [numVertices])

    const edges = useMemo(() => {
        // Generate edges ensuring 3-regularity
        const newEdges: Edge[] = [];

        // Connect each vertex to its immediate neighbors
        for (let i = 0; i < numVertices; i++) {
            newEdges.push([i, (i + 1) % numVertices]);
        }

        // Connect opposite vertices
        for (let i = 0; i < numVertices / 2; i++) {
            newEdges.push([i, (i + numVertices / 2) % numVertices]);
        }
        return newEdges;
    }, [numVertices]);

    const edgeAttributes = useMemo(() => {
        return edges.map(([v1, v2]) => {
            return new Float32Array([...vertices[v1], ...vertices[v2]]);
        });
    }, [edges, vertices]);


    useFrame(() => {
        if (graphRef.current) {
            graphRef.current.rotation.y += 0.005;
        }
    });

    return (
        <group ref={graphRef}>
            {edges.map(([v1, v2], index) => (
                <Line
                    key={`line-${index}`}
                    points={[vertices[v1], vertices[v2]]}
                    color={lineColor}
                    lineWidth={0.5}
                />
            ))}
            {vertices.map((vertex, index) => (
                <mesh key={`vertex-${index}`} position={vertex}>
                    <sphereGeometry args={[0.1, 32, 32]} />
                    <meshBasicMaterial color={nodeColor} />
                </mesh>
            ))}
        </group>
    );
};

type VertexArtDrawerProps = {
    numVertices: number;
    lineColor: string;
    nodeColor: string;
}

type GraphProps = VertexArtDrawerProps

export function VertexArtDrawer(props: VertexArtDrawerProps) {
    return (
        <div style={{ width: '375px', height: '375px', border: '1px solid black', backgroundColor: "#FFFFFF" }}>
            <Canvas camera={{ position: [0, 0, 20] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <Graph {...props} />
                <OrbitControls />
            </Canvas>
        </div>
    )
}

export default CustomGraph;