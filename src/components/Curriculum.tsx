import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calendar, BookOpen, Code2, Presentation } from "lucide-react";

const weekData = [
  {
    week: "Week 1",
    title: "Intensive Learning Sprint",
    icon: BookOpen,
    days: [
      {
        day: "Day 1",
        title: "Foundations & Python for ML",
        duration: "3 hours",
        topics: ["Probability & linear algebra", "Python review (numpy, pandas)", "Lab: EDA exercise"],
      },
      {
        day: "Day 2",
        title: "Supervised Learning Essentials",
        duration: "3 hours",
        topics: ["Linear & logistic regression", "Decision trees", "Lab: Build classifier"],
      },
      {
        day: "Day 3",
        title: "Feature Engineering & Pipelines",
        duration: "3 hours",
        topics: ["Data cleaning techniques", "Categorical handling", "Lab: Feature pipeline"],
      },
      {
        day: "Day 4",
        title: "Deep Learning & Transfer Learning",
        duration: "3-4 hours",
        topics: ["Neural networks basics", "Transfer learning", "Lab: Fine-tune pretrained model"],
      },
      {
        day: "Day 5",
        title: "Deployment & Ethics",
        duration: "3 hours",
        topics: ["Model deployment (Streamlit/FastAPI)", "Responsible AI", "Lab: Deploy demo app"],
      },
    ],
  },
  {
    week: "Week 2",
    title: "Capstone Project & Certification",
    icon: Code2,
    days: [
      {
        day: "Days 1-5",
        title: "Build Your Capstone",
        duration: "20+ hours",
        topics: [
          "Choose track: NLP, Computer Vision, or Tabular",
          "Implement end-to-end pipeline",
          "Create GitHub repository",
          "Record demo video",
        ],
      },
      {
        day: "Day 6",
        title: "Submission",
        duration: "2 hours",
        topics: ["Submit GitHub repo", "Upload project report", "Share demo video"],
      },
      {
        day: "Day 7",
        title: "Grading & Certificate",
        duration: "Variable",
        topics: ["Automated + manual grading", "Receive feedback", "Certificate issuance"],
      },
    ],
  },
];

const Curriculum = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            2-Week Curriculum
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Intensive, structured learning designed for maximum impact in minimum time.
          </p>
        </div>

        <div className="space-y-8 animate-slide-up">
          {weekData.map((week, weekIndex) => (
            <Card key={weekIndex} className="overflow-hidden shadow-lg">
              <div className="bg-gradient-primary p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <week.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white/80">{week.week}</div>
                    <h3 className="text-2xl font-bold">{week.title}</h3>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <Accordion type="single" collapsible className="w-full">
                  {week.days.map((day, dayIndex) => (
                    <AccordionItem key={dayIndex} value={`item-${weekIndex}-${dayIndex}`}>
                      <AccordionTrigger className="hover:text-primary">
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold">{day.day}: {day.title}</div>
                            <div className="text-sm text-muted-foreground">{day.duration}</div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="ml-11 space-y-2 mt-2">
                          {day.topics.map((topic, topicIndex) => (
                            <li key={topicIndex} className="flex items-start gap-2 text-muted-foreground">
                              <span className="text-primary mt-1">•</span>
                              <span>{topic}</span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </Card>
          ))}
        </div>

        {/* Capstone deliverables */}
        <Card className="mt-8 p-8 bg-gradient-accent">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <Presentation className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Capstone Deliverables</h3>
              <p className="text-muted-foreground mb-4">What you'll build and submit:</p>
              <ul className="space-y-2">
                {[
                  "GitHub repository with clean, documented code",
                  "One-page project report with insights",
                  "3-5 minute demo video (optional but recommended)",
                  "Hosted demo link or Jupyter notebook",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default Curriculum;
