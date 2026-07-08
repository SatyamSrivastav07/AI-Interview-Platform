import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { getInterview, submitAnswer } from "../api/interviewApi.js";
import ErrorState from "../components/ErrorState.jsx";
import Loader from "../components/Loader.jsx";
import LoadingButton from "../components/LoadingButton.jsx";
import Navbar from "../components/Navbar.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import QuestionCard from "../components/QuestionCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import Skeleton from "../components/Skeleton.jsx";
import Timer from "../components/Timer.jsx";

const idealAnswerLabel = "Ideal answer";

const hasSubmittedAnswer = (question) => Boolean(question?.userAnswer?.trim());

const normalizeQuestion = (question, updates = {}) => ({
  ...question,
  ...updates,
  strengths: updates.strengths || question.strengths || [],
  improvements: updates.improvements || question.improvements || [],
});

const InterviewSession = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedIdealAnswers, setExpandedIdealAnswers] = useState({});
  const [error, setError] = useState("");

  const loadInterview = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await getInterview(interviewId);
      const loadedInterview = data.interview;

      setInterview(loadedInterview);
      setAnswer(loadedInterview?.questions?.[0]?.userAnswer || "");
    } catch (loadError) {
      const message = loadError.response?.data?.message || "Could not load interview";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [interviewId]);

  useEffect(() => {
    loadInterview();
  }, [loadInterview]);

  const questions = interview?.questions || [];
  const currentQuestion = questions[currentIndex];
  const isSubmitted = hasSubmittedAnswer(currentQuestion);
  const answeredCount = useMemo(() => questions.filter(hasSubmittedAnswer).length, [questions]);
  const isLastQuestion = currentIndex === questions.length - 1;
  const canGoNext = isSubmitted && !isLastQuestion;
  const canFinish = questions.length > 0 && answeredCount === questions.length;

  const syncAnswerForIndex = (nextIndex) => {
    setCurrentIndex(nextIndex);
    setAnswer(questions[nextIndex]?.userAnswer || "");
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      syncAnswerForIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      syncAnswerForIndex(currentIndex + 1);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!currentQuestion || isSubmitted) {
      return;
    }

    if (!answer.trim()) {
      toast.error("Write an answer before submitting");
      return;
    }

    setSubmitting(true);

    try {
      const { data } = await submitAnswer(interviewId, {
        questionId: currentQuestion.id,
        userAnswer: answer.trim(),
      });
      const evaluatedQuestion = normalizeQuestion(currentQuestion, data.question);

      setInterview((current) => ({
        ...current,
        questions: current.questions.map((question, index) => (index === currentIndex ? evaluatedQuestion : question)),
      }));
      setAnswer(evaluatedQuestion.userAnswer || "");
      toast.success("Answer submitted and evaluated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not submit answer");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleIdealAnswer = (questionId) => {
    setExpandedIdealAnswers((current) => ({
      ...current,
      [questionId]: !current[questionId],
    }));
  };

  const handleFinish = () => {
    if (canFinish) {
      toast.success("Interview completed");
      navigate(`/interview/${interviewId}/result`);
    }
  };

  return (
    <div className="page-shell">
      <Navbar />
      <main className="content-shell">
        {loading ? (
          <section className="grid gap-6 lg:grid-cols-[1fr_18rem]">
            <div className="panel p-6">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="mt-6 h-32 w-full" />
              <Skeleton className="mt-6 h-44 w-full" />
            </div>
            <div className="panel p-6">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="mt-5 h-28 w-full" />
            </div>
          </section>
        ) : error ? (
          <ErrorState title="Interview unavailable" message={error} onRetry={loadInterview} />
        ) : !interview || questions.length === 0 ? (
          <ErrorState
            title="Interview unavailable"
            message="This interview could not be loaded. Return to history and choose another generated interview."
          />
        ) : (
          <>
            <SectionHeader
              eyebrow="Live Interview"
              title={interview.role}
              description={`${interview.interviewType} interview for ${interview.experienceLevel} level candidates.`}
              actions={<Timer running={!canFinish} />}
            />

            <section className="grid gap-6 lg:grid-cols-[1fr_18rem]">
              <div className="grid gap-5">
                <div className="panel p-5">
                  <ProgressBar current={currentIndex + 1} total={questions.length} answered={answeredCount} />
                </div>

                <QuestionCard question={currentQuestion} />

                <form onSubmit={handleSubmit} className="panel p-6">
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="answer" className="text-lg font-bold text-ink">
                      Your answer
                    </label>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                      {answer.length} characters
                    </span>
                  </div>
                  <textarea
                    id="answer"
                    className="mt-4 min-h-56 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-brand focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-600"
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    placeholder="Answer as if you are speaking to the interviewer..."
                    disabled={isSubmitted || submitting}
                  />

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button type="button" className="secondary-button" onClick={handlePrevious} disabled={currentIndex === 0}>
                      Previous
                    </button>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <LoadingButton type="submit" loading={submitting} loadingText="Evaluating..." disabled={isSubmitted}>
                        {isSubmitted ? "Submitted" : "Submit Answer"}
                      </LoadingButton>
                      {isLastQuestion ? (
                        <button type="button" className="primary-button" onClick={handleFinish} disabled={!canFinish}>
                          Finish Interview
                        </button>
                      ) : (
                        <button type="button" className="secondary-button" onClick={handleNext} disabled={!canGoNext}>
                          Next Question
                        </button>
                      )}
                    </div>
                  </div>

                  {submitting && <Loader label="Evaluating answer" />}
                </form>

                {isSubmitted && (
                  <section className="panel p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-brand">AI Evaluation</p>
                        <h2 className="mt-2 text-2xl font-bold text-ink">Score: {currentQuestion.score || 0}%</h2>
                      </div>
                      <span className="rounded-md bg-teal-50 px-3 py-1.5 text-sm font-bold text-teal-700 ring-1 ring-teal-100">
                        Submitted
                      </span>
                    </div>

                    <div className="mt-5 grid gap-5">
                      <div>
                        <h3 className="text-sm font-bold text-ink">Feedback</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{currentQuestion.feedback || "No feedback returned."}</p>
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <h3 className="text-sm font-bold text-ink">Strengths</h3>
                          <ul className="mt-2 grid gap-2 text-sm leading-6 text-slate-600">
                            {(currentQuestion.strengths || []).map((item) => (
                              <li key={item} className="rounded-md bg-teal-50 px-3 py-2 text-teal-800">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-ink">Improvements</h3>
                          <ul className="mt-2 grid gap-2 text-sm leading-6 text-slate-600">
                            {(currentQuestion.improvements || []).map((item) => (
                              <li key={item} className="rounded-md bg-amber-50 px-3 py-2 text-amber-800">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {currentQuestion.idealAnswer && (
                        <div>
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => toggleIdealAnswer(currentQuestion.id)}
                          >
                            {expandedIdealAnswers[currentQuestion.id] ? "Hide" : "Show"} {idealAnswerLabel}
                          </button>
                          {expandedIdealAnswers[currentQuestion.id] && (
                            <p className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                              {currentQuestion.idealAnswer}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </div>

              <aside className="panel h-fit p-5">
                <h2 className="text-base font-bold text-ink">Question list</h2>
                <div className="mt-4 grid gap-2">
                  {questions.map((question, index) => {
                    const submitted = hasSubmittedAnswer(question);
                    const isActive = index === currentIndex;

                    return (
                      <button
                        key={question.id}
                        type="button"
                        className={`rounded-md border px-3 py-2 text-left text-sm transition ${
                          isActive
                            ? "border-brand bg-blue-50 text-brand"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                        onClick={() => {
                          if (index <= currentIndex || submitted) {
                            syncAnswerForIndex(index);
                          }
                        }}
                        disabled={index > currentIndex && !submitted}
                      >
                        <span className="font-bold">Q{question.id}</span>
                        <span className="ml-2">{submitted ? "Submitted" : index === currentIndex ? "Current" : "Locked"}</span>
                      </button>
                    );
                  })}
                </div>
              </aside>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default InterviewSession;
