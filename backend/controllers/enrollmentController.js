const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const Certificate = require('../models/Certificate');

// @desc    Enroll in a course
// @route   POST /api/enroll/:courseId
// @access  Private/Student
const enrollInCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const studentId = req.user._id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if course is published
    if (!course.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Course is not available for enrollment'
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      studentID: studentId,
      courseID: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      studentID: studentId,
      courseID: courseId,
      paymentStatus: course.C_price > 0 ? 'pending' : 'completed'
    });

    // Add student to course enrolled list
    course.enrolled.push(studentId);
    course.totalEnrollments += 1;
    await course.save();

    // Populate course details
    await enrollment.populate('courseID', 'C_title C_educator C_thumbnail');

    res.status(201).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    console.error('Enroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during enrollment'
    });
  }
};

// @desc    Get student's enrolled courses or teacher's created courses
// @route   GET /api/enroll/mycourses
// @access  Private/Student or Teacher
const getMyCourses = async (req, res) => {
  try {
    console.log('User type:', req.user.type);
    console.log('User ID:', req.user._id);
    
    let coursesWithProgress = [];

    if (req.user.type === 'student') {
      // For students: get enrolled courses
      const enrollments = await Enrollment.find({ studentID: req.user._id })
        .populate({
          path: 'courseID',
          select: 'C_title C_educator C_thumbnail C_description C_categories C_level C_price sections totalEnrollments'
        })
        .sort({ enrolledAt: -1 });

      // Transform enrollments to return course data with enrollment info
      coursesWithProgress = enrollments.map(enrollment => {
        const course = enrollment.courseID;
        if (!course) return null; // Skip if course doesn't exist
        
        const progress = enrollment.calculateProgress(course);
        
        return {
          _id: course._id,
          C_title: course.C_title,
          C_educator: course.C_educator,
          C_thumbnail: course.C_thumbnail,
          C_description: course.C_description,
          C_categories: course.C_categories,
          C_level: course.C_level,
          C_price: course.C_price,
          sections: course.sections || [],
          totalEnrollments: course.totalEnrollments,
          // Enrollment specific data
          enrollmentId: enrollment._id,
          progress: progress,
          status: enrollment.status,
          enrolledAt: enrollment.enrolledAt,
          lastAccessed: enrollment.lastAccessed,
          completedSections: enrollment.completedSections,
          totalSections: course.sections ? course.sections.length : 0,
          completedSectionsCount: enrollment.completedSections.length
        };
      }).filter(course => course !== null); // Remove null entries

    } else if (req.user.type === 'teacher') {
      // For teachers: get created courses
      const courses = await Course.find({ userID: req.user._id })
        .populate('enrolled', 'name email')
        .sort({ createdAt: -1 });

      // Calculate additional stats for each course
      coursesWithProgress = courses.map(course => {
        const courseObj = course.toObject();
        courseObj.totalSections = course.sections ? course.sections.length : 0;
        courseObj.totalDuration = course.sections ? 
          course.sections.reduce((total, section) => total + (section.duration || 0), 0) : 0;
        return courseObj;
      });
    } else {
      // For any other user type, return empty array
      coursesWithProgress = [];
    }

    console.log('Found courses:', coursesWithProgress.length);

    res.json({
      success: true,
      data: coursesWithProgress
    });
  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get course progress
// @route   GET /api/progress/:courseId
// @access  Private/Student
const getCourseProgress = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      studentID: req.user._id,
      courseID: req.params.courseId
    }).populate('courseID', 'C_title sections');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    const course = enrollment.courseID;
    const progress = enrollment.calculateProgress(course);

    // Get section details with completion status
    const sectionsWithStatus = course.sections.map(section => {
      const isCompleted = enrollment.completedSections.some(
        completed => completed.sectionId.toString() === section._id.toString()
      );
      
      return {
        ...section.toObject(),
        isCompleted,
        completedAt: isCompleted ? 
          enrollment.completedSections.find(
            completed => completed.sectionId.toString() === section._id.toString()
          )?.completedAt : null
      };
    });

    res.json({
      success: true,
      data: {
        course: {
          _id: course._id,
          title: course.C_title,
          totalSections: course.sections.length
        },
        enrollment: {
          _id: enrollment._id,
          progress,
          status: enrollment.status,
          enrolledAt: enrollment.enrolledAt,
          lastAccessed: enrollment.lastAccessed
        },
        sections: sectionsWithStatus
      }
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Mark section as completed
// @route   POST /api/progress/:courseId/section/:sectionId/complete
// @access  Private/Student
const completeSection = async (req, res) => {
  try {
    const { courseId, sectionId } = req.params;

    const enrollment = await Enrollment.findOne({
      studentID: req.user._id,
      courseID: courseId
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Mark section as completed
    enrollment.completeSection(sectionId);
    enrollment.lastAccessed = new Date();
    
    // Update progress
    const course = await Course.findById(courseId);
    enrollment.progress = enrollment.calculateProgress(course);

    // Check if course is completed
    if (enrollment.progress === 100 && enrollment.status === 'active') {
      enrollment.status = 'completed';
      
      // Generate certificate
      const certificate = await Certificate.create({
        studentID: req.user._id,
        courseID: courseId,
        enrollmentID: enrollment._id,
        completionDate: new Date()
      });

      enrollment.certificateIssued = true;
      enrollment.certificateID = certificate._id;
    }

    await enrollment.save();

    res.json({
      success: true,
      data: {
        progress: enrollment.progress,
        status: enrollment.status,
        certificateIssued: enrollment.certificateIssued
      }
    });
  } catch (error) {
    console.error('Complete section error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get certificate for completed course
// @route   GET /api/certificate/:courseId
// @access  Private/Student
const getCertificate = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      studentID: req.user._id,
      courseID: req.params.courseId
    }).populate('certificateID courseID', 'certificateNumber dateIssued C_title C_educator');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    if (!enrollment.certificateIssued) {
      return res.status(400).json({
        success: false,
        message: 'Course not completed yet'
      });
    }

    res.json({
      success: true,
      data: enrollment.certificateID
    });
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Unenroll from course
// @route   DELETE /api/enroll/:courseId
// @access  Private/Student
const unenrollFromCourse = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      studentID: req.user._id,
      courseID: req.params.courseId
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Remove from course enrolled list
    const course = await Course.findById(req.params.courseId);
    if (course) {
      course.enrolled = course.enrolled.filter(
        studentId => studentId.toString() !== req.user._id.toString()
      );
      course.totalEnrollments = Math.max(0, course.totalEnrollments - 1);
      await course.save();
    }

    // Delete enrollment
    await enrollment.remove();

    res.json({
      success: true,
      message: 'Successfully unenrolled from course'
    });
  } catch (error) {
    console.error('Unenroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during unenrollment'
    });
  }
};

module.exports = {
  enrollInCourse,
  getMyCourses,
  getCourseProgress,
  completeSection,
  getCertificate,
  unenrollFromCourse
}; 