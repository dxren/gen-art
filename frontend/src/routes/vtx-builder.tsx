import { Link } from "react-router-dom";

import { useEffect, useState } from "react"
import { Art, createVertexArt } from "../artService"
import VertexArtBuilder from "../components/VertexArtBuilder"
import CustomGraph from "../components/VertexArtBuilder";
import { useAuth, useUser } from "@clerk/clerk-react";


function VertexBuilder() {


    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', backgroundColor: "#E4DBDC", backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', opacity: 0.8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh' }}>
                <VertexArtBuilder
                />
                <div style={{ marginBottom: '50px' }}>
                    <Link to="/">Return to home</Link>
                </div>
            </div>
        </div>
    );
}
export default VertexBuilder
