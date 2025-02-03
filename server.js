const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from the project directory
app.use(express.static(path.join(__dirname)));

// Serve index.html as the default page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
