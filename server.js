const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

const movies = require('./data/movies.json');

app.use(express.static(path.join(__dirname)));

app.get('/api/movies', (req, res) => {
  const movieList = movies.map((movie) => ({
    ...movie,
    downloadUrl: `/download/${movie.id}`
  }));
  res.json(movieList);
});

app.get('/api/movies/:id', (req, res) => {
  const movieId = Number(req.params.id);
  const movie = movies.find((item) => item.id === movieId);
  if (!movie) {
    return res.status(404).json({ error: 'Movie not found' });
  }
  res.json({
    ...movie,
    downloadUrl: `/download/${movie.id}`
  });
});

app.get('/download/:id', (req, res) => {
  const movieId = Number(req.params.id);
  const movie = movies.find((item) => item.id === movieId);
  if (!movie) {
    return res.status(404).send('Movie not found');
  }

  const filename = `${movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.mp4`;
  const content = `Placeholder movie file for ${movie.title}\n\nThis demo server does not include a real movie file. Replace the download route with a real asset or storage service to deliver movie content.`;

  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(content);
});

app.use((req, res) => {
  res.status(404).send('Not found');
});

app.listen(port, host, () => {
  console.log(`Server running at http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`);
});
