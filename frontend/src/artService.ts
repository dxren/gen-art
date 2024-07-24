import { z } from "zod";
import { SERVER_URL } from "./constants";

//zod is the way to get type guarantees from fetch requests
const ArtSchema = z.object({
  id: z.string(),
  type: z.enum(["BG", "VERTEX"]),
  bgColor: z.string().nullable(),
  vertexNodes: z.number().nullable(),
  vertexLineColor: z.string().nullable(),
  vertexNodeColor: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  isPublished: z.boolean(),
  userId: z.string(),
});

export type Art = z.infer<typeof ArtSchema>;

export async function getArt() {
  try {
    const response = await fetch(SERVER_URL);
    // making a GET request to the index page
    // parse the response as json
    const results = await response.json();
    // validate the response using zod
    const parsedResults = z.array(ArtSchema).parse(results);
    return parsedResults;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
    } else {
      console.error("Fetch error:", error.message);
    }
  }
}

export async function createNewArt(
  bgColor: string,
  token: string
): Promise<Art> {
  try {
    const response = await fetch(SERVER_URL + "/artfeed", {
      //make a POST request to the index page
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: "BG",
        bgColor: bgColor,
      }),
    });
    //parse the response as json
    const result = await response.json();
    const newArt = ArtSchema.parse(result);
    return newArt;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
    } else {
      console.error("Fetch error:", error.message);
    }
  }
  return { error: "something bad happened" };
}

export async function createVertexArt(
  numVertices: number,
  nodeColor: string,
  lineColor: string,
  token: string
): Promise<Art> {
  try {
    const response = await fetch(SERVER_URL + "/artfeed", {
      //make a POST request to the index page
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: "VERTEX",
        numVertices: numVertices,
        nodeColor: nodeColor,
        lineColor: lineColor,
      }),
    });
    //parse the response as json
    const result = await response.json();
    const newArt = ArtSchema.parse(result);
    return newArt;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
    } else {
      console.error("Fetch error:", error.message);
    }
  }
  return { error: "something bad happened" };
}
