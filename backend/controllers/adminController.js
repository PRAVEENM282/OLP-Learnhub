const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Filter by user type
    if (req.query.type) {
      query.type = req.query.type;
    }

    // Filter by status
    if (req.query.status) {
      query.isActive = req.query.status === 'active';
    }

    // Search by name or email
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { name, email, type, isActive, bio } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (type) user.type = type;
    if (isActive !== undefined) user.isActive = isActive;
    if (bio !== undefined) user.bio = bio;

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during user update'
    });
  }
};

// @desc    Delete/Block user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Check if user has active enrollments
    const activeEnrollments = await Enrollment.find({
      studentID: user._id,
      status: { $in: ['active', 'completed'] }
    });

    if (activeEnrollments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with active enrollments'
      });
    }

    // Check if user has created courses
    const userCourses = await Course.find({ userID: user._id });

    if (userCourses.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with created courses'
      });
    }

    await user.remove();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during user deletion'
    });
  }
};

// @desc    Get all courses (admin view)
// @route   GET /api/admin/courses
// @access  Private/Admin
const getAdminCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Filter by status
    if (req.query.status) {
      if (req.query.status === 'published') {
        query.status = 'published';
        query.isPublished = true;
      } else if (req.query.status === 'draft') {
        query.status = 'draft';
        query.isPublished = false;
      } else if (req.query.status === 'archived') {
        query.status = 'archived';
      }
    }

    // Filter by teacher
    if (req.query.teacher) {
      query.userID = req.query.teacher;
    }

    // Search by title
    if (req.query.search) {
      query.C_title = { $regex: req.query.search, $options: 'i' };
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
    console.error('Get admin courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete course (admin)
// @route   DELETE /api/admin/courses/:id
// @access  Private/Admin
const deleteAdminCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if course has enrollments
    const enrollments = await Enrollment.find({ courseID: course._id });
    if (enrollments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete course with active enrollments'
      });
    }

    await course.remove();

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete admin course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during course deletion'
    });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ type: 'student' });
    const totalTeachers = await User.countDocuments({ type: 'teacher' });
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    const activeEnrollments = await Enrollment.countDocuments({ status: 'active' });
    const completedEnrollments = await Enrollment.countDocuments({ status: 'completed' });

    // Recent activities
    const recentUsers = await User.find()
      .select('name email type createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentCourses = await Course.find()
      .populate('userID', 'name')
      .select('C_title C_educator createdAt totalEnrollments')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalStudents,
          totalTeachers,
          totalCourses,
          totalEnrollments,
          activeEnrollments,
          completedEnrollments
        },
        recentUsers,
        recentCourses
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getAdminCourses,
  deleteAdminCourse,
  getDashboardStats
}; 