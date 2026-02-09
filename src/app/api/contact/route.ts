import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json()

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Log the message (in production, you would send an email or save to database)
    console.log("Contact form submission:", { name, email, message, timestamp: new Date().toISOString() })

    // In production, integrate with email service like SendGrid, Resend, or save to database
    // Example with SendGrid:
    // await sendEmail({
    //   to: "support@shipforge.dev",
    //   subject: `Contact Form: ${name}`,
    //   text: `From: ${name} <${email}>\n\n${message}`
    // })

    // Track in analytics if needed
    // gtag('event', 'contact_form_submit')

    return NextResponse.json(
      { message: "Message sent successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}
