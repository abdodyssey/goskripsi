import express from "express";
const app = express();
app.get("/", (req, res) => res.send("OK"));
app.listen(4001, () => console.log("Test server on 4001"));
