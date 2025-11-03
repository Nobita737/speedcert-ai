import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calendar, BookOpen, Wrench, Code2, Presentation, FileText } from "lucide-react";

const weekData = [
  {
    week: "Week 1",
    title: "How AI Works (Days 1–7)",
    icon: BookOpen,
    description: "Understand the technical backbone of modern AI systems.",
    days: [
      {
        day: "Day 1",
        title: "Intro to AI Systems & Terminology",
        duration: "~25 mins",
        topics: [
          "Lesson A: What is an AI system? Components & flows (video, 12m)",
          "Lesson B: Data & labels: the importance of quality datasets (pdf, 10m)",
          "Quiz: 5 questions to reinforce learning"
        ],
      },
      {
        day: "Day 2",
        title: "Model Types & When to Use Them",
        duration: "~25 mins",
        topics: [
          "Lesson A: Supervised, unsupervised, and reinforcement learning (video, 12m)",
          "Lesson B: Introduction to neural networks & representations (pdf, 10m)",
          "Quiz: 5 questions"
        ],
      },
      {
        day: "Day 3",
        title: "Training & Evaluation",
        duration: "~25 mins",
        topics: [
          "Lesson A: Training pipelines & loss functions (video, 12m)",
          "Lesson B: Metrics, validation and overfitting (quiz + reading)",
          "Quiz: 5 questions"
        ],
      },
      {
        day: "Day 4",
        title: "Data Pipelines & Feature Engineering",
        duration: "~25 mins",
        topics: [
          "Lesson A: Data preprocessing & augmentation (video)",
          "Lesson B: Feature selection & practical examples (task + checklist)",
          "Quiz: 5 questions"
        ],
      },
      {
        day: "Day 5",
        title: "Deployment & Serving",
        duration: "~25 mins",
        topics: [
          "Lesson A: Model serving concepts (APIs, batch vs real-time) (video)",
          "Lesson B: Scaling, latency, and observability basics (pdf)",
          "Quiz: 5 questions"
        ],
      },
      {
        day: "Day 6",
        title: "Automation & Integration",
        duration: "~25 mins",
        topics: [
          "Lesson A: Orchestrating tools and services (concepts, video)",
          "Lesson B: No-code integration patterns (task + example flows)",
          "Quiz: 5 questions"
        ],
      },
      {
        day: "Day 7",
        title: "Ethics, Safety & Governance",
        duration: "~25 mins",
        topics: [
          "Lesson A: Bias & fairness (case studies)",
          "Lesson B: Responsible AI & deployment checklist (quiz + doc)",
          "Quiz: 5 questions"
        ],
      },
    ],
  },
  {
    week: "Week 2",
    title: "14 Industry Tools in 7 Days (Days 8–14)",
    icon: Wrench,
    description: "Get hands-on with 14 practical, industry-grade tools and learn to orchestrate them.",
    days: [
      {
        day: "Day 8",
        title: "Tools 1 & 2",
        duration: "~30 mins",
        topics: [
          "Tool 1: Developer assistant (cursor-style tool) - task: create snippet/test plan screenshot 📤",
          "Tool 2: Prompt engineering with chat assistants - task: craft 3 optimized prompts 📤"
        ],
        hasDeliverable: true,
      },
      {
        day: "Day 9",
        title: "Tools 3 & 4",
        duration: "~30 mins",
        topics: [
          "Tool 3: Code-generation assistant - task: generate a helper script example 📤",
          "Tool 4: UI/UX AI plugin - task: export a mockup image 📤"
        ],
        hasDeliverable: true,
      },
      {
        day: "Day 10",
        title: "Tools 5 & 6",
        duration: "~30 mins",
        topics: [
          "Tool 5: Image generation platform - task: produce 3 designs (upload) 📤",
          "Tool 6: Video generation tool - task: create a 15-30s clip (upload or link) 📤"
        ],
        hasDeliverable: true,
      },
      {
        day: "Day 11",
        title: "Tools 7 & 8",
        duration: "~30 mins",
        topics: [
          "Tool 7: Voice & audio synthesis - task: produce a 30s voice clip 📤",
          "Tool 8: Automation/orchestration (n8n/Zapier-style) - task: build and screenshot a workflow 📤"
        ],
        hasDeliverable: true,
      },
      {
        day: "Day 12",
        title: "Tools 9 & 10",
        duration: "~30 mins",
        topics: [
          "Tool 9: No-code data preparation/analysis tool - task: summary CSV or screenshot 📤",
          "Tool 10: Documentation & summarization tool - task: generate a concise report 📤"
        ],
        hasDeliverable: true,
      },
      {
        day: "Day 13",
        title: "Tools 11 & 12",
        duration: "~30 mins",
        topics: [
          "Tool 11: Test & QA automation assistant - task: generate test cases or checklist 📤",
          "Tool 12: Presentation & pitch generation tool - task: export 3 slides 📤"
        ],
        hasDeliverable: true,
      },
      {
        day: "Day 14",
        title: "Tools 13 & 14",
        duration: "~30 mins",
        topics: [
          "Tool 13: Monitoring & observability primer tooling - task: annotate metric screenshot 📤",
          "Tool 14: Ethics & bias detection tooling (practical check) - task: produce a bias report summary 📤"
        ],
        hasDeliverable: true,
      },
    ],
  },
  {
    week: "Week 3",
    title: "Capstone Project (Days 15–21)",
    icon: Code2,
    description: "Build a resume-ready project by orchestrating the tools learned in Week 2.",
    info: "Week 3 unlocks 14 days after enrollment or via admin override.",
    days: [
      {
        day: "Project Flow",
        title: "Choose & Build Your Project",
        duration: "Variable",
        topics: [
          "Choose a template or propose your own use case",
          "Deliverables: Case study PDF (3–5 pages), generated assets (images/videos/screenshots), 1–2 resume bullets",
          "Projects reviewed by instructors against rubric",
          "Accepted projects receive two certificates and verified project badge"
        ],
      },
    ],
  },
];

const projectTemplates = [
  {
    title: "Automated Customer Support Workflow",
    description: "Build an end-to-end support automation using chat assistants + automation tool. Deliver a flow diagram, sample interactions, and evaluation metrics."
  },
  {
    title: "AI-Assisted Product Mockups & Pitch",
    description: "Produce a product demo using image + video generation + a pitch deck. Deliverables: demo clip + 3-slide pitch."
  },
  {
    title: "Content Summarization & Knowledge Base",
    description: "Build a searchable knowledge base using document summarization + automated ingestion. Deliverables: summary report + a small demo snippet."
  }
];

const Curriculum = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            3-Week Curriculum: Learn, Apply, Certify
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Structured, intensive learning: Week 1 explains the backend; Week 2 is tool-focused; Week 3 is a project that becomes a resume-ready artifact.
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
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white/80">{week.week}</div>
                    <h3 className="text-2xl font-bold">{week.title}</h3>
                    <p className="text-sm text-white/90 mt-1">{week.description}</p>
                  </div>
                </div>
                {week.info && (
                  <div className="mt-3 text-sm text-white/80 bg-white/10 rounded-lg px-3 py-2">
                    ℹ️ {week.info}
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <Accordion type="single" collapsible className="w-full">
                  {week.days.map((day, dayIndex) => (
                    <AccordionItem key={dayIndex} value={`item-${weekIndex}-${dayIndex}`}>
                      <AccordionTrigger className="hover:text-primary">
                        <div className="flex items-center gap-3 text-left w-full">
                          <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold flex items-center gap-2">
                              {day.day}: {day.title}
                              {day.hasDeliverable && (
                                <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-normal">
                                  Deliverable Required
                                </span>
                              )}
                            </div>
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

        {/* Project templates */}
        <Card className="mt-8 p-8 bg-gradient-to-br from-card to-secondary/30 border-2 border-primary/20">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Example Project Templates</h3>
              <p className="text-muted-foreground">Choose from pre-defined industry use cases or propose your own.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {projectTemplates.map((template, index) => (
              <Card key={index} className="p-4 bg-card hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-sm mb-2">{template.title}</h4>
                <p className="text-xs text-muted-foreground">{template.description}</p>
              </Card>
            ))}
          </div>
          <p className="text-sm text-muted-foreground italic">
            Projects are reviewed by instructors against a rubric. Accepted projects receive two certificates and a verified project badge for your resume/profile.
          </p>
        </Card>

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
                  "Resume-ready case study PDF (3–5 pages)",
                  "Generated assets (images, short video clips, automation screenshots)",
                  "Optional short video walkthrough (3–5 min)",
                  "One polished resume bullet & GitHub-style project summary (for portfolio, not mandatory)",
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