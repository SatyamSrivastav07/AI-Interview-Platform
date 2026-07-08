import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getMyResume, uploadResume } from "../api/resumeApi.js";
import AnalysisCard from "../components/AnalysisCard.jsx";
import BadgeList from "../components/BadgeList.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Loader from "../components/Loader.jsx";
import Navbar from "../components/Navbar.jsx";
import Skeleton from "../components/Skeleton.jsx";

const allowedTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const allowedExtensions = [".pdf", ".docx"];
const maxFileSize = 10 * 1024 * 1024;

const validateFile = (selectedFile) => {
  if (!selectedFile) {
    return "Choose a resume file first";
  }

  const fileExtension = selectedFile.name.slice(selectedFile.name.lastIndexOf(".")).toLowerCase();

  if (!allowedTypes.includes(selectedFile.type) && !allowedExtensions.includes(fileExtension)) {
    return "Only PDF and DOCX files are allowed";
  }

  if (selectedFile.size > maxFileSize) {
    return "Resume file cannot exceed 10MB";
  }

  return null;
};

const TextBlock = ({ text, emptyText = "No data extracted yet" }) => (
  <div className="max-h-56 overflow-y-auto rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">
    {text ? <p className="whitespace-pre-wrap">{text}</p> : <p className="text-slate-500">{emptyText}</p>}
  </div>
);

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [resume, setResume] = useState(null);
  const [loadingResume, setLoadingResume] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const loadResume = async () => {
      try {
        const { data } = await getMyResume();
        setResume(data.resume);
      } catch (error) {
        if (error.response?.status !== 404) {
          toast.error(error.response?.data?.message || "Could not load resume analysis");
        }
      } finally {
        setLoadingResume(false);
      }
    };

    loadResume();
  }, []);

  const summary = useMemo(() => {
    if (!resume?.extractedText) {
      return "";
    }

    return resume.extractedText.length > 700 ? `${resume.extractedText.slice(0, 700)}...` : resume.extractedText;
  }, [resume]);

  const handleSelectedFile = (selectedFile) => {
    const validationError = validateFile(selectedFile);

    if (validationError) {
      toast.error(validationError);
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateFile(file);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    setUploading(true);
    setUploadProgress(0);

    try {
      const { data } = await uploadResume(formData, (event) => {
        if (event.total) {
          setUploadProgress(Math.round((event.loaded * 100) / event.total));
        }
      });
      toast.success("Resume uploaded successfully");
      setResume(data.resume);
      setFile(null);
      event.target.reset();
    } catch (error) {
      toast.error(error.response?.data?.message || "Resume upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-shell">
      <Navbar />
      <main className="content-shell">
        <section className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand">Resume</p>
          <h1 className="mt-3 text-3xl font-bold text-ink">Resume Analysis</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Upload a resume and review the extracted skills, strengths, weak areas, projects, and interview topics.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <form onSubmit={handleSubmit} className="panel p-6">
            <div
              className={`grid min-h-64 cursor-pointer place-items-center rounded-lg border-2 border-dashed p-6 text-center transition ${
                isDragging ? "border-brand bg-blue-50" : "border-slate-300 bg-slate-50 hover:border-brand"
              }`}
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                handleSelectedFile(event.dataTransfer.files?.[0]);
              }}
            >
              <div>
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-md bg-white text-xl font-bold text-brand shadow-sm">
                  ↑
                </div>
                <h2 className="mt-5 text-lg font-bold text-ink">Drop your resume here</h2>
                <p className="mt-2 text-sm text-slate-600">or click to browse PDF/DOCX files up to 10MB</p>
                <p className="mt-4 text-sm font-medium text-slate-700">
                  {file ? file.name : "No file selected"}
                </p>
              </div>
            </div>
            <input
              ref={inputRef}
              className="hidden"
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(event) => handleSelectedFile(event.target.files?.[0])}
            />

            {uploading && (
              <div className="mt-5">
                <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                  <span>Uploading</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-brand transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
                <Loader label="Analyzing resume" />
              </div>
            )}

            <button type="submit" className="primary-button mt-5 w-full" disabled={uploading || !file}>
              {uploading ? "Uploading..." : "Upload and Analyze"}
            </button>
          </form>

          <div className="panel p-6">
            <h2 className="text-lg font-bold text-ink">Current resume</h2>
            {loadingResume ? (
              <div className="mt-5 space-y-3">
                <Skeleton className="h-5 w-52" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            ) : resume ? (
              <div className="mt-5 grid gap-3 text-sm text-slate-600">
                <p>
                  <span className="font-semibold text-ink">File:</span> {resume.originalFileName}
                </p>
                <p>
                  <span className="font-semibold text-ink">Uploaded:</span>{" "}
                  {resume.uploadDate ? new Date(resume.uploadDate).toLocaleString() : "Unknown"}
                </p>
                <p>
                  <span className="font-semibold text-ink">Size:</span>{" "}
                  {resume.fileSize ? `${Math.round(resume.fileSize / 1024)} KB` : "Unknown"}
                </p>
              </div>
            ) : (
              <div className="mt-5">
                <EmptyState
                  title="No resume uploaded"
                  description="Upload a PDF or DOCX resume to unlock skills, weak areas, projects, and interview topics."
                />
              </div>
            )}
          </div>
        </section>

        {resume && (
          <section className="mt-8 grid gap-5 lg:grid-cols-2">
            <AnalysisCard title="Summary" className="lg:col-span-2">
              <TextBlock text={summary} emptyText="No extracted summary available" />
            </AnalysisCard>
            <AnalysisCard title="Skills">
              <BadgeList items={resume.skills} />
            </AnalysisCard>
            <AnalysisCard title="Programming Languages">
              <BadgeList items={resume.programmingLanguages} tone="teal" />
            </AnalysisCard>
            <AnalysisCard title="Frameworks">
              <BadgeList items={resume.frameworks} tone="blue" />
            </AnalysisCard>
            <AnalysisCard title="Databases">
              <BadgeList items={resume.databases} tone="amber" />
            </AnalysisCard>
            <AnalysisCard title="Tools">
              <BadgeList items={resume.tools} tone="slate" />
            </AnalysisCard>
            <AnalysisCard title="Projects">
              <BadgeList items={resume.projects} tone="teal" />
            </AnalysisCard>
            <AnalysisCard title="Strengths">
              <BadgeList items={resume.strengths} tone="blue" />
            </AnalysisCard>
            <AnalysisCard title="Weak Areas">
              <BadgeList items={resume.weakAreas} tone="rose" />
            </AnalysisCard>
            <AnalysisCard title="Suggested Interview Topics" className="lg:col-span-2">
              <BadgeList items={resume.suggestedInterviewTopics} tone="amber" />
            </AnalysisCard>
            <AnalysisCard title="Education">
              <TextBlock text={resume.education} />
            </AnalysisCard>
            <AnalysisCard title="Experience">
              <TextBlock text={resume.experience} />
            </AnalysisCard>
          </section>
        )}
      </main>
    </div>
  );
};

export default ResumeUpload;
