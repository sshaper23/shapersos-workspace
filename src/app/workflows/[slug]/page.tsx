"use client";

import { useState, use } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { getFlowBySlug } from "@/data/flows";
import { aiModels } from "@/data/models";
import { cn } from "@/lib/utils";
import { Mic, SendHorizontal, Check as CheckIcon } from "lucide-react";

export default function WorkflowPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const flow = getFlowBySlug(slug);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [selectedModel, setSelectedModel] = useState(aiModels[0].value);
  const [stepOutputs, setStepOutputs] = useState<Record<number, string>>({});

  if (!flow) {
    return (
      <div className="p-6">
        <PageHeader title="Workflow Not Found" subtitle="This workflow doesn't exist." />
      </div>
    );
  }

  const step = flow.steps[currentStep];

  const handleGenerate = async () => {
    // Mock generation
    const mockOutput = `## Step ${step.stepNumber}: ${step.title}\n\nHere's the generated content for this step. When connected to the API, this will be a real AI response based on your inputs and previous step context.\n\n**Key deliverables from this step:**\n- Item one\n- Item two\n- Item three`;

    setStepOutputs((prev) => ({ ...prev, [currentStep]: mockOutput }));
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
  };

  const goToNextStep = () => {
    if (currentStep < flow.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setFormValues({});
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Panel — Steps */}
      <div className="hidden md:flex w-64 bg-[hsl(0_0%_100%/0.02)] border-r border-[hsl(0_0%_100%/0.06)] flex-col">
        <div className="p-4 border-b border-[hsl(0_0%_100%/0.06)]">
          <h3 className="font-semibold text-sm">{flow.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            ~{flow.estimatedTime}
          </p>
        </div>
        <nav className="flex-1 p-2">
          {flow.steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentStep(idx);
                setFormValues({});
              }}
              className={cn(
                "w-full text-left px-3 py-3 rounded-lg mb-1 flex items-center gap-3 transition-all",
                currentStep === idx
                  ? "bg-[#71a474]/15 text-[#71a474]"
                  : completedSteps.has(idx)
                    ? "text-foreground hover:bg-[hsl(0_0%_100%/0.06)]"
                    : "text-muted-foreground hover:bg-[hsl(0_0%_100%/0.06)]"
              )}
            >
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                  currentStep === idx
                    ? "bg-[#71a474] text-white"
                    : completedSteps.has(idx)
                      ? "bg-green-500/20 text-green-400"
                      : "bg-[hsl(0_0%_100%/0.08)] text-muted-foreground"
                )}
              >
                {completedSteps.has(idx) ? (
                  <CheckIcon className="w-3 h-3" />
                ) : (
                  s.stepNumber
                )}
              </div>
              <span className="text-sm truncate">{s.title}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-[hsl(0_0%_100%/0.06)] px-4">
          <button className="px-4 py-3 text-sm font-medium text-[#71a474] border-b-2 border-[#71a474]">
            Start Workflow
          </button>
          <button className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground">
            About this Workflow
          </button>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                Step {step.stepNumber} of {flow.steps.length}
              </div>
              <h2 className="text-xl font-semibold mb-2">{step.title}</h2>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>

            {/* Step Form Fields */}
            <div className="space-y-4 mb-6">
              {step.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium mb-2">
                    {field.label}
                    {field.required && <span className="text-[#71a474] ml-1">*</span>}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      value={formValues[field.name] || ""}
                      onChange={(e) =>
                        setFormValues((p) => ({ ...p, [field.name]: e.target.value }))
                      }
                      placeholder={field.placeholder}
                      className="w-full min-h-[80px] px-4 py-3 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-[#71a474]/50 transition-colors resize-y"
                    />
                  ) : field.type === "select" ? (
                    <select
                      value={formValues[field.name] || ""}
                      onChange={(e) =>
                        setFormValues((p) => ({ ...p, [field.name]: e.target.value }))
                      }
                      className="w-full h-10 px-3 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground outline-none focus:border-[#71a474]/50 transition-colors"
                    >
                      <option value="">Select...</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-[#001144]">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type === "number" ? "number" : "text"}
                      value={formValues[field.name] || ""}
                      onChange={(e) =>
                        setFormValues((p) => ({ ...p, [field.name]: e.target.value }))
                      }
                      placeholder={field.placeholder}
                      className="w-full h-10 px-4 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-[#71a474]/50 transition-colors"
                    />
                  )}
                </div>
              ))}

              {/* Model Selector */}
              <div>
                <label className="block text-sm font-medium mb-2">AI Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full h-10 px-3 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground outline-none focus:border-[#71a474]/50 transition-colors"
                >
                  {aiModels.map((m) => (
                    <option key={m.value} value={m.value} className="bg-[#001144]">
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Generate / Output */}
            {!stepOutputs[currentStep] ? (
              <button
                onClick={handleGenerate}
                className="w-full py-3 rounded-xl bg-[#71a474] text-white font-medium hover:bg-[#71a474]/90 transition-colors"
              >
                Generate Step {step.stepNumber}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-[hsl(0_0%_100%/0.04)] rounded-xl p-6 border border-[hsl(0_0%_100%/0.06)]">
                  <div className="prose prose-sm prose-invert max-w-none text-sm whitespace-pre-wrap">
                    {stepOutputs[currentStep]}
                  </div>
                </div>
                {currentStep < flow.steps.length - 1 && (
                  <button
                    onClick={goToNextStep}
                    className="w-full py-3 rounded-xl bg-[#71a474] text-white font-medium hover:bg-[#71a474]/90 transition-colors"
                  >
                    Next Step: {flow.steps[currentStep + 1].title}
                  </button>
                )}
                {currentStep === flow.steps.length - 1 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-green-400 font-medium">
                      Workflow Complete! All steps have been generated.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
