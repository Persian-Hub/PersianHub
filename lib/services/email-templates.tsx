class EmailTemplates {
  // Business notification templates
  businessSubmitted(data: { ownerName: string; businessName: string; dashboardUrl: string }) {
    return {
      subject: `Business Submission Received - ${data.businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Persian Hub</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Business Directory</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Thank You for Your Submission!</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">Dear ${data.ownerName},</p>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              We have received your business submission for <strong>${data.businessName}</strong>. Our team will review your listing and get back to you within 2-3 business days.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.dashboardUrl}" style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Your Dashboard</a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
              <p>Thank you for joining the Persian Hub community!</p>
            </div>
          </div>
        </div>
      `,
      text: `Business Submission Received - ${data.businessName}\n\nDear ${data.ownerName},\n\nWe have received your business submission for ${data.businessName}. Our team will review your listing and get back to you within 2-3 business days.\n\nView your dashboard: ${data.dashboardUrl}`,
    }
  }

  businessApproved(data: { ownerName: string; businessName: string; listingUrl: string }) {
    return {
      subject: `🎉 Business Approved - ${data.businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Persian Hub</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Business Approved</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Congratulations!</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">Dear ${data.ownerName},</p>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Great news! Your business <strong>${data.businessName}</strong> has been approved and is now live on Persian Hub.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.listingUrl}" style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Your Listing</a>
            </div>
          </div>
        </div>
      `,
      text: `🎉 Business Approved - ${data.businessName}\n\nDear ${data.ownerName},\n\nGreat news! Your business ${data.businessName} has been approved and is now live on Persian Hub.\n\nView your listing: ${data.listingUrl}`,
    }
  }

  businessRejected(data: { ownerName: string; businessName: string; rejectionReason: string; editUrl: string }) {
    return {
      subject: `Business Submission Update - ${data.businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Persian Hub</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Submission Update</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Submission Requires Updates</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">Dear ${data.ownerName},</p>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Thank you for submitting <strong>${data.businessName}</strong>. We need some updates before we can approve your listing:
            </p>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e;">${data.rejectionReason}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.editUrl}" style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Update Your Listing</a>
            </div>
          </div>
        </div>
      `,
      text: `Business Submission Update - ${data.businessName}\n\nDear ${data.ownerName},\n\nThank you for submitting ${data.businessName}. We need some updates before we can approve your listing:\n\n${data.rejectionReason}\n\nUpdate your listing: ${data.editUrl}`,
    }
  }

  businessVerified(data: { ownerName: string; businessName: string; listingUrl: string }) {
    return {
      subject: `✅ Business Verified - ${data.businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Persian Hub</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Business Verified</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Your Business is Now Verified!</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">Dear ${data.ownerName},</p>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Congratulations! <strong>${data.businessName}</strong> has been verified and now displays a trust badge.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.listingUrl}" style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Your Verified Listing</a>
            </div>
          </div>
        </div>
      `,
      text: `✅ Business Verified - ${data.businessName}\n\nDear ${data.ownerName},\n\nCongratulations! ${data.businessName} has been verified and now displays a trust badge.\n\nView your verified listing: ${data.listingUrl}`,
    }
  }

  // Admin notification templates
  adminNewBusiness(data: { businessName: string; ownerEmail: string; adminBusinessUrl: string }) {
    return {
      subject: `New Business Submission - ${data.businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Persian Hub</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Admin Notification</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">New Business Submission</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              A new business has been submitted for review:
            </p>
            
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Business:</strong> ${data.businessName}</p>
              <p style="margin: 5px 0;"><strong>Owner Email:</strong> ${data.ownerEmail}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.adminBusinessUrl}" style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Review Business</a>
            </div>
          </div>
        </div>
      `,
      text: `New Business Submission - ${data.businessName}\n\nA new business has been submitted for review:\n\nBusiness: ${data.businessName}\nOwner Email: ${data.ownerEmail}\n\nReview business: ${data.adminBusinessUrl}`,
    }
  }

  adminNewReview(data: { businessName: string; reviewExcerpt: string; adminReviewUrl: string }) {
    return {
      subject: `New Review Submitted - ${data.businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Persian Hub</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Admin Notification</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">New Review Submitted</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              A new review has been submitted for <strong>${data.businessName}</strong>:
            </p>
            
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #374151;">"${data.reviewExcerpt}"</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.adminReviewUrl}" style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Review Submission</a>
            </div>
          </div>
        </div>
      `,
      text: `New Review Submitted - ${data.businessName}\n\nA new review has been submitted for ${data.businessName}:\n\n"${data.reviewExcerpt}"\n\nReview submission: ${data.adminReviewUrl}`,
    }
  }

  reviewApproved(data: { ownerName: string; businessName: string; reviewExcerpt: string; reviewsUrl: string }) {
    return {
      subject: `New Review Approved - ${data.businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Persian Hub</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Review Approved</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">You Have a New Review!</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">Dear ${data.ownerName},</p>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              A new review for <strong>${data.businessName}</strong> has been approved and is now live:
            </p>
            
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #0c4a6e;">"${data.reviewExcerpt}"</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.reviewsUrl}" style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View All Reviews</a>
            </div>
          </div>
        </div>
      `,
      text: `New Review Approved - ${data.businessName}\n\nDear ${data.ownerName},\n\nA new review for ${data.businessName} has been approved and is now live:\n\n"${data.reviewExcerpt}"\n\nView all reviews: ${data.reviewsUrl}`,
    }
  }

  // New user registration notification
  adminNewUserRegistered(data: { userName: string; userEmail: string; registeredAt: string; adminUserLink: string }) {
    return {
      subject: `New User Registration - ${data.userName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Persian Hub</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Admin Notification</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">New User Registration</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              A new user has registered on Persian Hub:
            </p>
            
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Name:</strong> ${data.userName}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${data.userEmail}</p>
              <p style="margin: 5px 0;"><strong>Registered:</strong> ${data.registeredAt}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.adminUserLink}" style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View User Profile</a>
            </div>
          </div>
        </div>
      `,
      text: `New User Registration - ${data.userName}\n\nA new user has registered on Persian Hub:\n\nName: ${data.userName}\nEmail: ${data.userEmail}\nRegistered: ${data.registeredAt}\n\nView user profile: ${data.adminUserLink}`,
    }
  }

  // Verification request templates
  adminVerificationRequest(data: {
    businessName: string
    ownerName: string
    ownerEmail: string
    requestMessage: string
    adminVerificationLink: string
  }) {
    return {
      subject: `New Business Verification Request - ${data.businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Persian Hub</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Admin Notification</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">New Business Verification Request</h2>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px;">
              <p style="margin: 0; color: #92400e;"><strong>Action Required:</strong> A business owner has requested verification for their listing.</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <h3 style="color: #374151; margin-bottom: 10px;">Business Details:</h3>
              <p style="margin: 5px 0;"><strong>Business Name:</strong> ${data.businessName}</p>
              <p style="margin: 5px 0;"><strong>Owner Name:</strong> ${data.ownerName}</p>
              <p style="margin: 5px 0;"><strong>Owner Email:</strong> ${data.ownerEmail}</p>
            </div>
            
            <div style="margin-bottom: 25px;">
              <h3 style="color: #374151; margin-bottom: 10px;">Verification Request:</h3>
              <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #374151; line-height: 1.6;">${data.requestMessage}</p>
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.adminVerificationLink}" style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Review Verification Request</a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
              <p>This is an automated notification from Persian Hub Admin System.</p>
            </div>
          </div>
        </div>
      `,
      text: `New Business Verification Request - ${data.businessName}\n\nBusiness Details:\nBusiness Name: ${data.businessName}\nOwner Name: ${data.ownerName}\nOwner Email: ${data.ownerEmail}\n\nVerification Request:\n${data.requestMessage}\n\nReview the request: ${data.adminVerificationLink}`,
    }
  }

  userVerificationConfirmation(data: { businessName: string; ownerName: string; statusLink: string }) {
    return {
      subject: `Verification Request Received - ${data.businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Persian Hub</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Verification Request Confirmation</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Thank You for Your Verification Request</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">Dear ${data.ownerName},</p>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              We have received your verification request for <strong>${data.businessName}</strong>. Our admin team will review your request and respond within 2-3 business days.
            </p>
            
            <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #1e40af;"><strong>What happens next?</strong></p>
              <ul style="margin: 10px 0 0 0; color: #1e40af;">
                <li>Our team will review your business information</li>
                <li>We may contact you for additional verification documents</li>
                <li>You'll receive an email notification with our decision</li>
                <li>Verified businesses get a trust badge and improved visibility</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.statusLink}" style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Your Dashboard</a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
              <p>Thank you for being part of the Persian Hub community!</p>
            </div>
          </div>
        </div>
      `,
      text: `Verification Request Received - ${data.businessName}\n\nDear ${data.ownerName},\n\nWe have received your verification request for ${data.businessName}. Our admin team will review your request and respond within 2-3 business days.\n\nView your dashboard: ${data.statusLink}`,
    }
  }

  verificationApproved(data: { businessName: string; ownerName: string; adminNotes?: string; businessLink: string }) {
    return {
      subject: `🎉 Business Verification Approved - ${data.businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Persian Hub</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Verification Approved</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <div style="text-align: center; margin-bottom: 25px;">
              <div style="background: #dcfce7; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
                <span style="color: #059669; font-size: 40px;">✓</span>
              </div>
              <h2 style="color: #1f2937; margin: 0;">Congratulations!</h2>
            </div>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">Dear ${data.ownerName},</p>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Great news! Your business <strong>${data.businessName}</strong> has been successfully verified by our admin team.
            </p>
            
            <div style="background: #dcfce7; border-left: 4px solid #059669; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #047857;"><strong>Benefits of Verification:</strong></p>
              <ul style="margin: 10px 0 0 0; color: #047857;">
                <li>Trust badge displayed on your business listing</li>
                <li>Higher visibility in search results</li>
                <li>Increased customer confidence</li>
                <li>Priority customer support</li>
              </ul>
            </div>
            
            ${
              data.adminNotes
                ? `
            <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0;">
              <p style="margin: 0 0 5px 0; color: #0c4a6e; font-weight: bold;">Admin Notes:</p>
              <p style="margin: 0; color: #0c4a6e;">${data.adminNotes}</p>
            </div>
            `
                : ""
            }
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.businessLink}" style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Your Business</a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
              <p>Thank you for being a trusted member of the Persian Hub community!</p>
            </div>
          </div>
        </div>
      `,
      text: `🎉 Business Verification Approved - ${data.businessName}\n\nDear ${data.ownerName},\n\nGreat news! Your business ${data.businessName} has been successfully verified by our admin team.\n\n${
        data.adminNotes ? `Admin Notes: ${data.adminNotes}\n\n` : ""
      }View your business: ${data.businessLink}`,
    }
  }

  verificationRejected(data: {
    businessName: string
    ownerName: string
    rejectionReason: string
    resubmitLink: string
  }) {
    return {
      subject: `Verification Request Update - ${data.businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Persian Hub</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Verification Update</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Verification Request Update</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">Dear ${data.ownerName},</p>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Thank you for submitting a verification request for <strong>${data.businessName}</strong>. After careful review, we need additional information before we can approve your verification.
            </p>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
              <p style="margin: 0 0 5px 0; color: #92400e; font-weight: bold;">Admin Feedback:</p>
              <p style="margin: 0; color: #92400e; line-height: 1.6;">${data.rejectionReason}</p>
            </div>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Please address the feedback above and submit a new verification request. We're here to help you get verified!
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.resubmitLink}" style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Submit New Request</a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
              <p>If you have questions, please contact our support team.</p>
            </div>
          </div>
        </div>
      `,
      text: `Verification Request Update - ${data.businessName}\n\nDear ${data.ownerName},\n\nThank you for submitting a verification request for ${data.businessName}. After careful review, we need additional information before we can approve your verification.\n\nAdmin Feedback: ${data.rejectionReason}\n\nSubmit a new request: ${data.resubmitLink}`,
    }
  }

  userReviewApproved(data: {
    reviewerName: string
    businessName: string
    rating: number
    reviewExcerpt: string
    reviewLink: string
    businessLink: string
  }) {
    return {
      subject: `Your Review Has Been Approved - ${data.businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Persian Hub</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Review Approved</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Your Review is Now Live!</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">Dear ${data.reviewerName},</p>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Thank you for sharing your experience! Your review of <strong>${data.businessName}</strong> has been approved and is now visible to other users.
            </p>
            
            <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <div style="display: flex; margin-right: 10px;">
                  ${Array.from(
                    { length: 5 },
                    (_, i) =>
                      `<span style="color: ${i < data.rating ? "#fbbf24" : "#d1d5db"}; font-size: 16px;">★</span>`,
                  ).join("")}
                </div>
                <span style="color: #0c4a6e; font-weight: bold;">${data.rating}/5</span>
              </div>
              <p style="margin: 0; color: #0c4a6e; font-style: italic;">"${data.reviewExcerpt}"</p>
            </div>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Your honest feedback helps other customers make informed decisions and helps businesses improve their services.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.reviewLink}" style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-right: 10px;">View Your Review</a>
              <a href="${data.businessLink}" style="background: #6b7280; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Visit Business</a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
              <p>Thank you for contributing to the Persian Hub community!</p>
            </div>
          </div>
        </div>
      `,
      text: `Your Review Has Been Approved - ${data.businessName}\n\nDear ${data.reviewerName},\n\nThank you for sharing your experience! Your review of ${data.businessName} has been approved and is now visible to other users.\n\nRating: ${data.rating}/5\nReview: "${data.reviewExcerpt}"\n\nView your review: ${data.reviewLink}\nVisit business: ${data.businessLink}`,
    }
  }
}

const emailTemplates = new EmailTemplates()
export { emailTemplates }
export default emailTemplates
