const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Certificate = require('../models/Certificate');
const Course = require('../models/Course');
const User = require('../models/User');

const generateCertificate = async (certificateId) => {
  try {
    // Get certificate data
    const certificate = await Certificate.findById(certificateId)
      .populate('studentID', 'name')
      .populate('courseID', 'C_title C_educator');

    if (!certificate) {
      throw new Error('Certificate not found');
    }

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape'
    });

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../uploads/certificates');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate filename
    const filename = `certificate_${certificate.certificateNumber}.pdf`;
    const filepath = path.join(uploadsDir, filename);
    const stream = fs.createWriteStream(filepath);

    // Pipe PDF to file
    doc.pipe(stream);

    // Add background
    doc.rect(0, 0, doc.page.width, doc.page.height)
       .fill('#f8f9fa');

    // Add border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
       .lineWidth(3)
       .stroke('#007bff');

    // Add inner border
    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
       .lineWidth(1)
       .stroke('#dee2e6');

    // Add logo/header
    doc.fontSize(24)
       .fill('#007bff')
       .text('LEARNHUB', doc.page.width / 2, 80, { align: 'center' });

    doc.fontSize(14)
       .fill('#6c757d')
       .text('Online Learning Platform', doc.page.width / 2, 110, { align: 'center' });

    // Add certificate title
    doc.fontSize(28)
       .fill('#212529')
       .text('Certificate of Completion', doc.page.width / 2, 160, { align: 'center' });

    // Add student name
    doc.fontSize(20)
       .fill('#495057')
       .text('This is to certify that', doc.page.width / 2, 220, { align: 'center' });

    doc.fontSize(24)
       .fill('#007bff')
       .text(certificate.studentID.name, doc.page.width / 2, 250, { align: 'center' });

    // Add course completion text
    doc.fontSize(16)
       .fill('#495057')
       .text('has successfully completed the course', doc.page.width / 2, 290, { align: 'center' });

    doc.fontSize(20)
       .fill('#007bff')
       .text(certificate.courseID.C_title, doc.page.width / 2, 320, { align: 'center' });

    // Add instructor
    doc.fontSize(14)
       .fill('#6c757d')
       .text(`Instructor: ${certificate.courseID.C_educator}`, doc.page.width / 2, 360, { align: 'center' });

    // Add completion date
    const completionDate = new Date(certificate.completionDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    doc.fontSize(14)
       .fill('#6c757d')
       .text(`Completed on: ${completionDate}`, doc.page.width / 2, 390, { align: 'center' });

    // Add certificate number
    doc.fontSize(12)
       .fill('#6c757d')
       .text(`Certificate ID: ${certificate.certificateNumber}`, doc.page.width / 2, 420, { align: 'center' });

    // Add verification info
    doc.fontSize(10)
       .fill('#6c757d')
       .text(`Verification Code: ${certificate.verificationCode}`, doc.page.width / 2, 450, { align: 'center' });

    // Add grade if available
    if (certificate.grade) {
      doc.fontSize(16)
         .fill('#28a745')
         .text(`Grade: ${certificate.grade}`, doc.page.width / 2, 480, { align: 'center' });
    }

    // Add footer
    doc.fontSize(10)
       .fill('#6c757d')
       .text('This certificate can be verified at learnhub.com/verify', doc.page.width / 2, 520, { align: 'center' });

    // Finalize PDF
    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        const relativePath = `/uploads/certificates/${filename}`;
        resolve(relativePath);
      });
      stream.on('error', reject);
    });

  } catch (error) {
    console.error('Certificate generation error:', error);
    throw error;
  }
};

module.exports = generateCertificate; 