import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "What are the prerequisites?",
    answer: "Basic programming knowledge (Python preferred), a GitHub account, and familiarity with data structures like arrays and lists. We'll provide a quick refresher in Week 0.",
  },
  {
    question: "How much time do I need to dedicate?",
    answer: "Week 1 requires ~3-4 hours per day (5 days). Week 2 is more flexible but expect 20+ hours total for your capstone project. Most students complete it in 2 weeks.",
  },
  {
    question: "Is the certificate recognized by employers?",
    answer: "Yes! Our certificates include unique verification IDs, QR codes, and public verification pages. You'll also have a GitHub repository as proof of your work.",
  },
  {
    question: "What if I can't complete in 2 weeks?",
    answer: "No problem! While designed for 2 weeks, you get lifetime access to course materials. Most students complete within 3-4 weeks if they need extra time.",
  },
  {
    question: "Can I get a refund?",
    answer: "Yes, we offer a full refund within 48 hours of enrollment if you haven't accessed course materials. Partial refunds are evaluated case-by-case.",
  },
  {
    question: "What technology will I learn?",
    answer: "You'll work with Python, NumPy, Pandas, Scikit-learn, TensorFlow/PyTorch basics, and deployment tools like Streamlit and FastAPI. All practical, industry-standard tools.",
  },
  {
    question: "Do I need to pay for cloud computing?",
    answer: "No! We provide Google Colab starter notebooks which are free. You can also use Binder. No GPU costs required for this course.",
  },
  {
    question: "Will I get job placement support?",
    answer: "While we don't guarantee placements, you'll receive guidance on adding your project to your resume and LinkedIn. Your verified certificate and GitHub project are designed to help you stand out.",
  },
];

const FAQ = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about the certification program
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4 animate-slide-up">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-card border border-border rounded-lg px-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <AccordionTrigger className="text-left hover:text-primary hover:no-underline py-5">
                <span className="font-semibold text-lg">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
