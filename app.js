const express = require('express');
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');

const app = express();
const port = 3000;

const openai = new OpenAI({
    apiKey: 'Your API Key',
});

app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/Index.html");
})

app.post('/chatgpt', async (req, res) => {
    const { message } = req.body;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: message }],
        });

        const reply = completion.choices[0].message.content;

        const formattedReply = new URLSearchParams({ text: reply }).toString();

        const conversionResponse = await fetch("https://aitohumanconverter.com/v2/en/process.php", {
            method: "POST",
            body: formattedReply,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const finalData = await conversionResponse.json();

        const nonPlagarisedSOP = finalData.data;

        const unorganisedSOP = `Can you rewrite the below SOP only by replacing all instances of spelled-out numbers with numerals Ex: "ninety five" change to 95? Other than this doesn't change anything words or sentence.
        ${nonPlagarisedSOP}
        Note: Please don’t use any signs like “*” or, "#" in the headings to make it bold or underlined, write the whole SOP in normal text and it is important to not use those signs.`

        const final = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: unorganisedSOP }],
        });

        const organisedSOP = final.choices[0].message.content;

        res.json(organisedSOP);
    } catch (error) {
        console.error("Error with OpenAI API: ", error);
        res.status(500).json({ error: 'Something went wrong with the OpenAI API!' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});