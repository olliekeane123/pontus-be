import createApp from "./app";

const PORT = process.env.PORT || 8000

const app = createApp()

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})