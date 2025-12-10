import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-2">Terms and Conditions</h1>
          <p className="text-muted-foreground mb-8">Last updated: December 10, 2025</p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using the AI Certification Platform ("Platform"), you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. User Account</h2>
              <p className="text-muted-foreground">
                To access certain features, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate and complete information during registration.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Course Enrollment</h2>
              <p className="text-muted-foreground">
                Upon successful payment, you will be enrolled in the 2-week AI Certification Program. Access to course materials begins immediately after enrollment confirmation. The course must be completed within the specified cohort duration.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Payment Terms</h2>
              <p className="text-muted-foreground">
                All payments are processed securely through Razorpay. Prices are displayed in Indian Rupees (INR). The course fee is a one-time payment that grants access to all course materials, quizzes, and certification upon successful completion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
              <p className="text-muted-foreground">
                All course content, including videos, documents, quizzes, and materials, are the intellectual property of AI Certification Platform. You may not reproduce, distribute, or create derivative works without written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. User Conduct</h2>
              <p className="text-muted-foreground">
                Users must not share account credentials, distribute course materials, engage in any fraudulent activity, or use the platform for any unlawful purpose. Violation may result in immediate account termination without refund.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Certification</h2>
              <p className="text-muted-foreground">
                Certificates are issued upon successful completion of all course requirements, including quizzes and final project submission. Certificates are verifiable and contain a unique identifier for authenticity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                The Platform is provided "as is" without warranties. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability is limited to the amount paid for the course.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Modifications</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. Changes will be effective upon posting. Continued use of the platform after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
              <p className="text-muted-foreground">
                For questions regarding these Terms and Conditions, please contact us at support@aicertification.com
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsAndConditions;
