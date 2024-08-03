import { useEffect, useState } from 'react';
import { z } from 'zod';
import { VertexArtDrawer } from '../components/VertexArtBuilder';
import { Link, useParams } from 'react-router-dom';
import { SERVER_URL } from '../constants';

//zod is the way to get type guarantees from fetch requests
const ArtSchema = z.object({
    id: z.string(),
    bgColor: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    isPublished: z.boolean(),
    userId: z.string()
});

type Art = z.infer<typeof ArtSchema>;

type BGArt = {
    id: string;
    type: 'BG';
    bgColor: string;
    createdAt: string;
    updatedAt: string;
    isPublished: boolean;
    userId: string;
}

type VertexArt = {
    id: string;
    type: 'VERTEX';
    vertexNodes: number;
    vertexLineColor: string;
    vertexNodeColor: string;
    createdAt: string;
    updatedAt: string;
    isPublished: boolean;
    userId: string;
}

type Feed = (BGArt | VertexArt)[]

export default function Gallery() {
    // const { pagenumber } = useParams();
    const [currentPageNumber, setCurrentPageNumber] = useState(1)
    //Art[] is a typescript annotation saying that artPieces is an array of objects
    //conforming to the Art type, as inferred from the ArtSchema as defined using zod

    //this state is created to store the fetched art pieces 
    const [artPieces, setArtPieces] = useState<Feed>([]);
    //this state is to track if the data is still being fetched
    const [totalPageCount, setTotalPageCount] = useState(1)
    const [refreshArt, setRefreshArt] = useState(0);

    useEffect(() => {
        fetchArt(currentPageNumber);
        setInterval(() => setRefreshArt(refreshArt + 1), 5000);
    }, [])

    useEffect(() => {
        console.log('x')
        fetchArt(currentPageNumber);
    }, [refreshArt])

    const clamp = (actualPageNumber: number, minPageNumber: number, maxPageNumber: number): number => {
        if (actualPageNumber > maxPageNumber) {
            return maxPageNumber
        } else if (actualPageNumber < minPageNumber) {
            return minPageNumber
        } else {
            return actualPageNumber
        }
    }

    const fetchArt = async (pageNumber: number) => {
        try {
            //fetch the GET from localhost:3000/artfeed
            // const cleanPageNumber = pagenumber || 1
            const response = await fetch(SERVER_URL + `/artfeed/${pageNumber}`);
            const fetchedArt = await response.json() as { feed: Feed, totalPages: number };
            console.log(fetchedArt)
            setArtPieces(fetchedArt.feed);
            setTotalPageCount(fetchedArt.totalPages)
        }
        catch (error) {
            console.error('Error fetching art pieces:', error);
        }
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100vw', backgroundColor: "#FFFFFF", backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', opacity: 0.8 }}>
            <div style={{ padding: '0 20px', marginTop: '60px', minHeight: '100vh', width: '100%' }}>
                <h2>Art Gallery</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '70px', marginRight: '20px', marginLeft: '20px', justifyContent: 'center' }}>
                    {artPieces.map((art) => {
                        if (art.type === "BG") {
                            return <div key={art.id} style={{
                                backgroundColor: art.bgColor,
                                width: '375px',
                                height: '375px',
                                border: '1px solid black',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                flexDirection: 'column'
                            }}>
                            </div>
                        }
                        if (art.type === "VERTEX") {
                            return <VertexArtDrawer
                                key={art.id}
                                numVertices={art.vertexNodes}
                                lineColor={art.vertexLineColor}
                                nodeColor={art.vertexNodeColor}
                            />
                        }
                    })}
                </div>
                <div style={{ marginTop: '40px', marginBottom: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                    <button
                        disabled={currentPageNumber === 1}
                        onClick={
                            () => {
                                const newPageNumber = clamp(currentPageNumber - 1, 1, totalPageCount)
                                console.log(newPageNumber);
                                setCurrentPageNumber(newPageNumber)
                                fetchArt(newPageNumber)
                            }
                        }>
                        Previous
                    </button>
                    <div>Page {currentPageNumber}</div>
                    <button
                        disabled={currentPageNumber === totalPageCount}
                        onClick={() => {
                            const newPageNumber = clamp(currentPageNumber + 1, 1, totalPageCount)
                            setCurrentPageNumber(newPageNumber)
                            fetchArt(newPageNumber)
                        }
                        }>
                        Next
                    </button>
                </div>
                <div style={{ textAlign: 'center', marginTop: '20px', paddingBottom: '20px' }}>
                    <Link to="/">Return to home</Link>
                </div>
            </div>
        </div>
    )
}
