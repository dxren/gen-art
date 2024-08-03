import { SignOutButton, useAuth, useUser } from "@clerk/clerk-react";
import { useState } from "react";
import { Link } from "react-router-dom";

// url of our backend server
// const hostname = "http://localhost:3000"

// // Function to make an API call to the backend server
// // getToken: a function that returns a Promise resolving to a token string
// // callback: a function to handle the response from the API call
// const makeAnApiCall = async (getToken: () => Promise<string | null>, callback: (res: any) => void) => {
//     // Retrieve the token by calling getToken function
//     const token = await getToken();

//     // Make a fetch request to the backend server at the root 
//     // Include the token in the Authorization header for authentication
//     const response = await fetch(hostname, {
//         headers: {            // Add the token to the Authorization header
//             // Add the token to the Authorization header
//             "Authorization": `Bearer ${token}`
//         }
//     });

//     // Parse the JSON response from the server
//     const data = await response.json();

//     // Log the response data to the console for debugging purposes
//     console.log(data);

//     // Call the callback function with the response data
//     callback(data);
// }

export default function IndexPage() {
    const { isSignedIn } = useUser();

    // const callback = (res) => {
    //     setArt(res)
    // }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', backgroundImage: 'url("/index.jpeg")', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', opacity: 0.8 }}>
            <div style={{ textAlign: 'center', backgroundColor: 'rgba(5, 5, 5, 0.8)', padding: '20px', borderRadius: "10px" }}>
                <h2 style={{ color: 'white' }}>Generative Art Library</h2>
                <div>
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        {!isSignedIn && <li><Link to="/sign-up">Sign Up</Link></li>}
                        {!isSignedIn && <li><Link to="/sign-in">Sign In</Link></li>}
                        {isSignedIn && <li><Link to="/vtx-art-builder" style={{ color: '#D8BFD8' }}>Vertex Art Builder</Link></li>}
                        {/* {isSignedIn && <li><Link to="/button-page">Button Page</Link></li>} */}
                        {isSignedIn && <li><Link to="/bg-art-builder" style={{ color: '#D8BFD8' }}>Background Art Builder</Link></li>}
                        {isSignedIn && <li><Link to="/gallery" style={{ color: '#D8BFD8' }}>Art Gallery</Link></li>}
                    </ul>
                </div>
                {/* <div>
                    feed:
                    {
                        art.map(piece => <div>{JSON.stringify(piece)}</div>)
                    }
                </div> */}
                {/* <div style={{ marginTop: '100px' }}>
                    {isSignedIn && <SignOutButton />}
                </div> */}
            </div>
        </div>
    )
}