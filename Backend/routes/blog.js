const express = require('express');
const Blog = require('../models/blog');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get all blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single blog by ID
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    console.error('Error fetching blog:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new blog (requires authentication)
router.post('/', auth, async (req, res) => {
  try {
    const { title, excerpt, content, image, category, tags } = req.body;
    const blog = new Blog({
      title,
      excerpt,
      content,
      author: req.user.id,
      authorName: req.user.name,
      authorImg: req.user.profileImage || '',
      image,
      category,
      tags,
    });
    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    console.error('Error creating blog:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a blog by ID (remove author check)
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, excerpt, content, image, category, tags } = req.body;
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    // Removed permission check to allow any user to update any blog

    blog.title = title || blog.title;
    blog.excerpt = excerpt || blog.excerpt;
    blog.content = content || blog.content;
    blog.image = image || blog.image;
    blog.category = category || blog.category;
    blog.tags = tags || blog.tags;

    await blog.save();
    res.json(blog);
  } catch (err) {
    console.error('Error updating blog:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a blog by ID (remove author check)
router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    // Removed permission check to allow any user to delete any blog

    await blog.remove();
    res.json({ message: 'Blog deleted successfully' });
  } catch (err) {
    console.error('Error deleting blog:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
