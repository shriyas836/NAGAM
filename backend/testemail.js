import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "shriyas836@gmail.com",
        pass: "oecvijvnjslejmpg"  // Replace with actual App Password
    }
});

const mailOptions = {
    from: "shriyas3008@gmail.com",
    to: "shriyas836@gmail.com",
    subject: "Test Email",
    text: "This is a test email."
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error("❌ Email Sending Failed:", error);
    } else {
        console.log("📩 Email Sent Successfully!", info.response);
    }
});
