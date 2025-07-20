const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const Certificate = require('../models/Certificate');
const generateCertificate = require('../utils/generateCertificate');

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
// @route   GET /api/enroll/progress/:courseId
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
// @route   POST /api/enroll/progress/:courseId/section/:sectionId/complete
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
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    enrollment.progress = enrollment.calculateProgress(course);

    // Check if course is completed
    if (enrollment.progress === 100 && enrollment.status === 'active') {
      console.log('Course completed! Progress:', enrollment.progress, 'Status:', enrollment.status);
      enrollment.status = 'completed';
      
      try {
        console.log('Creating certificate for course:', courseId);
        // Generate certificate
        const certificate = await Certificate.create({
          studentID: req.user._id,
          courseID: courseId,
          enrollmentID: enrollment._id,
          completionDate: new Date(),
          grade: calculateGrade(enrollment.progress)
        });

        console.log('Certificate created successfully:', certificate._id);
        enrollment.certificateIssued = true;
        enrollment.certificateID = certificate._id;

        // Generate certificate PDF (don't block the response if it fails)
        console.log('Generating certificate PDF...');
        generateCertificate(certificate._id)
          .then(certificateURL => {
            console.log('Certificate PDF generated:', certificateURL);
            certificate.certificateURL = certificateURL;
            certificate.save().catch(err => {
              console.error('Error saving certificate URL:', err);
            });
          })
          .catch(certError => {
            console.error('Certificate generation error:', certError);
          });
      } catch (certError) {
        console.error('Error creating certificate:', certError);
        // Don't fail the section completion if certificate creation fails
      }
    } else {
      console.log('Course not completed yet. Progress:', enrollment.progress, 'Status:', enrollment.status);
    }

    await enrollment.save();

    res.json({
      success: true,
      data: {
        enrollment,
        courseCompleted: enrollment.status === 'completed'
      }
    });
  } catch (error) {
    console.error('Complete section error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while completing section'
    });
  }
};

// @desc    Get course certificate
// @route   GET /api/enroll/certificate/:courseId
// @access  Private/Student
const getCertificate = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      studentID: req.user._id,
      courseID: req.params.courseId
    }).populate('certificateID');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    if (!enrollment.certificateIssued || !enrollment.certificateID) {
      return res.status(400).json({
        success: false,
        message: 'Certificate not yet issued'
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

    // Remove student from course enrolled list
    const course = await Course.findById(req.params.courseId);
    if (course) {
      course.enrolled = course.enrolled.filter(
        studentId => studentId.toString() !== req.user._id.toString()
      );
      course.totalEnrollments = Math.max(0, course.totalEnrollments - 1);
      await course.save();
    }

    // Delete enrollment
    await Enrollment.findByIdAndDelete(enrollment._id);

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

// @desc    Test certificate generation (for debugging)
// @route   POST /api/enroll/test-certificate/:courseId
// @access  Private/Student
const testCertificateGeneration = async (req, res) => {
  try {
    const { courseId } = req.params;

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

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    console.log('Test certificate generation for course:', courseId);
    console.log('Enrollment status:', enrollment.status);
    console.log('Enrollment progress:', enrollment.progress);
    console.log('Completed sections:', enrollment.completedSections.length);
    console.log('Total course sections:', course.sections.length);

    // Force completion and certificate generation
    enrollment.status = 'completed';
    enrollment.progress = 100;
    
    try {
      console.log('Creating certificate...');
      const certificate = await Certificate.create({
        studentID: req.user._id,
        courseID: courseId,
        enrollmentID: enrollment._id,
        completionDate: new Date(),
        grade: calculateGrade(100)
      });

      console.log('Certificate created:', certificate._id);
      enrollment.certificateIssued = true;
      enrollment.certificateID = certificate._id;

      await enrollment.save();

      res.json({
        success: true,
        message: 'Certificate generated successfully',
        certificateId: certificate._id
      });
    } catch (certError) {
      console.error('Certificate creation error:', certError);
      res.status(500).json({
        success: false,
        message: 'Failed to create certificate',
        error: certError.message
      });
    }
  } catch (error) {
    console.error('Test certificate generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Helper function to calculate grade based on progress
const calculateGrade = (progress) => {
  if (progress >= 95) return 'A+';
  if (progress >= 90) return 'A';
  if (progress >= 85) return 'A-';
  if (progress >= 80) return 'B+';
  if (progress >= 75) return 'B';
  if (progress >= 70) return 'B-';
  if (progress >= 65) return 'C+';
  if (progress >= 60) return 'C';
  if (progress >= 55) return 'C-';
  if (progress >= 50) return 'D+';
  if (progress >= 45) return 'D';
  return 'F';
};

module.exports = {
  enrollInCourse,
  getMyCourses,
  getCourseProgress,
  completeSection,
  getCertificate,
  unenrollFromCourse,
  testCertificateGeneration
}; 