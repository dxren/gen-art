import { SignUp, useAuth, useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { redirect } from "react-router-dom";

export default function SignUpPage() {
    const { getToken } = useAuth(); // Hook to get the authentication token 
    const { user, isLoaded } = useUser();

    const createUserInDatabase = async () => {
        // url of our backend server
        const hostname = "http://localhost:3000" // this is the root URL of the backend server

        try {
            const token = await getToken(); //getting the auth token 
            const response = await fetch(hostname + '/sign-up', {
                method: 'POST',
                headers: {
                    //this token is randomly generated all the time
                    //Clerk is going to handle updating, verifying the token and tying the token to a user
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('failed to create user in database');
            }
            //handle user creation
            console.log('user created in database');
        } catch (error) {
            console.error('Error creating user:', error);
            //handle error 
        }

    }

    //ensure we have user data before trying to create a database entry for a new user
    useEffect(() => {
        (async () => {
            if (user && isLoaded) {
                await createUserInDatabase(); //call function to create a user in the database
                window.location.href = "/"
            }

        })()

    }, [isLoaded, user])

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
                <h2>Sign Up</h2>
                <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" forceRedirectUrl="/sign-up" />
            </div>
        </div>
    );
}
