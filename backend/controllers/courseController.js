const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

// @desc    Get all courses (public)
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { 
      isPublished: true,
      status: 'published'
    };

    // Filter by category
    if (req.query.category) {
      query.C_categories = { $in: [req.query.category] };
    }

    // Filter by level
    if (req.query.level) {
      query.C_level = req.query.level;
    }

    // Search by title or description
    if (req.query.search) {
      query.$or = [
        { C_title: { $regex: req.query.search, $options: 'i' } },
        { C_description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(query)
      .populate('userID', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      data: courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('userID', 'name email bio')
      .populate('enrolled', 'name email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new course
// @route   POST /api/teacher/course
// @access  Private/Teacher
const createCourse = async (req, res) => {
  try {
    const {
      C_title,
      C_description,
      C_categories,
      C_price,
      C_level,
      C_language,
      status = 'draft'
    } = req.body;

    const course = await Course.create({
      userID: req.user._id,
      C_educator: req.user.name,
      C_title,
      C_description,
      C_categories: Array.isArray(C_categories) ? C_categories : [C_categories],
      C_price: parseFloat(C_price) || 0,
      C_level: C_level || 'beginner',
      C_language: C_language || 'English',
      C_thumbnail: req.file ? req.file.path : '',
      status: status,
      isPublished: status === 'published'
    });

    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during course creation'
    });
  }
};

// @desc    Update course
// @route   PUT /api/teacher/course/:id
// @access  Private/Teacher
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the course owner
    if (course.userID.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        C_thumbnail: req.file ? req.file.path : course.C_thumbnail
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedCourse
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during course update'
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/teacher/course/:id
// @access  Private/Teacher
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the course owner
    if (course.userID.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this course'
      });
    }

    await course.remove();

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during course deletion'
    });
  }
};

// @desc    Add section to course
// @route   POST /api/teacher/course/:id/section
// @access  Private/Teacher
const addSection = async (req, res) => {
  try {
    const { title, description, content, videoUrl, duration, order } = req.body;

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the course owner
    if (course.userID.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add sections to this course'
      });
    }

    course.sections.push({
      title,
      description,
      content,
      videoUrl: req.file ? req.file.path : videoUrl,
      duration: duration || 0,
      order: order || course.sections.length + 1
    });

    await course.save();

    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Add section error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during section addition'
    });
  }
};

// @desc    Get teacher's courses
// @route   GET /api/teacher/courses
// @access  Private/Teacher
const getTeacherCourses = async (req, res) => {
  try {
    const courses = await Course.find({ userID: req.user._id })
      .populate('enrolled', 'name email')
      .sort({ createdAt: -1 });

    // Calculate additional stats for each course
    const coursesWithStats = courses.map(course => {
      const courseObj = course.toObject();
      courseObj.totalSections = course.sections ? course.sections.length : 0;
      courseObj.totalDuration = course.sections ? 
        course.sections.reduce((total, section) => total + (section.duration || 0), 0) : 0;
      return courseObj;
    });

    res.json({
      success: true,
      data: coursesWithStats
    });
  } catch (error) {
    console.error('Get teacher courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get enrolled students for a course
// @route   GET /api/teacher/course/:id/students
// @access  Private/Teacher
const getCourseStudents = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('enrolled', 'name email createdAt lastLogin');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the course owner
    if (course.userID.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view students for this course'
      });
    }

    res.json({
      success: true,
      data: course.enrolled
    });
  } catch (error) {
    console.error('Get course students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  addSection,
  getTeacherCourses,
  getCourseStudents
}; 