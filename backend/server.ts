//this file contains all the logic we need to set up the server
//setting up middleware and routes
import "dotenv/config";

//runs a bunch of stuff to create a new server and return it to you
import { ClerkExpressWithAuth, type EmailAddress } from "@clerk/clerk-sdk-node";
import express, { type RequestHandler } from "express";
import cookieParser from "cookie-parser";
import optionalUser from "./middleware/middleware-auth";
import prisma from "./prisma/client";
import cors from "cors";

//which we are now calling app
const app = express();

// using middleware
app.use(cors());
app.use(express.json());
// allow urlencoded data to be submitted using middleware
app.use(express.urlencoded({ extended: true }));
//allow cookies to be interpreted
app.use(cookieParser());
// clerk modifies the request by adding req.auth
// this takes the token and communicates with clerk to get user information
// which gets assigned to req.auth
app.use(ClerkExpressWithAuth());
//this is the clerk middleware we wrote for auth
app.use(optionalUser);

// const exampleMiddleware: RequestHandler = (req, res, next) => {
//     // modify request
//     req.user = {
//         id: "1"
//     }

//     console.log(req.user)

//     next()
// }

async function totalPages(): Promise<number> {
  const allArt = await prisma.art.count();
  const totalPages = Math.ceil(allArt / 9);
  console.log(totalPages);
  return totalPages;
}

async function getArt(page: number) {
  const skip = (page - 1) * 9;
  const take = 9;
  const art = await prisma.art.findMany({
    orderBy: {
      createdAt: "desc",
    },
    skip: skip,
    take: take,
  });
  return art;
}

app.get("/artfeed", async (req, res) => {
  const page = 1;
  try {
    const feed = await getArt(page);
    res.json({ feed, totalPages: await totalPages() });
  } catch (error) {
    console.error("Error fetching art feed", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the art feed" });
  }
});

//on the /artfeed endpoint, create GET to pull in prisma art data
app.get("/artfeed/:pagenumber", async (req, res) => {
  const page = parseInt(req.params.pagenumber);
  console.log("page :", page);
  // Dorothy says: params
  try {
    const feed = await getArt(page);
    res.json({ feed, totalPages: await totalPages() });
  } catch (error) {
    console.error("Error fetching art feed", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the art feed" });
  }
});

//on the /artfeed endpoint, create route to POST art from both the BG and VERTEX art types
app.post("/artfeed", async (req, res) => {
  const { type, bgColor, numVertices, nodeColor, lineColor } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(400).json({ error: "You are not authorized" });
  }

  try {
    let artPiece;
    if (type === "BG") {
      if (!bgColor) {
        return res
          .status(400)
          .json({ error: "bgColor is required for BG Art type" });
      }
      artPiece = await prisma.art.create({
        data: {
          bgColor: bgColor,
          isPublished: true,
          userId: userId,
          type: "BG",
        },
      });
    } else if (type === "VERTEX") {
      if (!numVertices || !nodeColor || !lineColor) {
        return res.status(400).json({
          error:
            "numVertices, nodeColor, and lineColor are required for VERTEX Art type",
        });
      }
      artPiece = await prisma.art.create({
        data: {
          vertexNodes: numVertices,
          vertexLineColor: lineColor,
          vertexNodeColor: nodeColor,
          isPublished: true,
          userId: userId,
          type: "VERTEX",
        },
      });
    } else {
      return res.status(400).json({ error: "Invalid art type" });
    }

    return res.json(artPiece);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create art piece" });
  }
});

// app.post('/artfeed', async (req, res) => {
//     const vertexNodes = req.body.numVertices
//     const vertexLineColor = req.body.nodeColor
//     const vertexNodeColor = req.body.lineColor
//     const userId = req.user?.id

//     if (!vertexNodes || !vertexLineColor || !vertexNodeColor) {
//         return res.status(400).json({ error: 'vertexNodes, vertexLineColor, vertexNodeColor, and userId are required' });
//     }

//     if (!userId) {
//         return res.status(400).json({ error: 'You are not authorized' });
//     }

//     try {
//         const artVtxPiece = await prisma.art.create({
//             data: {
//                 vertexNodes: vertexNodes,
//                 vertexLineColor: vertexLineColor,
//                 vertexNodeColor: vertexNodeColor,
//                 isPublished: true,
//                 userId: userId,
//                 type: 'VERTEX'
//             }
//         });
//         return res.json(artVtxPiece);
//     } catch (error) {
//         return res.status(500).json({ error: 'Failed to create art piece' });
//     }
// })

//on the root endpoint, create a GET that redirects to the /artfeed endpoint
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

//on the sign-up page, create a POST to create a new user
app.post("/sign-up", async (req, res) => {
  const email = req.user?.email;
  const clerkId = req.user?.clerkId;
  //if either email or clerkId is not found, then
  if (!email || !clerkId) {
    return res.status(400).json({ error: "User information is missing" });
  }
  try {
    const newUser = await prisma.users.findFirst({
      where: {
        clerkId: clerkId,
      },
    });
    return res.json(newUser);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create user" });
  }
});

//on the button-page, create a POST to create a new book
app.post("/book", async (req, res) => {
  const description = req.body.description;

  if (!description) {
    return res.status(400).json({ error: "Book description is missing" });
  }
  try {
    const newBook = await prisma.book.create({
      data: {
        description: description,
      },
    });
    return res.json(newBook);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create new book" });
  }
});

app.listen(3000, () => {
  console.log("server is running on port 3000");
});

export default app;
