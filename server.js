const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());

const uri = "mongodb+srv://yuletzif2209:Yule=1509*@mypokecollection.mfbhu7d.mongodb.net/?retryWrites=true&w=majority&appName=MyPokeCollection";

let client;
let database;

async function connectToMongo() {
    try {
        client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        database = client.db("pokemonDB1");
        console.log("✅ Conectado a MongoDB Atlas (Node.js)");
    } catch (error) {
        console.error("❌ Error al conectar a MongoDB Atlas (Node.js):", error);
        process.exit(1);
    }
}

connectToMongo();

process.on("SIGINT", async () => {
    try {
        if (client) await client.close();
        console.log("🔌 Desconectado de MongoDB Atlas (Node.js)");
        process.exit();
    } catch (error) {
        console.error("❌ Error al desconectar de MongoDB Atlas (Node.js):", error);
        process.exit(1);
    }
});

app.get("/pokemons/:name", async (req, res) => {
    try {
        if (!database) return res.status(500).json({ error: "Base de datos no conectada" });

        const { name } = req.params;
        const pokemons = database.collection("node_pokemons");
        const pokemonImages = database.collection("node_images");

        const pokemon = await pokemons.findOne({
            name: { $regex: new RegExp(`^${name}$`, "i") },
        });

        if (!pokemon) {
            return res.status(404).json({ error: `Pokémon ${name} no encontrado (Node.js)` });
        }

        const pokemonImage = await pokemonImages.findOne({
            name: { $regex: new RegExp(`^${name}$`, "i") },
        });

        res.json({
            ...pokemon,
            sprites: pokemonImage?.sprites || { front_default: "", official_artwork: "" },
        });
    } catch (error) {
        console.error("❌ Error al obtener Pokémon (Node.js):", error);
        res.status(500).json({ error: "Error al obtener Pokémon (Node.js)" });
    }
});

app.get("/pokemons", async (req, res) => {
    try {
        if (!database) return res.status(500).json({ error: "Base de datos no conectada" });

        const pokemonsCollection = database.collection("node_pokemons");
        const pokemonImagesCollection = database.collection("node_images");

        const pokemons = await pokemonsCollection.find().toArray();

        for (const pokemon of pokemons) {
            const image = await pokemonImagesCollection.findOne({
                name: { $regex: new RegExp(`^${pokemon.name}$`, "i") },
            });
            pokemon.sprites = image ? image.sprites : { front_default: "", official_artwork: "" };
        }

        res.json({
            pokemons,
            message: "Lista de Pokémon desde API Node.js",
        });
    } catch (error) {
        console.error("❌ Error al obtener pokemons (Node.js):", error);
        res.status(500).json({ error: "Error al obtener pokemons (Node.js)" });
    }
});

app.listen(port, () => {
    console.log(`🚀 Servidor Node.js escuchando en el puerto ${port}`);
});