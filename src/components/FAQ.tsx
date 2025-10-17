import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is the time commitment?",
    answer: "About 2–3 hours per day for the first two weeks. Week 3 is project-focused and may require additional time depending on the chosen capstone.",
  },
  {
    question: "Do I need to know coding or Python?",
    answer: "No. This program is designed to be zero-code. All tool exercises and the capstone use GUI-based tools and no programming is required.",
  },
  {
    question: "What will I receive after completion?",
    answer: "Two downloadable PDFs: an AI Certified certificate and a Project Completion certificate. Each contains a unique verification ID and QR code.",
  },
  {
    question: "Is the certificate verifiable by employers?",
    answer: "Yes — each certificate includes a unique ID and a verification URL/QR code where employers can confirm authenticity.",
  },
  {
    question: "When does Week 3 unlock?",
    answer: "Week 3 automatically unlocks 14 days after enrollment. Admin can unlock earlier in special cases.",
  },
  {
    question: "Can I work in a team for the capstone?",
    answer: "Yes. Teams of 1–4 are allowed. Team formation requires approval by an instructor or admin.",
  },
  {
    question: "What if I need a refund?",
    answer: "Refunds are handled per the platform policy — contact support for details on refund requests and eligibility.",
  },
  {
    question: "Will this improve my job prospects?",
    answer: "The course is focused on practical, demonstrable outcomes. The resume-ready project and verifiable certificates are designed to strengthen your job applications.",
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