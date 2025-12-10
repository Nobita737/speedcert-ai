import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-2">Refund & Cancellation Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: December 10, 2025</p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Refund Eligibility</h2>
              <p className="text-muted-foreground mb-4">You may be eligible for a refund if:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>You request a refund within 48 hours of enrollment</li>
                <li>You have not accessed more than 20% of the course content</li>
                <li>You have not attempted any quizzes or submitted projects</li>
                <li>Technical issues prevented you from accessing the course (verified by our team)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Refund Process</h2>
              <p className="text-muted-foreground mb-4">To request a refund:</p>
              <ol className="list-decimal pl-6 text-muted-foreground space-y-2">
                <li>Email us at refunds@aicertification.com with your registered email and order ID</li>
                <li>Provide a reason for the refund request</li>
                <li>Our team will review your request within 2-3 business days</li>
                <li>If approved, the refund will be processed to your original payment method</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Refund Timeline</h2>
              <p className="text-muted-foreground">
                Once approved, refunds are processed within 5-7 business days. The actual credit to your account depends on your bank or payment provider and may take an additional 3-5 business days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Non-Refundable Conditions</h2>
              <p className="text-muted-foreground mb-4">Refunds will NOT be provided if:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>More than 48 hours have passed since enrollment</li>
                <li>You have accessed more than 20% of course content</li>
                <li>You have attempted quizzes or submitted a project</li>
                <li>A certificate has been issued to you</li>
                <li>Your account was terminated due to policy violations</li>
                <li>The refund request is made after course completion</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Cancellation Policy</h2>
              <p className="text-muted-foreground">
                You may cancel your enrollment at any time by contacting support. However, cancellation after the 48-hour refund window does not entitle you to a refund. Upon cancellation, your access to course materials will be revoked immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Coupon and Discount Refunds</h2>
              <p className="text-muted-foreground">
                If you used a coupon or discount code, the refund amount will be the actual amount paid after the discount was applied. Referral points earned through your enrollment will be deducted upon refund.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Certificate Policy</h2>
              <p className="text-muted-foreground">
                Certificates are issued only upon successful completion of all course requirements. Once a certificate is issued, no refund will be provided. Certificates cannot be revoked once issued unless obtained through fraudulent means.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Exceptions</h2>
              <p className="text-muted-foreground">
                We may consider refund requests outside these guidelines on a case-by-case basis for extenuating circumstances such as medical emergencies or technical failures on our end. Supporting documentation may be required.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Contact for Refunds</h2>
              <p className="text-muted-foreground">
                For refund-related queries, email us at refunds@aicertification.com with subject line "Refund Request - [Your Order ID]". Our support team is available Monday to Friday, 9 AM to 6 PM IST.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RefundPolicy;
