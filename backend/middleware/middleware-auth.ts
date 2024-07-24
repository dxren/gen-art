import type { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import { clerkClient } from "@clerk/clerk-sdk-node";

const prisma = new PrismaClient();

// const fakeClerkAuth = async (req, res, next) => {
//     // looks up some details based on the token
//     // const auth = await fetch(https://clerk.com/heres-my-token)

//     // req.auth = auth
//     // next()
// }

//This creates an Express middleware function named OptionalUser
//optional because if the user is already in the database, assign the found
//user to req.user
//the constant OptionalUser is an async function that is of type RequestHandler from the Express framework
//this defines the shape of middleware functions to take in 3 parameters, the req, the res, and a next callback function to pass control to the next middleware function

const optionalUser: RequestHandler = async (req, res, next) => {
  // grab the token from the Authorization header
  // the format is ALWAYS `Bearer ${token}`
  const token = req.headers.authorization?.split(" ")[1];

  if (token) {
    try {
      console.log("req.auth", req.auth);
      // Extract the Clerk user Id from the request's auth property
      const clerkId = req.auth.userId;

      //if there is a Clerk user ID
      if (clerkId) {
        //look up the user in the database using prisma
        const user = await prisma.users.findFirst({
          where: {
            clerkId, //Match the Clerk user ID
          },
        });
        //if a user is found in the database
        if (user) {
          console.log("found user!", user);

          // if user does exist, assign user to req.user
          // modify the request context to include a user property
          req.user = user;
        } else {
          //If the user is not found in the database, fetch the user from Clerk
          const clerkUser = await clerkClient.users.getUser(clerkId);

          // Log the clerkUser object to inspect its structure
          console.log("Clerk User:", clerkUser);

          // Extract the email address from the Clerk user data
          // we need to add it as data for the User model
          const email = clerkUser.emailAddresses[0].emailAddress;
          // create a new user in the database with the Clerk user ID and email
          //extracted from above
          const newUser = await prisma.users.create({
            data: {
              clerkId,
              email,
            },
          });
          console.log("created a user!", newUser);
          //assign req.user to the New User
          req.user = newUser;
        }
        //log the user (whether found or newly created)
        console.log("user is", req.user);
      }
    } catch (error) {
      console.log("Authentication failed:", error);
    }
  }
  //call the next middleware function in the stack
  next();
};

export default optionalUser;
